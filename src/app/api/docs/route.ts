import { createClient } from "@/utils/supabase/server";
import { NextRequest, after } from "next/server";
import { revalidatePath } from "next/cache";
import { extractTextFromFile } from "@/lib/textExtraction";
import { ResumeDataExtractorAgent } from "@/lib/agents/resumeDataExtractor";
import { db } from "@/db";
import { resumes, coverLetters } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, desc } from "drizzle-orm";

// GET /api/docs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get("type");

    if (documentType !== "resumes" && documentType !== "coverLetters") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Invalid document type",
        }),
        { status: 400 }
      );
    }

    const userId = await getAuthUserId();

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        }),
        { status: 401 }
      );
    }

    let data;
    if (documentType === "resumes") {
      data = await db
        .select({
          id: resumes.id,
          file_name: resumes.fileName,
          file_path: resumes.filePath,
          resumeData: resumes.resumeData,
        })
        .from(resumes)
        .where(eq(resumes.userId, userId))
        .orderBy(desc(resumes.createdAt));
    } else {
      data = await db
        .select({
          id: coverLetters.id,
          file_name: coverLetters.fileName,
          file_path: coverLetters.filePath,
        })
        .from(coverLetters)
        .where(eq(coverLetters.userId, userId))
        .orderBy(desc(coverLetters.createdAt));
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/docs error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        message: `Failed to fetch documents info: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}

// POST /api/docs - Upload file and create document record
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const userId = await getAuthUserId();

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        }),
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const documentType = formData.get("documentType") as string;

    // Validate inputs
    if (!file || !fileName || !documentType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Missing required fields: file, fileName, or documentType",
        }),
        { status: 400 }
      );
    }

    if (documentType !== "resumes" && documentType !== "coverLetters") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Invalid document type. Must be 'resumes' or 'coverLetters'",
        }),
        { status: 400 }
      );
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const sanitizedFileName = fileName.trim().replace(/[^a-zA-Z0-9-_]/g, "_");
    const storageFileName = `${userId}/${documentType}/${timestamp}_${sanitizedFileName}.${fileExtension}`;

    // Step 1: Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storageFileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Storage Error",
          message: `Storage upload failed: ${uploadError.message}`,
        }),
        { status: 500 }
      );
    }

    // Get signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7); // 7 days expiry

    const uploadedFileUrl = urlData?.signedUrl;

    if (!uploadedFileUrl) {
      // Clean up uploaded file if URL generation fails
      await supabase.storage.from("documents").remove([uploadData.path]);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Storage Error",
          message: "Failed to generate file URL",
        }),
        { status: 500 }
      );
    }

    // Step 2: Insert record into database using Drizzle
    const table = documentType === "resumes" ? resumes : coverLetters;
    const [dbData] = await db
      .insert(table)
      .values({
        userId,
        filePath: uploadData.path,
        fileName: fileName.trim(),
        fileSize: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: table.id });

    // Revalidate the docs page to show the new file
    revalidatePath("/docs");

    // Extract structured resume data in the background (resumes only)
    if (documentType === "resumes") {
      after(async () => {
        try {
          const { success, text } = await extractTextFromFile(file);
          if (!success || !text) {
            console.error("Resume text extraction failed for record:", dbData.id);
            return;
          }

          const agent = new ResumeDataExtractorAgent();
          const resumeData = await agent.extractResumeData(text);

          await db
            .update(resumes)
            .set({ resumeData })
            .where(eq(resumes.id, dbData.id));
        } catch (error) {
          console.error("Resume data extraction failed:", error);
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: dbData.id,
          url: uploadedFileUrl,
          filePath: uploadData.path,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/docs error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        message: `Failed to upload document: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}
