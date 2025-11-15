import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  FunctionCallingMode,
  GenerateContentStreamResult,
  GenerateContentResult,
  GenerativeModel,
  Content,
  Part,
  FunctionCall,
  SchemaType,
} from '@google/generative-ai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';

// A type that mirrors Google's FunctionCall but is easier to work with internally
type InternalFunctionCall = {
  name: string;
  args: any;
};
/**
 * Validates an API key by listing available models.
 */
export async function listModels(baseUrl: string, apiKey: string) {
  try {
    // The Google SDK doesn't have a direct `listModels` method.
    // We can validate the key by instantiating the client and attempting a basic operation.
    // Here, we'll just instantiate and assume success if no error is thrown.
    // The baseUrl is not used by the Google SDK client directly.
    const genAI = new GoogleGenerativeAI(apiKey);
    // This will throw an error if the API key is invalid on the first API call.
    // Since there's no listModels, we'll try getting a model.
    genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Since we cannot dynamically list models, return a predefined list of common models.
    const staticModels = [
      { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
    ];
    return staticModels.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error: any) {
    console.error("Failed to validate API key with Google:", error);
    if (error.message.includes('API key not valid')) {
      throw new Error("Authentication failed. Please check your API key.");
    }
    throw new Error("Could not connect to the AI provider. Please check your API key and network.");
  }
}
/**
 * ChatHandler - Handles all chat-related operations
 *
 * This class encapsulates the OpenAI integration and tool execution logic,
 * making it easy for AI developers to understand and extend the functionality.
 */
export class ChatHandler {
  private client: GenerativeModel;
  private modelName: string;

  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    // aiGatewayUrl is not used by the Google SDK in this manner
    const genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = model;
    this.client = genAI.getGenerativeModel({
      model: this.modelName,
      // Safety settings can be configured here if needed
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    console.log("Using Google Model:", model);
  }
  /**
   * Process a user message and generate AI response with optional tool usage
   */
  async processMessage(
    message: string,
    conversationHistory: Message[],
    env: any,
    onChunk?: (chunk: string) => void,
    customSystemPrompt?: string
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    const { system, history } = this.buildConversationMessages(message, conversationHistory, customSystemPrompt);
    const toolDefinitions = await getToolDefinitions();
    const tools = toolDefinitions.map(t => {
      const parameters = t.function.parameters;
      const transformedProperties = parameters.properties ? Object.fromEntries(
        Object.entries(parameters.properties).map(([key, value]: [string, any]) => [
          key,
          { ...value, type: value.type.toUpperCase() as SchemaType }
        ])
      ) : {};

      return {
        name: t.function.name,
        description: t.function.description,
        parameters: {
          ...parameters,
          type: parameters.type.toUpperCase() as SchemaType,
          properties: transformedProperties,
        },
      };
    });

    const chat = this.client.startChat({
      history,
      tools: [{ functionDeclarations: tools }],
      systemInstruction: {
        role: 'user',
        parts: [{ text: system }],
      },
    });

    if (onChunk) {
      // Use streaming with callback
      const result = await chat.sendMessageStream(message);
      return this.handleStreamResponse(result, onChunk, env);
    }

    // Non-streaming response
    const result = await chat.sendMessage(message);
    return this.handleNonStreamResponse(result, env);
  }
  private async handleStreamResponse(
    result: GenerateContentStreamResult,
    onChunk: (chunk: string) => void,
    env: any
  ) {
    let fullContent = '';
    const accumulatedToolCalls: InternalFunctionCall[] = [];

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullContent += text;
        onChunk(text);
      }

      const functionCalls = chunk.functionCalls();
      if (functionCalls) {
        for (const fc of functionCalls) {
          accumulatedToolCalls.push({ name: fc.name, args: fc.args });
        }
      }
    }

    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls, env);
      const finalResponse = await this.generateToolResponse(executedTools);
      // Since the final response after tool calls is not streamed, we send it in one chunk.
      onChunk(finalResponse);
      return { content: finalResponse, toolCalls: executedTools };
    }

    return { content: fullContent };
  }
  private async handleNonStreamResponse(result: GenerateContentResult, env: any) {
    const response = result.response;
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const internalCalls: InternalFunctionCall[] = functionCalls.map(fc => ({ name: fc.name, args: fc.args }));
      const executedTools = await this.executeToolCalls(internalCalls, env);
      const finalResponse = await this.generateToolResponse(executedTools);
      return { content: finalResponse, toolCalls: executedTools };
    }

    return { content: response.text() };
  }
  /**
   * Execute all tool calls from OpenAI response
   */
  private async executeToolCalls(functionCalls: InternalFunctionCall[], env: any): Promise<ToolCall[]> {
    return Promise.all(
      functionCalls.map(async (fc, i) => {
        try {
          const result = await executeTool(fc.name, fc.args, env);
          return {
            id: `tool_${Date.now()}_${i}`, // Google doesn't provide IDs, so we generate one
            name: fc.name,
            arguments: fc.args,
            result
          };
        } catch (error) {
          console.error(`Tool execution failed for ${fc.name}:`, error);
          return {
            id: `tool_${Date.now()}_${i}`,
            name: fc.name,
            arguments: fc.args,
            result: { error: `Failed to execute ${fc.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }
  /**
   * Generate final response after tool execution
   */
  private async generateToolResponse(toolResults: ToolCall[]): Promise<string> {
    const toolParts: Part[] = toolResults.map(toolResult => ({
      functionResponse: {
        name: toolResult.name,
        response: {
          name: toolResult.name,
          content: toolResult.result,
        },
      },
    }));

    const result = await this.client.generateContent({
      contents: [{ role: 'function', parts: toolParts }],
    });

    return result.response.text();
  }
  /**
   * Build conversation messages for OpenAI API
   */
  private buildConversationMessages(userMessage: string, history: Message[], customSystemPrompt?: string): { system: string, history: Content[] } {
    const defaultSystemPrompt = 'You are a helpful AI assistant that helps users build and deploy web applications. You provide clear, concise guidance on development, deployment, and troubleshooting. Keep responses practical and actionable.';
    
    const system = customSystemPrompt || defaultSystemPrompt;

    const googleHistory: Content[] = history.slice(-5).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // The latest user message is handled by `sendMessage`, not included in history.
    return { system, history: googleHistory };
  }
  /**
   * Update the model for this chat handler
   */
  updateModel(newModel: string): void {
    // This is more complex with the Google SDK as the client is tied to the model.
    // For simplicity, we'll log a warning. A full implementation would require
    // re-instantiating the ChatHandler or the client.
    console.warn(`Model switching to ${newModel} is not fully supported without re-initialization.`);
    this.modelName = newModel;
    // In a real app, you might re-initialize the client here, which requires access to the API key.
  }
}