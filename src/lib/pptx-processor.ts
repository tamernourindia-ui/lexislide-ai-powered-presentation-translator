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
      const textElements = content.match(/<a:t>.*?<\/a:t>/gs) || []; // Added 's' flag
      for (const element of textElements) {
        const text = element.replace(/<a:t>(.*?)<\/a:t>/s, '$1').trim(); // Added 's' flag
        if (text) {
          allTexts.push(text);
          if (isTranslatable(text)) {
            translatableTexts.push(text);
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
      translationMap.forEach((translated, original) => {
        const escapedOriginal = xmlEscape(original);
        const escapedTranslated = xmlEscape(translated);
        // This regex finds the text run (<a:r>) containing the original text.
        // It captures the paragraph properties (<a:pPr>) and the run properties (<a:rPr>).
        // The 's' flag (dotAll) is crucial for matching text that spans multiple lines.
        const searchRegex = new RegExp(
          `(<a:pPr[^>]*>.*?</a:pPr>\\s*<a:r>\\s*<a:rPr[^>]*>.*?</a:rPr>\\s*<a:t>${escapedOriginal}</a:t>\\s*</a:r>)`,
          'gs' // Use 'g' for global and 's' for dotAll to match across newlines
        );
        content = content!.replace(searchRegex, (match) => {
          // Add RTL alignment to paragraph properties
          let newParagraphProps = match.replace(/<a:pPr[^>]*>/, (pPr) => {
            if (pPr.includes('algn="r"')) return pPr;
            return pPr.slice(0, -1) + ' algn="r">';
          });
          // Add Persian font to run properties
          newParagraphProps = newParagraphProps.replace(/<a:rPr[^>]*>/, (rPr) => {
            // Remove existing Latin font if present
            let cleanedRpr = rPr.replace(/<a:latin[^>]*>/g, '');
            // Add Complex Script font for Persian
            return cleanedRpr.slice(0, -1) + '><a:cs typeface="Arial"/><a:ea typeface="Tahoma"/>';
          });
          // Finally, replace the text content
          return newParagraphProps.replace(
            `<a:t>${escapedOriginal}</a:t>`,
            `<a:t>${escapedTranslated}</a:t>`
          );
        });
      });
      zip.file(slideFile, content);
    }
  }
  return zip.generateAsync({ type: 'blob' });
};