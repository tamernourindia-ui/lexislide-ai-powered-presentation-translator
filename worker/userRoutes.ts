import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
import { ChatHandler, listModels } from "./chat";
/**
 * DO NOT MODIFY THIS FUNCTION. Only for your reference.
 */
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // Use this API for conversations. **DO NOT MODIFY**
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId); // Get existing agent or create a new one if it doesn't exist, with sessionId as the name
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Add your routes here
    /**
     * List all chat sessions
     * GET /api/sessions
     */
    app.get('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const sessions = await controller.listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve sessions'
            }, { status: 500 });
        }
    });
    /**
     * Create a new chat session
     * POST /api/sessions
     * Body: { title?: string, sessionId?: string }
     */
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            // Generate better session titles
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40
                        ? cleanMessage.slice(0, 37) + '...'
                        : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({
                success: true,
                data: { sessionId, title: sessionTitle }
            });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({
                success: false,
                error: 'Failed to create session'
            }, { status: 500 });
        }
    });
    /**
     * Delete a chat session
     * DELETE /api/sessions/:sessionId
     */
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({
                success: false,
                error: 'Failed to delete session'
            }, { status: 500 });
        }
    });
    /**
     * Update session title
     * PUT /api/sessions/:sessionId/title
     * Body: { title: string }
     */
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') {
                return c.json({
                    success: false,
                    error: 'Title is required'
                }, { status: 400 });
            }
            const controller = getAppController(c.env);
            const updated = await controller.updateSessionTitle(sessionId, title);
            if (!updated) {
                return c.json({
                    success: false,
                    error: 'Session not found'
                }, { status: 404 });
            }
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({
                success: false,
                error: 'Failed to update session title'
            }, { status: 500 });
        }
    });
    /**
     * Get session count and stats
     * GET /api/sessions/stats
     */
    app.get('/api/sessions/stats', async (c) => {
        try {
            const controller = getAppController(c.env);
            const count = await controller.getSessionCount();
            return c.json({
                success: true,
                data: { totalSessions: count }
            });
        } catch (error) {
            console.error('Failed to get session stats:', error);
            return c.json({
                success: false,
                error: 'Failed to retrieve session stats'
            }, { status: 500 });
        }
    });
    /**
     * Clear all chat sessions
     * DELETE /api/sessions
     */
    app.delete('/api/sessions', async (c) => {
        try {
            const controller = getAppController(c.env);
            const deletedCount = await controller.clearAllSessions();
            return c.json({
                success: true,
                data: { deletedCount }
            });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({
                success: false,
                error: 'Failed to clear all sessions'
            }, { status: 500 });
        }
    });
    // New endpoint to validate API key
    app.post('/api/validate-key', async (c) => {
        try {
            const { apiKey } = await c.req.json();
            if (!apiKey) {
                return c.json({ success: false, error: 'API key is required' }, { status: 400 });
            }
            const models = await listModels(c.env.CF_AI_BASE_URL, apiKey);
            return c.json({ success: true, data: { models } });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            return c.json({ success: false, error: errorMessage }, { status: 401 });
        }
    });
    // Updated translation endpoint
    app.post('/api/translate', async (c) => {
        try {
            const { sourceMaterial, textContent, specializedField, apiKey, model } = await c.req.json();
            if (!apiKey || !model) {
                return c.json({ success: false, error: 'API key and model are required' }, { status: 400 });
            }
            if (!sourceMaterial) {
                return c.json({ success: false, error: 'Source material is required' }, { status: 400 });
            }
            if (!textContent) {
                return c.json({ success: false, error: 'Text content for translation is required' }, { status: 400 });
            }
            const field = specializedField || 'General Academic';
            const chatHandler = new ChatHandler(
                c.env.CF_AI_BASE_URL,
                apiKey, // Use user-provided key
                model   // Use user-selected model
            );
            const systemPrompt = `You are an expert translator specializing in academic texts, specifically in the field of ${field}. Your task is to translate English presentation content into professional, academic Persian.
            **CRITICAL RULES:**
            1.  **Translate ONLY the provided text.**
            2.  If a specialized term has no direct, commonly-used Persian equivalent, **keep it in English.**
            3.  For specialized terms, provide the Persian translation followed by the original English term in parentheses for clarity. Example: "فشار داخل چشمی (Intraocular Pressure)".
            4.  Use formal, academic, and precise medical Persian terminology. Avoid colloquialisms.
            5.  Ensure all translated text is grammatically correct, fluent, and uses an appropriate academic tone for the specified field.
            6.  The context for this translation is a presentation based on the book/article: "${sourceMaterial}". Use this context to inform your terminology choices.
            7.  Your entire response should be ONLY the translated Persian text. Do not add any explanations, greetings, or apologies.
            8.  Preserve the paragraph structure. If the input has text blocks separated by double newlines, the output should have the same structure.`;
            const originalBlocks = textContent.split('\n\n');
            const response = await chatHandler.processMessage(
                textContent,
                [], // No conversation history for this one-off task
                undefined, // No streaming
                systemPrompt // Custom system prompt
            );
            const translatedBlocks = response.content.split('\n\n');
            // **INTEGRITY CHECK**
            if (originalBlocks.length !== translatedBlocks.length) {
                throw new Error(`Translation integrity check failed. The AI returned a different number of text blocks (${translatedBlocks.length}) than expected (${originalBlocks.length}). Please try again.`);
            }
            const stats = {
                source: sourceMaterial,
                field: field,
            };
            return c.json({
                success: true,
                data: {
                    translatedContent: response.content,
                    statistics: stats,
                }
            });
        } catch (error) {
            console.error('Translation endpoint error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to process translation';
            return c.json({ success: false, error: errorMessage }, { status: 500 });
        }
    });
}