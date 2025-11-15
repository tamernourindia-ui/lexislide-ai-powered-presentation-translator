import { AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { useLexiSlideStore } from '@/hooks/useLexiSlideStore';
import { UploadStep } from '@/components/lexislide/UploadStep';
import { ProcessingStep } from '@/components/lexislide/ProcessingStep';
import { ResultsStep } from '@/components/lexislide/ResultsStep';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
export function HomePage() {
  const step = useLexiSlideStore(s => s.step);
  const renderStep = () => {
    switch (step) {
      case 'upload':
        return <UploadStep />;
      case 'processing':
        return <ProcessingStep />;
      case 'results':
        return <ResultsStep />;
      default:
        return <UploadStep />;
    }
  };
  return (
    <>
      <div className="min-h-screen w-full flex flex-col font-sans">
        <header className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold font-sora tracking-tight">LexiSlide</h1>
              </div>
              <ThemeToggle className="relative top-0 right-0" />
            </div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 md:py-10 lg:py-12">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </div>
        </main>
        <footer className="w-full py-6 text-center text-muted-foreground text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p>
              AI has a limit on the number of requests that can be made in a given time period.
            </p>
            <p>Built with ❤️ at Cloudflare</p>
          </div>
        </footer>
      </div>
      <Toaster richColors position="top-center" />
    </>
  );
}