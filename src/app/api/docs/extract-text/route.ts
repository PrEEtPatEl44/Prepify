import { NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/textExtraction";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file_path, file_name } = body;

    if (!file_path || !file_name) {
      return NextResponse.json(
        { error: "file_path and file_name are required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(file_path);

    if (downloadError) {
      console.error("Error downloading file:", downloadError);
      return NextResponse.json(
        { error: "Failed to download file from storage" },
        { status: 500 }
      );
    }

    // Convert blob to File object
    const file = new File([fileData], file_name, {
      type: fileData.type,
    });

    // Extract text from the file
    const result = await extractTextFromFile(file);
    console.log("Text extraction result:", result);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to extract text" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result.text,
    });
  } catch (error) {
    console.error("Error extracting text:", error);
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    );
  }
}
