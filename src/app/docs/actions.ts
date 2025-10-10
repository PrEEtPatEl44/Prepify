"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  type DocumentRecordData,
  type InsertDocumentResult,
  type DeleteDocumentResult,
} from "@/types/docs";

// Inserts a document record into the database
// storage upload is handled in the client side due to limitations with server actions request size
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

// Delete a document from both storage and database
export async function deleteDocument(
  documentId: string,
  filePath: string,
  documentType: "resumes" | "coverLetters"
): Promise<DeleteDocumentResult> {
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
    console.log("Deleting document:", documentId, filePath, documentType);
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([filePath]);

    if (storageError) {
      console.error("Failed to delete file from storage:", storageError);
      alert(`Failed to delete file from storage: ${storageError.message}`);
      return {
        success: false,
        error: `Failed to delete file from storage: ${storageError.message}`,
      };
    }

    // Determine table name based on document type
    const tableName = documentType === "resumes" ? "resumes" : "cover_letters";

    // Delete from database
    const { error: dbError } = await supabase
      .from(tableName)
      .delete()
      .eq("id", documentId)
      .eq("user_id", user.id); // Extra security check

    if (dbError) {
      console.error("Failed to delete file from database:", dbError);
      return {
        success: false,
        error: `Failed to delete file from database: ${dbError.message}`,
      };
    }

    // Revalidate the docs page to update the file list
    revalidatePath("/docs");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete document error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      error: `Failed to delete document: ${errorMessage}`,
    };
  }
}
