import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useLexiSlideStore } from '@/hooks/useLexiSlideStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
export function UploadStep() {
  const file = useLexiSlideStore(s => s.file);
  const setFile = useLexiSlideStore(s => s.setFile);
  const sourceMaterial = useLexiSlideStore(s => s.sourceMaterial);
  const setSourceMaterial = useLexiSlideStore(s => s.setSourceMaterial);
  const startProcessing = useLexiSlideStore(s => s.startProcessing);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0];
      if (uploadedFile.name.endsWith('.pptx')) {
        setFile(uploadedFile);
        toast.success(`${uploadedFile.name} selected.`);
      } else {
        toast.error('Invalid file type. Please upload a .pptx file.');
      }
    }
  }, [setFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
    multiple: false,
  });
  const handleStart = () => {
    if (!file) {
      toast.error('Please upload a presentation file.');
      return;
    }
    if (!sourceMaterial.trim()) {
      toast.error('Please provide the source material name.');
      return;
    }
    startProcessing();
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-sora">Upload & Configure</CardTitle>
          <CardDescription className="text-lg">Provide your presentation and its source context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="space-y-2">
            <Label htmlFor="source-material" className="text-base font-semibold">Source Material</Label>
            <Input
              id="source-material"
              placeholder="e.g., 'Kanski's Clinical Ophthalmology'"
              value={sourceMaterial}
              onChange={(e) => setSourceMaterial(e.target.value)}
              className="text-base py-6"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Presentation File</Label>
            {!file ? (
              <div
                {...getRootProps()}
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                <input {...getInputProps()} />
                <div className="text-center text-muted-foreground">
                  <UploadCloud className="mx-auto h-12 w-12 mb-2" />
                  <p className="font-semibold">Drag & drop a .pptx file here</p>
                  <p className="text-sm">or click to select a file (Max 50MB)</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold text-secondary-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full text-lg py-7 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleStart}
            disabled={!file || !sourceMaterial.trim()}
          >
            Translate Presentation
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}