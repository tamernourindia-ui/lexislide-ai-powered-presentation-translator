import { motion } from 'framer-motion';
import { Check, Download, FileText, Book, BarChart3, RefreshCw } from 'lucide-react';
import { useLexiSlideStore } from '@/hooks/useLexiSlideStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import jsPDF from 'jspdf';
import { VAZIRMATN_FONT_BASE64 } from '@/lib/vazir-font';
const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg text-center">
    <div className="text-primary mb-2">{icon}</div>
    <p className="text-2xl font-bold text-secondary-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);
export function ResultsStep() {
  const results = useLexiSlideStore(s => s.results);
  const reset = useLexiSlideStore(s => s.reset);
  if (!results) return null;
  const handlePptxDownload = () => {
    if (!results.translatedFileUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = results.translatedFileUrl;
    const baseName = results.fileName?.replace('.pptx', '') || 'presentation';
    a.download = `${baseName}-translated.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const handlePdfDownload = () => {
    const doc = new jsPDF();
    // 1. Register the custom Persian font
    doc.addFileToVFS('Vazirmatn-Regular.ttf', VAZIRMATN_FONT_BASE64);
    doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
    // 2. Set the font for the document
    doc.setFont('Vazirmatn');
    doc.text('LexiSlide Terminology Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    // Use RTL options for Persian text
    doc.text(`منبع: ${results.source}`, 190, 40, { align: 'right' });
    doc.text(`حوزه تخ��صی: ${results.field}`, 190, 50, { align: 'right' });
    // English text can remain LTR
    doc.setFont('helvetica', 'normal');
    doc.text(`Original File: ${results.fileName || 'N/A'}`, 20, 60);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    // Switch back to Persian font for headers and stats
    doc.setFont('Vazirmatn');
    doc.text('آمار ترجمه', 190, 75, { align: 'right' });
    doc.text(`- اسلایدهای پردازش شده: ${results.slides}`, 190, 85, { align: 'right' });
    doc.text(`- بلوک‌های متنی ترجمه شده: ${results.textBlocks}`, 190, 92, { align: 'right' });
    doc.text(`- اصطلاحات تخصصی شناسایی شده: ${results.terms}`, 190, 99, { align: 'right' });
    doc.line(20, 105, 190, 105);
    doc.text('پیش‌نمایش محتوای ترجمه شده:', 190, 115, { align: 'right' });
    const splitText = doc.splitTextToSize(results.translatedContent || 'محتوایی برای نمایش وجود ندارد.', 170);
    doc.text(splitText, 190, 125, { align: 'right' });
    const baseName = results.fileName?.replace('.pptx', '') || 'report';
    doc.save(`${baseName}-report.pdf`);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-3xl mx-auto overflow-hidden">
        <CardHeader className="text-center bg-secondary/50 p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
            className="mx-auto h-16 w-16 rounded-full bg-teal-500 flex items-center justify-center mb-4"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-bold font-sora">Translation Complete!</CardTitle>
          <CardDescription className="text-lg">Your presentation is ready for download.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center">Translation Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<FileText className="h-8 w-8" />} label="Slides Processed" value={results.slides} />
              <StatCard icon={<BarChart3 className="h-8 w-8" />} label="Text Blocks Translated" value={results.textBlocks} />
              <StatCard icon={<Book className="h-8 w-8" />} label="Specialized Terms" value={results.terms} />
            </div>
            <div className="mt-4 text-center text-muted-foreground">
              <p><strong>Source:</strong> {results.source}</p>
              <p><strong>Detected Field:</strong> {results.field}</p>
            </div>
          </div>
          <Separator />
          {results.translatedContent && (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Translated Content Preview</h3>
              <Card className="bg-secondary">
                <CardContent className="p-4">
                  <ScrollArea className="h-32">
                    <p className="text-secondary-foreground whitespace-pre-wrap p-2 font-mono text-sm">{results.translatedContent}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center">Your Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <FileText className="h-12 w-12 text-primary mb-3" />
                <h4 className="font-semibold text-lg">Translated Presentation</h4>
                <p className="text-muted-foreground text-sm mb-4 text-center">Formatted in Persian with RTL text.</p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handlePptxDownload} disabled={!results.translatedFileUrl}>
                  <Download className="mr-2 h-4 w-4" /> Download .pptx
                </Button>
              </div>
              <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <FileText className="h-12 w-12 text-teal-500 mb-3" />
                <h4 className="font-semibold text-lg">Terminology Report</h4>
                <p className="text-muted-foreground text-sm mb-4 text-center">A PDF glossary of specialized terms.</p>
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" onClick={handlePdfDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download .pdf
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-secondary/30">
          <Button variant="outline" size="lg" className="w-full" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" /> Start New Translation
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}