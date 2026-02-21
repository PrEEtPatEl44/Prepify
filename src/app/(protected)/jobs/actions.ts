"use server";

import { db } from "@/db";
import { jobApplications, columns as columnsTable, resumes, userProfiles } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and } from "drizzle-orm";
import { type Column, type CreateJob, type Job } from "@/types/jobs";
import { transformDbRowToJob } from "@/adapters/jobAdapters";
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"
import { ResumeTailorAgent } from "@/lib/agents/resumeTailor"
import { buildJakeResume } from "@/lib/data/jake-resume-template";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function deleteColumn(
  columnId: string
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
      .delete(columnsTable)
      .where(and(eq(columnsTable.id, columnId), eq(columnsTable.userId, userId)));

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function generateResumeFromProfile(
  jobId: string
): Promise<{ success: boolean; data?: { resumeId: string; fileName: string; filePath: string; resumeData: ResumeData; pdfBase64: string }; error?: string }> {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return { success: false, error: "User not authenticated. Please log in." }
    }

    // Fetch job application to get company name and description
    const [job] = await db
      .select({
        companyName: jobApplications.companyName,
        jobDescription: jobApplications.jobDescription,
      })
      .from(jobApplications)
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId))
      )
      .limit(1)

    if (!job) {
      return { success: false, error: "Job application not found" }
    }

    // Fetch user profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1)

    if (!profile?.profileData) {
      return { success: false, error: "Please create a profile first" }
    }

    let profileData = profile.profileData as ResumeData

    // Tailor resume to job description if available
    if (job.jobDescription) {
      try {
        const tailorAgent = new ResumeTailorAgent()
        profileData = await tailorAgent.tailorResume(profileData, job.jobDescription)
      } catch (error) {
        console.error("Resume tailoring failed, using untailored profile:", error)
      }
    }

    // Build LaTeX from profile data
    const latexContent = buildJakeResume(profileData)

    // Compile LaTeX to PDF
    const latexServiceUrl = process.env.LATEX_SERVICE_URL
    if (!latexServiceUrl) {
      return { success: false, error: "LaTeX service URL not configured" }
    }

    const compileResponse = await fetch(`${latexServiceUrl}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latex: latexContent,
        compiler: "pdflatex",
        filename: "resume.tex",
      }),
    })

    if (!compileResponse.ok) {
      const errorData = await compileResponse.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.message || "Failed to compile LaTeX to PDF",
      }
    }

    const pdfBuffer = Buffer.from(await compileResponse.arrayBuffer())
    const pdfBase64 = pdfBuffer.toString("base64")

    // Upload PDF to Supabase Storage
    const supabase = await createClient()
    const timestamp = Date.now()
    const sanitizedCompany = job.companyName.trim().replace(/[^a-zA-Z0-9-_]/g, "_")
    const storagePath = `${userId}/resumes/${timestamp}_resume_${sanitizedCompany}.pdf`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      return { success: false, error: `Storage upload failed: ${uploadError.message}` }
    }

    // Insert resume record
    const [newResume] = await db
      .insert(resumes)
      .values({
        userId,
        fileName: `Resume_${job.companyName}`,
        filePath: uploadData.path,
        fileSize: pdfBuffer.byteLength,
        mimeType: "application/pdf",
        resumeData: profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning({ id: resumes.id })

    // Link resume to job application
    await db
      .update(jobApplications)
      .set({ resumeId: newResume.id, updatedAt: new Date().toISOString() })
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId))
      )

    revalidatePath("/jobs")
    revalidatePath("/docs")

    return { success: true, data: { resumeId: newResume.id, fileName: `Resume_${job.companyName}`, filePath: uploadData.path, resumeData: profileData, pdfBase64 } }
  } catch (error) {
    console.error("generateResumeFromProfile error:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}
