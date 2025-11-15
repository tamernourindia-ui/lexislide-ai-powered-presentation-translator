import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Check, AlertTriangle, Loader2, Wand2, ExternalLink } from 'lucide-react';
import { useLexiSlideStore } from '@/hooks/useLexiSlideStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export function ApiKeySetupStep() {
  const apiKey = useLexiSlideStore(s => s.apiKey);
  const setApiKey = useLexiSlideStore(s => s.setApiKey);
  const isApiKeyValid = useLexiSlideStore(s => s.isApiKeyValid);
  const isApiKeyLoading = useLexiSlideStore(s => s.isApiKeyLoading);
  const apiKeyError = useLexiSlideStore(s => s.apiKeyError);
  const availableModels = useLexiSlideStore(s => s.availableModels);
  const selectedModel = useLexiSlideStore(s => s.selectedModel);
  const setSelectedModel = useLexiSlideStore(s => s.setSelectedModel);
  const validateApiKey = useLexiSlideStore(s => s.validateApiKey);
  const confirmApiKeySetup = useLexiSlideStore(s => s.confirmApiKeySetup);
  const handleValidate = () => {
    if (apiKey.trim()) {
      validateApiKey();
    }
  };
  useEffect(() => {
    if (isApiKeyValid && selectedModel) {
      const timer = setTimeout(() => {
        confirmApiKeySetup();
      }, 500); // A small delay for better UX
      return () => clearTimeout(timer);
    }
  }, [isApiKeyValid, selectedModel, confirmApiKeySetup]);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-2xl mx-auto overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-sora">Initial Setup</CardTitle>
          <CardDescription className="text-lg">Please provide your AI provider API key to begin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-base font-semibold">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="text-base py-6"
                disabled={isApiKeyLoading || isApiKeyValid}
              />
              <Button
                onClick={handleValidate}
                disabled={!apiKey.trim() || isApiKeyLoading || isApiKeyValid}
                className="px-4 py-6"
              >
                {isApiKeyLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isApiKeyValid ? (
                  <Check className="h-5 w-5" />
                ) : (
                  'Validate'
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-1">
              You can get your API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                Google AI Studio <ExternalLink className="inline-block h-3 w-3" />
              </a>.
            </p>
          </div>
          {apiKeyError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Validation Failed</AlertTitle>
              <AlertDescription>{apiKeyError}</AlertDescription>
            </Alert>
          )}
          {isApiKeyValid && availableModels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="model-select" className="text-base font-semibold">Select AI Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger id="model-select" className="text-base h-[52px]">
                  <SelectValue placeholder="Choose a model..." />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model.id} value={model.id} className="text-base">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            size="lg"
            className="w-full text-lg py-7 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={confirmApiKeySetup}
            disabled={!isApiKeyValid || !selectedModel}
          >
            {isApiKeyValid && selectedModel ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Proceeding...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Continue to Translator
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}