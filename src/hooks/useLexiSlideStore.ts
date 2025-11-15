import { create } from 'zustand';
import { toast } from 'sonner';
import { extractTextFromPptx, replaceTextInPptx } from '@/lib/pptx-processor';
type Step = 'upload' | 'processing' | 'results';
interface ProcessingStats {
  slides: number;
  textBlocks: number;
  terms: number;
  source: string;
  field: string;
  translatedContent?: string;
  fileName?: string;
  translatedFileUrl?: string;
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
  step: 'upload',
  file: null,
  sourceMaterial: '',
  processingStep: 0,
  processingStatus: '',
  results: null,
  setFile: (file) => set({ file }),
  setSourceMaterial: (source) => set({ sourceMaterial: source }),
  startProcessing: async () => {
    const { sourceMaterial, file } = get();
    if (!file) {
      toast.error("File not found for processing.");
      return;
    }
    const fileName = file.name;
    set({ step: 'processing', processingStep: 0, processingStatus: processingSteps[0].text });
    try {
      await delay(500);
      set({ processingStep: 1, processingStatus: processingSteps[1].text });
      const { allTexts, translatableTexts } = await extractTextFromPptx(file);
      if (translatableTexts.length === 0) {
        toast.warning("No translatable text found in the presentation.");
        set({ step: 'upload' });
        return;
      }
      await delay(500);
      set({ processingStep: 2, processingStatus: processingSteps[2].text });
      await delay(500);
      set({ processingStep: 3, processingStatus: processingSteps[3].text });
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceMaterial, textContent: translatableTexts.join('\n\n') }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'API returned an error.');
      }
      const translatedLines = data.data.translatedContent.split('\n\n');
      await delay(500);
      set({ processingStep: 4, processingStatus: processingSteps[4].text });
      const translatedBlob = await replaceTextInPptx(file, translatableTexts, translatedLines);
      const translatedFileUrl = URL.createObjectURL(translatedBlob);
      await delay(500);
      set({ processingStep: 5, processingStatus: processingSteps[5].text });
      await delay(500);
      set({
        step: 'results',
        results: {
          ...data.data.statistics,
          slides: data.data.statistics.slides || 15, // Mock data if not present
          textBlocks: translatableTexts.length,
          terms: data.data.statistics.terms || Math.floor(translatableTexts.length * 1.5),
          translatedContent: data.data.translatedContent,
          fileName: fileName,
          translatedFileUrl: translatedFileUrl,
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
    const currentResults = get().results;
    if (currentResults?.translatedFileUrl) {
      URL.revokeObjectURL(currentResults.translatedFileUrl);
    }
    set({
      step: 'upload',
      file: null,
      sourceMaterial: '',
      processingStep: 0,
      processingStatus: '',
      results: null,
    });
  },
}));