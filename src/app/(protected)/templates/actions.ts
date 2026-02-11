"use server";

import { db } from "@/db";
import { templates } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  type CreateTemplateResult,
  type DeleteTemplateResult,
} from "@/types/templates";

export async function createTemplate(
  name: string,
  type: "resume" | "cover_letter",
  content: string
): Promise<CreateTemplateResult> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
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

    const [template] = await db
      .insert(templates)
      .values({
        userId,
        name,
        type,
        content,
        filePath: null,
      })
      .returning();

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
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    await db
      .delete(templates)
      .where(and(eq(templates.id, templateId), eq(templates.userId, userId)));

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
