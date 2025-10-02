"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface InsertDocumentResult {
  success: boolean;
  data?: {
    id: string;
  };
  error?: string;
}

interface DocumentRecordData {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: "resumes" | "coverLetters";
}

export interface GetAllDocumentsResult {
  success: boolean;
  data?: {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: string;
    updated_at: string;
  }[];
  error?: string;
}

// Inserts a document record into the database
export async function insertDocumentRecord(
  documentData: DocumentRecordData
): Promise<InsertDocumentResult> {
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

    // Validate input data
    if (!documentData.filePath || !documentData.fileName) {
      return {
        success: false,
        error: "File path and name are required",
      };
    }

    // Determine table name based on document type
    const tableName =
      documentData.documentType === "resumes" ? "resumes" : "cover_letters";

    // Insert record into database
    const { data, error: insertError } = await supabase
      .from(tableName)
      .insert({
        user_id: user.id,
        file_path: documentData.filePath,
        file_name: documentData.fileName,
        file_size: documentData.fileSize,
        mime_type: documentData.mimeType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
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
        id: data.id,
      },
    };
  } catch (error) {
    console.error("Insert document record error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      error: `Database insert failed: ${errorMessage}`,
    };
  }
}

// Get all documents from the database for a specific document type
export async function getAllDocuments(
  documentType: "resumes" | "coverLetters"
): Promise<GetAllDocumentsResult> {
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

    // Determine table name based on document type
    const tableName = documentType === "resumes" ? "resumes" : "cover_letters";

    // Query documents from the database
    const { data, error: queryError } = await supabase
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Database query error:", queryError);
      return {
        success: false,
        error: `Database query failed: ${queryError.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get all documents error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      error: `Failed to fetch documents: ${errorMessage}`,
    };
  }
}
