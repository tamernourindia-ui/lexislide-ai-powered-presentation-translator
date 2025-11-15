import { create } from 'zustand';
import { toast } from 'sonner';
type Step = 'upload' | 'processing' | 'results';
interface ProcessingStats {
  slides: number;
  textBlocks: number;
  terms: number;
  source: string;
  field: string;
  translatedContent?: string; // To hold the real translated text
}
interface LexiSlideState {
  step: Step;
  file: File | null;
  sourceMaterial: string;
  processingStep: number;
  processingStatus: string;
  results: ProcessingStats | null;
  setFile: (file: File | null) => void;
  setSourceMaterial: (source: string) => void;
  startProcessing: () => Promise<void>;
  setProcessingProgress: (step: number, status: string) => void;
  setResults: (results: ProcessingStats) => void;
  reset: () => void;
}
const processingSteps = [
  { text: 'Initializing AI Engine' },
  { text: 'Analyzing Presentation Structure' },
  { text: 'Researching Source Material' },
  { text: 'Translating Content Blocks' },
  { text: 'Applying Persian Formatting & RTL' },
  { text: 'Generating Terminology Report' },
];
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const useLexiSlideStore = create<LexiSlideState>((set, get) => ({
  step: 'upload',
  file: null,
  sourceMaterial: '',
  processingStep: 0,
  processingStatus: '',
  results: null,
  setFile: (file) => set({ file }),
  setSourceMaterial: (source) => set({ sourceMaterial: source }),
  startProcessing: async () => {
    const { sourceMaterial } = get();
    set({ step: 'processing', processingStep: 0, processingStatus: 'Initializing...' });
    try {
      // Simulate frontend steps before API call
      for (let i = 0; i < 3; i++) {
        set({ processingStep: i, processingStatus: processingSteps[i].text });
        await delay(500 + Math.random() * 300);
      }
      // Actual API call for translation
      set({ processingStep: 3, processingStatus: processingSteps[3].text });
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceMaterial }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'API returned an error.');
      }
      // Simulate remaining backend steps
      for (let i = 4; i < processingSteps.length; i++) {
        set({ processingStep: i, processingStatus: processingSteps[i].text });
        await delay(500 + Math.random() * 300);
      }
      set({ processingStep: processingSteps.length, processingStatus: 'Finalizing...' });
      await delay(500);
      // Set final results
      set({
        step: 'results',
        results: {
          ...data.data.statistics,
          translatedContent: data.data.translatedContent,
        },
      });
      toast.success('Translation completed successfully!');
    } catch (error) {
      console.error("Translation failed:", error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred during translation.');
      set({ step: 'upload' }); // Reset to upload step on failure
    }
  },
  setProcessingProgress: (step, status) => set({ processingStep: step, processingStatus: status }),
  setResults: (results) => set({ results, step: 'results' }),
  reset: () => set({
    step: 'upload',
    file: null,
    sourceMaterial: '',
    processingStep: 0,
    processingStatus: '',
    results: null,
  }),
}));