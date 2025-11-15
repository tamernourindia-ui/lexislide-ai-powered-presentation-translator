import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrainCircuit, Code } from 'lucide-react';
import { useLexiSlideStore } from '@/hooks/useLexiSlideStore';
import { ApiKeySetupStep } from '@/components/lexislide/ApiKeySetupStep';
import { UploadStep } from '@/components/lexislide/UploadStep';
import { ProcessingStep } from '@/components/lexislide/ProcessingStep';
import { ResultsStep } from '@/components/lexislide/ResultsStep';
import { ApiInfoSheet } from '@/components/lexislide/ApiInfoSheet';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
export function HomePage() {
  const step = useLexiSlideStore(s => s.step);
  const [isApiInfoOpen, setIsApiInfoOpen] = useState(false);
  const renderStep = () => {
    switch (step) {
      case 'apiKeySetup':
        return <ApiKeySetupStep />;
      case 'upload':
        return <UploadStep />;
      case 'processing':
        return <ProcessingStep />;
      case 'results':
        return <ResultsStep />;
      default:
        // Fallback to the setup step if the state is unknown
        return <ApiKeySetupStep />;
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsApiInfoOpen(true)}>
                  <Code className="h-5 w-5" />
                </Button>
                <ThemeToggle className="relative top-0 right-0" />
              </div>
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
            <p>Built with ❤��� at Cloudflare</p>
          </div>
        </footer>
      </div>
      <Toaster richColors position="top-center" />
      <ApiInfoSheet isOpen={isApiInfoOpen} setIsOpen={setIsApiInfoOpen} />
    </>
  );
}