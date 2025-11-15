import { create } from 'zustand';
type Step = 'upload' | 'processing' | 'results';
interface ProcessingStats {
  slides: number;
  textBlocks: number;
  terms: number;
  source: string;
  field: string;
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
  startProcessing: () => void;
  setProcessingProgress: (step: number, status: string) => void;
  setResults: (results: ProcessingStats) => void;
  reset: () => void;
}
export const useLexiSlideStore = create<LexiSlideState>((set) => ({
  step: 'upload',
  file: null,
  sourceMaterial: '',
  processingStep: 0,
  processingStatus: '',
  results: null,
  setFile: (file) => set({ file }),
  setSourceMaterial: (source) => set({ sourceMaterial: source }),
  startProcessing: () => set({ step: 'processing', processingStep: 0, processingStatus: 'Initializing...' }),
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