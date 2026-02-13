"use server";

import mammoth from "mammoth";

/**
 * Extract text from DOCX file
 * only need text extraction for docx as pdf will not be supported
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer: buffer });
    const html = await mammoth.convertToHtml({ buffer: buffer });

    const links: { text: string; href: string }[] = [];
    const regex = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/g;
    let match;
    while ((match = regex.exec(html.value)) !== null) {
      links.push({
        href: match[1],
        text: match[2].replace(/<[^>]+>/g, ""), // strip nested tags
      });
    }
    console.log("Extracted links:", links);
    return result.value;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

/**
 * Extract text from supported file types (PDF or DOCX)
 * @param file - The file to extract text from
 * @returns Promise with extracted text or null if unsupported/error
 */
export async function extractTextFromFile(
  file: File
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Extract based on file type
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = new PDFParse({ data: new Uint8Array(arrayBuffer) });
      const result = await pdf.getText({ parseHyperlinks: true });
      return { success: true, text: result.text };
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const text = await extractTextFromDOCX(file);
      return { success: true, text };
    } else {
      return {
        success: false,
        error: "Unsupported file type. Only PDF and DOCX are supported.",
      };
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract text",
    };
  }
}
