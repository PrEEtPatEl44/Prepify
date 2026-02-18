import { type ResumeData } from "@/lib/agents/resumeDataExtractor"

export type { ResumeData as ProfileData }

export interface GetProfileResult {
  success: boolean
  data?: ResumeData | null
  error?: string
}
