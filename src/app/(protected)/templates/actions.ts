"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type CreateTemplateResult, type DeleteTemplateResult } from "@/types/templates";

export async function createTemplate(
  name: string,
  type: "resume" | "cover_letter",
  content: string
): Promise<CreateTemplateResult> {
  try {
    const supabase = await createClient();

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

    if (!name || !type || !content) {
      return {
        success: false,
        error: "Name, type, and content are required.",
      };
    }

    if (type !== "resume" && type !== "cover_letter") {
      return {
        success: false,
        error: "Type must be 'resume' or 'cover_letter'.",
      };
    }

    const { data: template, error: insertError } = await supabase
      .from("templates")
      .insert({
        user_id: user.id,
        name,
        type,
        content,
        file_path: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return {
        success: false,
        error: insertError.message,
      };
    }

    revalidatePath("/templates");

    return {
      success: true,
      data: template,
    };
  } catch (error) {
    console.error("Create template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create template",
    };
  }
}

export async function deleteTemplate(
  templateId: string
): Promise<DeleteTemplateResult> {
  try {
    const supabase = await createClient();

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

    const { error: deleteError } = await supabase
      .from("templates")
      .delete()
      .eq("id", templateId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return {
        success: false,
        error: deleteError.message,
      };
    }

    revalidatePath("/templates");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete template error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete template",
    };
  }
}
