import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { InterviewOrchestrator } from "@/lib/agents/interview-agents";
import { extractTextFromDOCX } from "@/lib/textExtraction";
import { db } from "@/db";
import { jobApplications, resumes } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and } from "drizzle-orm";

interface GenerateInterviewRequest {
  jobId: string;
  difficulty?: "easy" | "intermediate" | "hard";
  type?: "technical" | "behavioral" | "mixed";
  questionCount?: number;
}

interface GenerateInterviewResponse {
  success: boolean;
  data?: {
    questions: Array<{
      id: number;
      text: string;
      topic: string;
    }>;
    metadata: {
      totalQuestions: number;
      generatedAt: string;
    };
    jobInfo: {
      title: string;
      companyName: string;
    };
  };
  error?: string;
  message?: string;
}

/**
 * POST /api/interview/generate
 * Generate interview questions based on job and resume
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateInterviewResponse>> {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        },
        { status: 401 }
      );
    }

    const body: GenerateInterviewRequest = await request.json();
    const {
      jobId,
      difficulty = "intermediate",
      type = "mixed",
      questionCount = 5,
    } = body;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "jobId is required",
        },
        { status: 400 }
      );
    }

    console.log("Request body:", jobId);
    console.log("User ID:", userId);

    // Fetch job details
    const [jobData] = await db
      .select({
        jobTitle: jobApplications.jobTitle,
        companyName: jobApplications.companyName,
        jobDescription: jobApplications.jobDescription,
        resumeId: jobApplications.resumeId,
      })
      .from(jobApplications)
      .where(
        and(eq(jobApplications.id, jobId), eq(jobApplications.userId, userId))
      );

    console.log("Fetched job data:", jobData);
    if (!jobData) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    const { jobTitle, companyName, jobDescription, resumeId } = jobData;

    if (!jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Job description is missing",
        },
        { status: 400 }
      );
    }

    // Extract resume text
    let resumeText = "";

    if (resumeId) {
      // Fetch resume file path
      const [resumeData] = await db
        .select({ filePath: resumes.filePath })
        .from(resumes)
        .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)));

      if (!resumeData) {
        console.warn("Resume not found, proceeding without resume analysis");
      } else {
        // Download the file from storage (still uses Supabase)
        const supabase = await createClient();
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("documents")
          .download(resumeData.filePath);

        if (downloadError) {
          console.warn(
            "Failed to download resume:",
            downloadError.message,
            "- proceeding without resume analysis"
          );
        } else {
          // Convert Blob to File and extract text
          const fileFromStorage = new File([fileData], "resume.docx", {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          });

          try {
            resumeText = await extractTextFromDOCX(fileFromStorage);
          } catch (extractError) {
            console.warn(
              "Failed to extract resume text:",
              extractError,
              "- proceeding without resume analysis"
            );
          }
        }
      }
    }

    // If no resume text, provide a default context
    if (!resumeText) {
      resumeText = `Candidate applying for ${jobTitle} at ${companyName}. No resume provided.`;
    }

    // Initialize interview orchestrator
    // Primary: Use OpenAI if available, Fallback: Use OpenRouter
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    const modelName = process.env.OPENAI_API_KEY
      ? process.env.OPENAI_MODEL_NAME || "gpt-4o-mini"
      : process.env.OPENROUTER_MODEL_NAME ||
        "meta-llama/llama-3.2-3b-instruct:free";

    const orchestrator = new InterviewOrchestrator(apiKey, modelName);

    // Generate interview questions with user settings
    const result = await orchestrator.prepareInterview(
      resumeText,
      jobDescription,
      {
        difficulty,
        type,
        questionCount,
      }
    );

    // Map questions to response format with IDs
    const allQuestions = result.questions.questions.map((q, index) => ({
      id: index + 1,
      text: q.question,
      topic: q.topic,
    }));

    const response: GenerateInterviewResponse = {
      success: true,
      data: {
        questions: allQuestions,
        metadata: {
          totalQuestions: result.metadata.total_questions,
          generatedAt: result.metadata.generated_at,
        },
        jobInfo: {
          title: jobTitle,
          companyName: companyName,
        },
      },
      message: "Interview questions generated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("POST /api/interview/generate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate interview questions",
      },
      { status: 500 }
    );
  }
}
