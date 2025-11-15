import JSZip from 'jszip';
// A simplified smart filter to identify translatable text blocks
const isTranslatable = (text: string): boolean => {
  const trimmed = text.trim();
  if (trimmed.length < 15) return false; // Ignore very short text
  if (/^\d/.test(trimmed)) return false; // Ignore text starting with numbers (likely data labels)
  const wordCount = trimmed.split(/\s+/).length;
  return wordCount > 4; // Only translate text with more than 4 words
};
// Extracts translatable text from a .pptx file
export const extractTextFromPptx = async (file: File): Promise<{ allTexts: string[], translatableTexts: string[] }> => {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  const allTexts: string[] = [];
  const translatableTexts: string[] = [];
  for (const slideFile of slideFiles) {
    const content = await zip.file(slideFile)?.async('string');
    if (content) {
      // Regex to find all text elements in a slide
      const textElements = content.match(/<a:t>.*?<\/a:t>/g) || [];
      for (const element of textElements) {
        const text = element.replace(/<a:t>(.*?)<\/a:t>/, '$1').trim();
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
// Replaces original text with translated text and returns a new .pptx file blob
export const replaceTextInPptx = async (
  originalFile: File,
  originalTexts: string[],
  translatedTexts: string[]
): Promise<Blob> => {
  const zip = await JSZip.loadAsync(originalFile);
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
  const translationMap = new Map<string, string>();
  originalTexts.forEach((original, index) => {
    if (translatedTexts[index]) {
      translationMap.set(original, translatedTexts[index]);
    }
  });
  for (const slideFile of slideFiles) {
    let content = await zip.file(slideFile)?.async('string');
    if (content) {
      translationMap.forEach((translated, original) => {
        // Escape special characters for regex
        const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`<a:t>${escapedOriginal}<\/a:t>`, 'g');
        content = content!.replace(regex, `<a:t>${translated}</a:t>`);
      });
      zip.file(slideFile, content);
    }
  }
  return zip.generateAsync({ type: 'blob' });
};