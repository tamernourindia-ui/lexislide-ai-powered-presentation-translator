import JSZip from 'jszip';
/**
 * A more intelligent filter to identify translatable text blocks.
 * It uses heuristics to differentiate between body content and titles/labels.
 */
const isTranslatable = (text: string): boolean => {
  const trimmed = text.trim();
  // Rule 1: Ignore very short text, likely labels or single words.
  if (trimmed.length < 15) return false;
  // Rule 2: Ignore text that looks like a title (e.g., all caps, few words).
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount <= 5 && trimmed === trimmed.toUpperCase()) return false;
  // Rule 3: Ignore text starting with numbers or list markers.
  if (/^(\d+\.?\s*|\(?[a-zA-Z0-9]\)|[•–—-])/.test(trimmed)) return false;
  // Rule 4: Prioritize text that looks like a sentence (starts with capital, ends with punctuation).
  if (/^[A-Z].*[.!?]$/s.test(trimmed)) return true; // Added 's' flag for multiline
  // Rule 5: A good fallback for descriptive content is a reasonable word count.
  return wordCount > 5;
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
 * and returns a new .pptx file blob.
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
          // Find the first text run to replace
          const firstRunMatch = p.match(/<a:r>.*?<a:t>.*?<\/a:t>.*?<\/a:r>/s);
          if (firstRunMatch) {
            const firstRun = firstRunMatch[0];
            // Replace the text in the first run with the full translated text
            const newFirstRun = firstRun.replace(/<a:t>.*?<\/a:t>/s, `<a:t>${escapedTranslated}</a:t>`);
            // Remove all other runs from the paragraph to avoid duplicated text
            const newParagraphContent = p
              .replace(/<a:r>.*?<\/a:r>/gs, '') // Remove all runs
              .replace(/(<a:pPr.*?>)/s, `$1${newFirstRun}`); // Insert the new single run
            // Add RTL alignment and Persian font
            let finalParagraph = newParagraphContent.replace(/<a:pPr[^>]*>/, (pPr) => {
              if (pPr.includes('algn="r"')) return pPr;
              return pPr.slice(0, -1) + ' algn="r">';
            });
            finalParagraph = finalParagraph.replace(/<a:rPr[^>]*>/, (rPr) => {
              let cleanedRpr = rPr.replace(/<a:latin[^>]*>/g, '');
              return cleanedRpr.slice(0, -1) + '><a:cs typeface="Arial"/><a:ea typeface="Tahoma"/>';
            });
            newContent = newContent.replace(p, finalParagraph);
          }
        }
      }
      zip.file(slideFile, newContent);
    }
  }
  return zip.generateAsync({ type: 'blob' });
};