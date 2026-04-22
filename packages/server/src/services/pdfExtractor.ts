import pdf from "pdf-parse";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}

export function isTextExtractionValid(text: string): boolean {
  if (text.length < 50) return false;

  const printableChars = text.replace(/\s/g, "").length;
  const totalChars = text.length;
  
  if (printableChars / totalChars < 0.3) return false;

  return true;
}
