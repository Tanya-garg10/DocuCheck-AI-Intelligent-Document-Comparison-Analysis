import mammoth from 'mammoth';

/**
 * Normalizes text content:
 * - Unifies line breaks (\r\n -> \n)
 * - Trims trailing whitespace on lines
 * - Consolidates consecutive blank lines to standard paragraph breaks (\n\n)
 * - Preserves structural paragraphs and indentations where meaningful
 */
export function normalizeText(rawText: string): string {
  if (!rawText) return '';
  
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts plain text from an uploaded document buffer.
 * Supports PDF, DOCX, and plain text.
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const extension = fileName.toLowerCase().split('.').pop() || '';
  
  // 1. PDF Documents
  if (mimeType.includes('pdf') || extension === 'pdf') {
    try {
      const pdfModule = await import('pdf-parse');
      
      // Check if it's the newer class-based PDFParse (pdf-parse v2+)
      if (pdfModule.PDFParse && typeof pdfModule.PDFParse === 'function') {
        const parser = new pdfModule.PDFParse({ data: buffer });
        try {
          const result = await parser.getText();
          let text = '';
          if (typeof result === 'string') {
            text = result;
          } else if (result && typeof result.text === 'string') {
            text = result.text;
          } else if (result && Array.isArray(result.pages)) {
            text = result.pages.map((p: any) => p.text || '').join('\n\n');
          } else if (result) {
            text = String(result);
          }
          if (parser.destroy) {
            await parser.destroy();
          }
          if (text.trim().length > 0) {
            return normalizeText(text);
          }
        } catch (innerErr) {
          console.warn('PDFParse class getText error, attempting fallback:', innerErr);
        }
      }

      // Check if default is callable (pdf-parse v1 style)
      const parseFn = (pdfModule as any).default || pdfModule;
      if (typeof parseFn === 'function') {
        const data = await parseFn(buffer);
        if (data && data.text && data.text.trim().length > 0) {
          return normalizeText(data.text);
        }
      }

      // If text extraction yielded nothing, it's likely a scanned image PDF
      throw new Error(`Scanned or image-only PDF detected in "${fileName}". No selectable text was found. Please upload a searchable digital PDF or Word document.`);
    } catch (pdfErr: any) {
      if (pdfErr.message?.includes('Scanned or image-only')) throw pdfErr;
      console.error('Failed to parse PDF using pdf-parse:', pdfErr);
      throw new Error(`Unable to extract text from PDF "${fileName}": ${(pdfErr as Error).message}. If this is a scanned document, please provide a searchable version.`);
    }
  }

  // 2. Microsoft Word DOCX Documents
  if (
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('officedocument') ||
    extension === 'docx'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const rawText = result.value || '';
      return normalizeText(rawText);
    } catch (docxErr) {
      console.error('Failed to parse DOCX:', docxErr);
      throw new Error(`Unable to extract text from DOCX: ${(docxErr as Error).message}`);
    }
  }

  // 3. Plain text / Markdown / CSV / JSON
  try {
    const rawString = buffer.toString('utf-8');
    return normalizeText(rawString);
  } catch (textErr) {
    throw new Error(`Unable to decode text file: ${(textErr as Error).message}`);
  }
}
