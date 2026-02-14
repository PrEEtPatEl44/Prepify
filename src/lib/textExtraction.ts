"use server";

/**
 * Extract text from supported file types (PDF or DOCX)
 * @param file - The file to extract text from
 * @returns Promise with extracted text or null if unsupported/error
 */
export async function extractTextFromFile(
  file: File,
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Extract based on file type only pdf
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const arrayBuffer = await file.arrayBuffer();
      const pdf = new PDFParse({ data: new Uint8Array(arrayBuffer) });
      const result = await pdf.getText({ parseHyperlinks: true });
      return { success: true, text: result.text };
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
