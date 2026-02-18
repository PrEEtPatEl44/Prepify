"use server"

import { db } from "@/db"
import { userProfiles, resumes } from "@/db/schema"
import { getAuthUserId } from "@/db/auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { type ResumeData } from "@/lib/agents/resumeDataExtractor"

export async function upsertProfile(
  data: ResumeData
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return { success: false, error: "User not authenticated. Please log in." }
    }

    await db
      .insert(userProfiles)
      .values({
        userId,
        profileData: data,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          profileData: data,
          updatedAt: new Date(),
        },
      })

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("upsertProfile error:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}

export async function getResumeDataById(
  resumeId: string
): Promise<{ success: boolean; data?: ResumeData; error?: string }> {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return { success: false, error: "User not authenticated. Please log in." }
    }

    const [resume] = await db
      .select({ resumeData: resumes.resumeData })
      .from(resumes)
      .where(eq(resumes.id, resumeId))

    if (!resume) {
      return { success: false, error: "Resume not found." }
    }

    if (!resume.resumeData) {
      return { success: false, error: "Resume data has not been extracted yet." }
    }

    return { success: true, data: resume.resumeData as ResumeData }
  } catch (error) {
    console.error("getResumeDataById error:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}
