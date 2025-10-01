"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface UploadFileResult {
  success: boolean;
  data?: {
    fileName: string;
    filePath: string;
    fileUrl: string;
  };
  error?: string;
}

// uploads the file to supabase storage and creates a record in the database
export async function uploadFileAction(
  formData: FormData,
  documentType: "resumes" | "coverLetters"
): Promise<UploadFileResult> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    // Extract form data
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    if (!fileName?.trim()) {
      return {
        success: false,
        error: "File name is required",
      };
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const sanitizedFileName = fileName.trim().replace(/[^a-zA-Z0-9-_]/g, "_");
    const storageFileName = `${user.id}/${documentType}/${timestamp}_${sanitizedFileName}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storageFileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from("documents")
      .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7); // 7 days expiry

    const uploadedFileUrl = urlData?.signedUrl;

    if (!uploadedFileUrl) {
      return {
        success: false,
        error: "Failed to generate file URL",
      };
    }

    // Determine table name based on document type
    const tableName = documentType === "resumes" ? "resumes" : "cover_letters";

    // Insert record into database
    const { error: insertError } = await supabase.from(tableName).insert({
      user_id: user.id,
      file_path: uploadData.path,
      file_name: fileName.trim(),
      file_size: file.size,
      mime_type: file.type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      // Try to clean up the uploaded file if database insert fails
      await supabase.storage.from("documents").remove([uploadData.path]);

      return {
        success: false,
        error: `Database error: ${insertError.message}`,
      };
    }

    // Revalidate the docs page to show the new file
    revalidatePath("/docs");

    return {
      success: true,
      data: {
        fileName: fileName.trim(),
        filePath: uploadData.path,
        fileUrl: uploadedFileUrl,
      },
    };
  } catch (error) {
    console.error("Upload action error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      error: `Upload failed: ${errorMessage}`,
    };
  }
}
