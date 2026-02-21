"use server"

import { db } from "@/db"
import { getAuthUserId } from "@/db/auth"
import { jobApplications, resumes } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"
import { ResumeEditorAgent } from "@/lib/agents/resumeEditor"
import { buildJakeResume } from "@/lib/data/jake-resume-template"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getResumeForJob(
  jobId: string,
): Promise<{
  success: boolean
  data?: {
    resumeId: string
    resumeData: ResumeData
    filePath: string
    pdfBase64: string
    jobTitle: string
    companyName: string
  }
  error?: string
}> {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return { success: false, error: "User not authenticated. Please log in." }
    }

    // Fetch job with its resume
    const [job] = await db
      .select({
        resumeId: jobApplications.resumeId,
        jobTitle: jobApplications.jobTitle,
        companyName: jobApplications.companyName,
      })
      .from(jobApplications)
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId)),
      )
      .limit(1)

    if (!job || !job.resumeId) {
      return { success: false, error: "No resume found for this job" }
    }

    // Fetch resume data
    const [resume] = await db
      .select({
        id: resumes.id,
        resumeData: resumes.resumeData,
        filePath: resumes.filePath,
      })
      .from(resumes)
      .where(and(eq(resumes.id, job.resumeId), eq(resumes.userId, userId)))
      .limit(1)

    if (!resume || !resume.resumeData) {
      return { success: false, error: "Resume data not found" }
    }

    const resumeData = resume.resumeData as ResumeData

    // Build LaTeX and compile to PDF
    const latexContent = buildJakeResume(resumeData)
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

    return {
      success: true,
      data: {
        resumeId: resume.id,
        resumeData,
        filePath: resume.filePath,
        pdfBase64,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
      },
    }
  } catch (error) {
    console.error("getResumeForJob error:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}

export async function editResumeChat(
  resumeData: ResumeData,
  userMessage: string,
): Promise<{
  success: boolean
  data?: {
    resumeData: ResumeData
    pdfBase64: string
    assistantMessage: string
  }
  error?: string
}> {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return { success: false, error: "User not authenticated. Please log in." }
    }

    // Edit resume via agent
    const editorAgent = new ResumeEditorAgent()
    const updatedData = await editorAgent.editResume(resumeData, userMessage)

    // Build LaTeX and compile
    const latexContent = buildJakeResume(updatedData)
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

    return {
      success: true,
      data: {
        resumeData: updatedData,
        pdfBase64,
        assistantMessage: "I've updated the resume based on your instructions. The changes are reflected in the preview.",
      },
    }
  } catch (error) {
    console.error("editResumeChat error:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}

export async function saveResumeEdits(
  resumeId: string,
  resumeData: ResumeData,
  pdfBase64: string,
  existingFilePath: string,
): Promise<{ success: boolean; data?: { filePath: string }; error?: string }> {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return { success: false, error: "User not authenticated. Please log in." }
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, "base64")

    // Upload to Supabase Storage (overwrite existing file)
    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .update(existingFilePath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}`,
      }
    }

    // Update resume record in DB
    await db
      .update(resumes)
      .set({
        resumeData,
        fileSize: pdfBuffer.byteLength,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))

    revalidatePath("/jobs")
    revalidatePath("/docs")

    return { success: true, data: { filePath: existingFilePath } }
  } catch (error) {
    console.error("saveResumeEdits error:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}
