import JSZip from 'jszip';
/**
 * A more intelligent filter to identify translatable text blocks.
 * It uses heuristics to differentiate between body content and titles/labels.
 */
const isTranslatable = (text: string): boolean => {
  const trimmed = text.trim();
  // Rule 1: Relaxed length check to include shorter, valid sentences.
  if (trimmed.length < 8) return false;
  // Rule 2: Ignore text that looks like a title (e.g., all caps, few words).
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 5 && trimmed === trimmed.toUpperCase()) return false;
  // Rule 3: Ignore text starting with numbers or list markers.
  if (/^(\d+\.?\s*|\(?[a-zA-Z0-9]\)|[•–���-])/.test(trimmed)) return false;
  // Rule 4: Prioritize text that looks like a sentence (starts with capital, ends with punctuation).
  if (/^[A-Z].*[.!?]$/s.test(trimmed)) return true; // Added 's' flag for multiline
  // Rule 5: Relaxed fallback for descriptive content word count.
  return wordCount > 3;
};
/**
 * Escapes XML special characters to prevent file corruption.
 */
const xmlEscape = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
/**
 * Extracts translatable text from a .pptx file.
 */
export const extractTextFromPptx = async (file: File): Promise<{ allTexts: string[], translatableTexts: string[] }> => {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  const allTexts: string[] = [];
  const translatableTexts: string[] = [];
  for (const slideFile of slideFiles) {
    const content = await zip.file(slideFile)?.async('string');
    if (content) {
      const paragraphs = content.match(/<a:p>.*?<\/a:p>/gs) || [];
      for (const p of paragraphs) {
        const textElements = p.match(/<a:t>.*?<\/a:t>/gs) || [];
        const fullText = textElements.map(t => t.replace(/<a:t>(.*?)<\/a:t>/s, '$1')).join('');
        if (fullText.trim()) {
          allTexts.push(fullText);
          if (isTranslatable(fullText)) {
            translatableTexts.push(fullText);
          }
        }
      }
    }
  }
  return { allTexts, translatableTexts };
};
/**
 * Replaces original text with translated text, applies Persian formatting,
 * and returns a new .pptx file blob. This version preserves intra-paragraph formatting.
 */
export const replaceTextInPptx = async (
  originalFile: File,
  originalTexts: string[],
  translatedTexts: string[]
): Promise<Blob> => {
  const zip = await JSZip.loadAsync(originalFile);
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  const translationMap = new Map<string, string>();
  originalTexts.forEach((original, index) => {
    if (translatedTexts[index] && translatedTexts[index].trim() !== '' && translatedTexts[index] !== original) {
      translationMap.set(original, translatedTexts[index]);
    }
  });
  for (const slideFile of slideFiles) {
    let content = await zip.file(slideFile)?.async('string');
    if (content) {
      const paragraphs = content.match(/<a:p>.*?<\/a:p>/gs) || [];
      let newContent = content;
      for (const p of paragraphs) {
        const textElements = p.match(/<a:t>.*?<\/a:t>/gs) || [];
        const fullText = textElements.map(t => t.replace(/<a:t>(.*?)<\/a:t>/s, '$1')).join('');
        if (translationMap.has(fullText)) {
          const translatedText = translationMap.get(fullText)!;
          const escapedTranslated = xmlEscape(translatedText);
          const runs = p.match(/<a:r>.*?<\/a:r>/gs) || [];
          if (runs.length > 0) {
            let modifiedParagraph = p;
            // 1. Place the full translated text in the first run.
            const firstRun = runs[0];
            const newFirstRun = firstRun.replace(/<a:t>.*?<\/a:t>/s, `<a:t>${escapedTranslated}</a:t>`);
            modifiedParagraph = modifiedParagraph.replace(firstRun, newFirstRun);
            // 2. Clear the text from all subsequent runs to avoid duplication.
            for (let i = 1; i < runs.length; i++) {
              const subsequentRun = runs[i];
              const newSubsequentRun = subsequentRun.replace(/<a:t>.*?<\/a:t>/s, '<a:t></a:t>');
              modifiedParagraph = modifiedParagraph.replace(subsequentRun, newSubsequentRun);
            }
            // 3. Apply RTL alignment to the paragraph properties.
            modifiedParagraph = modifiedParagraph.replace(/<a:pPr[^>]*>/, (pPr) => {
              if (pPr.includes('algn="r"')) return pPr;
              // Avoid adding attribute if no pPr tag exists
              if (pPr.startsWith('<a:p>')) return `<a:p><a:pPr algn="r"/>`;
              return pPr.slice(0, -1) + ' algn="r">';
            });
            // 4. Apply Persian font properties to each run's properties.
            const finalRuns = modifiedParagraph.match(/<a:r>.*?<\/a:r>/gs) || [];
            let paragraphWithFonts = modifiedParagraph;
            for (const run of finalRuns) {
                const newRun = run.replace(/<a:rPr[^>]*>/, (rPr) => {
                    let cleanedRpr = rPr.replace(/<a:latin[^>]*>/g, '');
                    // Add Complex Script and East Asian fonts for broad compatibility, specifying a common Persian font.
                    return cleanedRpr.slice(0, -1) + '><a:cs typeface="B Nazanin"/><a:ea typeface="Tahoma"/>';
                });
                paragraphWithFonts = paragraphWithFonts.replace(run, newRun);
            }
            newContent = newContent.replace(p, paragraphWithFonts);
          }
        }
      }
      zip.file(slideFile, newContent);
    }
  }
  return zip.generateAsync({ type: 'blob' });
};