import { create } from 'zustand';
import { toast } from 'sonner';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextFromPptx, replaceTextInPptx } from '@/lib/pptx-processor';
type Step = 'apiKeySetup' | 'upload' | 'processing' | 'results';
interface Terminology {
  english: string;
  persian: string;
}
interface ProcessingStats {
  slides: number;
  textBlocks: number;
  terms: number;
  source: string;
  field: string;
  translatedContent?: string;
  fileName?: string;
  translatedFileUrl?: string;
  terminology: Terminology[];
}
interface AiModel {
  id: string;
  name: string;
}
interface LexiSlideState {
  step: Step;
  apiKey: string;
  isApiKeyValid: boolean;
  isApiKeyLoading: boolean;
  apiKeyError: string | null;
  availableModels: AiModel[];
  selectedModel: string;
  file: File | null;
  sourceMaterial: string;
  specializedField: string;
  processingStep: number;
  processingStatus: string;
  results: ProcessingStats | null;
  setApiKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  validateApiKey: () => Promise<boolean>;
  confirmApiKeySetup: () => void;
  setFile: (file: File | null) => void;
  setSourceMaterial: (source: string) => void;
  setSpecializedField: (field: string) => void;
  startProcessing: () => Promise<void>;
  reset: () => void;
}
const processingSteps = [
  { text: 'Analyzing Presentation Structure' },
  { text: 'Extracting Translatable Content' },
  { text: 'Researching Source Material' },
  { text: 'Translating Content with AI' },
  { text: 'Reconstructing Presentation' },
  { text: 'Generating Terminology Report' },
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const useLexiSlideStore = create<LexiSlideState>((set, get) => ({
  step: 'apiKeySetup',
  apiKey: '',
  isApiKeyValid: false,
  isApiKeyLoading: false,
  apiKeyError: null,
  availableModels: [],
  selectedModel: '',
  file: null,
  sourceMaterial: '',
  specializedField: 'Ophthalmology',
  processingStep: 0,
  processingStatus: '',
  results: null,
  setApiKey: (key) => set({ apiKey: key, apiKeyError: null, isApiKeyValid: false }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  validateApiKey: async () => {
    const { apiKey } = get();
    set({ isApiKeyLoading: true, apiKeyError: null });
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Invalid API Key or network error.');
      }
      const geminiModels = data.models
        .filter((model: any) =>
          model.name.includes('gemini') &&
          model.supportedGenerationMethods.includes('generateContent')
        )
        .map((model: any) => ({
          id: model.name,
          name: model.displayName,
        }))
        .sort((a: AiModel, b: AiModel) => a.name.localeCompare(b.name));
      if (geminiModels.length === 0) {
        throw new Error("No compatible Gemini models found for this API key.");
      }
      set({
        isApiKeyValid: true,
        availableModels: geminiModels,
        selectedModel: '',
      });
      toast.success('API Key validated successfully!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      set({ isApiKeyValid: false, apiKeyError: errorMessage, availableModels: [] });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ isApiKeyLoading: false });
    }
  },
  confirmApiKeySetup: () => {
    const { isApiKeyValid, selectedModel } = get();
    if (isApiKeyValid && selectedModel) {
      set({ step: 'upload' });
    } else {
      toast.error('Please validate your API key and select a model.');
    }
  },
  setFile: (file) => set({ file }),
  setSourceMaterial: (source) => set({ sourceMaterial: source }),
  setSpecializedField: (field) => set({ specializedField: field }),
  startProcessing: async () => {
    const { sourceMaterial, file, specializedField, apiKey, selectedModel } = get();
    if (!file) {
      toast.error("File not found for processing.");
      return;
    }
    const fileName = file.name;
    set({ step: 'processing', processingStep: 0, processingStatus: processingSteps[0].text });
    try {
      await delay(500);
      set({ processingStep: 1, processingStatus: processingSteps[1].text });
      const { translatableTexts } = await extractTextFromPptx(file);
      if (translatableTexts.length === 0) {
        toast.warning("No translatable text found in the presentation.");
        set({ step: 'upload' });
        return;
      }
      await delay(500);
      set({ processingStep: 2, processingStatus: processingSteps[2].text });
      await delay(500);
      set({ processingStep: 3, processingStatus: processingSteps[3].text });
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: selectedModel.replace('models/', '') });
      const systemPrompt = `
        You are an expert translator specializing in ${specializedField}. Your task is to translate English presentation content to professional Persian.
        Context: The content is from a source titled "${sourceMaterial}".
        Rules:
        1. Translate only the provided text blocks.
        2. Maintain a professional, academic tone.
        3. DO NOT translate titles, captions, or data labels. Only translate descriptive paragraphs.
        4. If a specialized term has no standard Persian equivalent, keep it in English.
        5. Respond ONLY with a single JSON object in a markdown block. The JSON object must have two keys:
           - "translatedContent": A single string where each translated text block is separated by "\\n\\n".
           - "terminology": An array of objects, each with "english" and "persian" keys, for specialized terms you identified.
        Example Response:
        \`\`\`json
        {
          "translatedContent": "ترجمه بلو�� اول.\\n\\nترجمه بلوک دوم.",
          "terminology": [
            { "english": "Retina", "persian": "شبکیه" },
            { "english": "Cataract", "persian": "آب مرو��رید" }
          ]
        }
        \`\`\`
      `;
      const result = await model.generateContent([systemPrompt, translatableTexts.join('\n\n')]);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch || !jsonMatch[1]) {
        throw new Error("AI did not return a valid JSON response.");
      }
      const parsedData = JSON.parse(jsonMatch[1]);
      const translatedLines = parsedData.translatedContent.split('\n\n');
      if (translatedLines.length !== translatableTexts.length) {
        throw new Error(`Translation integrity check failed. Expected ${translatableTexts.length} blocks, but received ${translatedLines.length}.`);
      }
      await delay(500);
      set({ processingStep: 4, processingStatus: processingSteps[4].text });
      const translatedBlob = await replaceTextInPptx(file, translatableTexts, translatedLines);
      const translatedFileUrl = URL.createObjectURL(translatedBlob);
      await delay(500);
      set({ processingStep: 5, processingStatus: processingSteps[5].text });
      await delay(500);
      const terminology = parsedData.terminology || [];
      set({
        step: 'results',
        results: {
          slides: 15, // This is a mock value, as we can't get it client-side easily
          textBlocks: translatableTexts.length,
          terms: terminology.length,
          source: sourceMaterial,
          field: specializedField,
          translatedContent: parsedData.translatedContent,
          fileName: fileName,
          translatedFileUrl: translatedFileUrl,
          terminology: terminology,
        },
      });
      toast.success('Translation completed successfully!');
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred during translation.');
      set({ step: 'upload' });
    }
  },
  reset: () => {
    const { isApiKeyValid, results: currentResults } = get();
    if (currentResults?.translatedFileUrl) {
      URL.revokeObjectURL(currentResults.translatedFileUrl);
    }
    if (isApiKeyValid) {
      set({
        step: 'upload',
        file: null,
        sourceMaterial: '',
        specializedField: 'Ophthalmology',
        processingStep: 0,
        processingStatus: '',
        results: null,
      });
    } else {
      set({
        step: 'apiKeySetup',
        apiKey: '',
        isApiKeyValid: false,
        isApiKeyLoading: false,
        apiKeyError: null,
        availableModels: [],
        selectedModel: '',
        file: null,
        sourceMaterial: '',
        specializedField: 'Ophthalmology',
        processingStep: 0,
        processingStatus: '',
        results: null,
      });
    }
  },
}));