import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader, BrainCircuit, FileScan, Languages, FileText, BookOpen } from 'lucide-react';
import { useLexiSlideStore } from '@/hooks/useLexiSlideStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
const processingStepsConfig = [
  { text: 'Initializing AI Engine', icon: <BrainCircuit className="h-6 w-6" /> },
  { text: 'Analyzing Presentation Structure', icon: <FileScan className="h-6 w-6" /> },
  { text: 'Researching Source Material', icon: <BookOpen className="h-6 w-6" /> },
  { text: 'Translating Content Blocks', icon: <Languages className="h-6 w-6" /> },
  { text: 'Applying Persian Formatting & RTL', icon: <FileText className="h-6 w-6" /> },
  { text: 'Generating Terminology Report', icon: <FileText className="h-6 w-6" /> },
];
export function ProcessingStep() {
  const processingStep = useLexiSlideStore(s => s.processingStep);
  const processingStatus = useLexiSlideStore(s => s.processingStatus);
  const progressValue = (processingStep / processingStepsConfig.length) * 100;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-sora">Processing Your Presentation</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <Progress value={progressValue} className="w-full h-3" />
            <AnimatePresence mode="wait">
              <motion.p
                key={processingStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center text-lg text-muted-foreground"
              >
                {processingStatus}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="space-y-4">
            {processingStepsConfig.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center gap-4 text-lg"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-secondary-foreground">
                  {processingStep > index ? (
                    <CheckCircle className="h-6 w-6 text-teal-500" />
                  ) : processingStep === index ? (
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <div className="h-6 w-6" />
                  )}
                </div>
                <span className={`transition-colors ${processingStep > index ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}