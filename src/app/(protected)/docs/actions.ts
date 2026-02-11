"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { resumes, coverLetters } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type DeleteDocumentResult } from "@/types/docs";

// Delete a document from both storage and database
export async function deleteDocument(
  documentId: string,
  filePath: string,
  documentType: "resumes" | "coverLetters"
): Promise<DeleteDocumentResult> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    console.log("Deleting document:", documentId, filePath, documentType);

    // Delete from storage (still uses Supabase client)
    const supabase = await createClient();
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([filePath]);

    if (storageError) {
      console.error("Failed to delete file from storage:", storageError);
      return {
        success: false,
        error: `Failed to delete file from storage: ${storageError.message}`,
      };
    }

    // Delete from database using Drizzle
    const table = documentType === "resumes" ? resumes : coverLetters;
    await db
      .delete(table)
      .where(and(eq(table.id, documentId), eq(table.userId, userId)));

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
