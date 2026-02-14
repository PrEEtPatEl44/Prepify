"use server";

import { db } from "@/db";
import { jobApplications, columns as columnsTable } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and } from "drizzle-orm";
import { type Column, type CreateJob, type Job } from "@/types/jobs";
import { transformDbRowToJob } from "@/adapters/jobAdapters";

// create a job record in the database
export async function createJob(
  data: CreateJob
): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    if (
      !data.title ||
      !data.companyName ||
      !data.description ||
      !data.applicationLink
    ) {
      return {
        success: false,
        error: "Missing required fields to create a job.",
      };
    }

    // Get columnId from data or fetch the first column as default
    let columnId = data.columnId;
    if (!columnId) {
      const userColumns = await db
        .select()
        .from(columnsTable)
        .where(eq(columnsTable.userId, userId));

      if (userColumns.length > 0) {
        columnId = userColumns[0].id;
      } else {
        return {
          success: false,
          error: "No columns found. Please create a column first.",
        };
      }
    }

    const [job] = await db
      .insert(jobApplications)
      .values({
        userId,
        jobTitle: data.title,
        companyName: data.companyName,
        columnId,
        jobDescription: data.description,
        jobUrl: data.applicationLink,
        resumeId: data.resumeId || null,
        coverLetterId: data.coverLetterId || null,
        companyDomain: data.companyDomain,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return { success: true, data: transformDbRowToJob(job) as Job };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function editJob(
  jobId: string,
  data: Partial<CreateJob>
): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    // Build the update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.jobTitle = data.title;
    if (data.companyName !== undefined)
      updateData.companyName = data.companyName;
    if (data.columnId !== undefined) updateData.columnId = data.columnId;
    if (data.description !== undefined)
      updateData.jobDescription = data.description;
    if (data.applicationLink !== undefined)
      updateData.jobUrl = data.applicationLink;
    if (data.resumeId !== undefined) updateData.resumeId = data.resumeId;
    if (data.coverLetterId !== undefined)
      updateData.coverLetterId = data.coverLetterId;
    if (data.companyDomain !== undefined)
      updateData.companyDomain = data.companyDomain;

    const [job] = await db
      .update(jobApplications)
      .set(updateData)
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId))
      )
      .returning();

    return { success: true, data: transformDbRowToJob(job) as Job };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function deleteJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    await db
      .delete(jobApplications)
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId))
      );

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function moveJob(
  jobId: string,
  newColumnId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    await db
      .update(jobApplications)
      .set({ columnId: newColumnId, updatedAt: new Date().toISOString() })
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId))
      );

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function createColumn(
  name: string,
  color?: string
): Promise<{ success: boolean; data?: Column; error?: string }> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    const [column] = await db
      .insert(columnsTable)
      .values({
        userId,
        name,
        ...(color && { color }),
      })
      .returning();

    return { success: true, data: column as Column };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function updateColumn(
  columnId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    await db
      .update(columnsTable)
      .set({ name })
      .where(and(eq(columnsTable.id, columnId), eq(columnsTable.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}
