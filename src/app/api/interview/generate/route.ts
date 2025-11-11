import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { InterviewOrchestrator } from "@/lib/agents/interview-agents";
import { extractTextFromDOCX } from "@/lib/textExtraction";

interface GenerateInterviewRequest {
  jobId: string;
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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
    const { jobId } = body;

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
    console.log("User ID:", user.id);
    // Fetch job details
    const { data: jobData, error: jobError } = await supabase
      .from("job_applications")
      .select("job_title, company_name, job_description, resume_id")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    console.log("Fetched job data:", jobData);
    if (jobError || !jobData) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          message: "Job not found",
        },
        { status: 404 }
      );
    }

    const { job_title, company_name, job_description, resume_id } = jobData;

    if (!job_description) {
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

    if (resume_id) {
      // Fetch resume file path
      const { data: resumeData, error: resumeError } = await supabase
        .from("resumes")
        .select("file_path")
        .eq("id", resume_id)
        .eq("user_id", user.id)
        .single();

      if (resumeError || !resumeData) {
        console.warn("Resume not found, proceeding without resume analysis");
      } else {
        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("documents")
          .download(resumeData.file_path);

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
      resumeText = `Candidate applying for ${job_title} at ${company_name}. No resume provided.`;
    }

    // Initialize interview orchestrator
    // Primary: Use OpenAI if available, Fallback: Use OpenRouter
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
    const modelName = process.env.OPENAI_API_KEY
      ? process.env.OPENAI_MODEL_NAME || "gpt-4o-mini"
      : process.env.OPENROUTER_MODEL_NAME ||
        "meta-llama/llama-3.2-3b-instruct:free";

    const orchestrator = new InterviewOrchestrator(apiKey, modelName);

    // Generate 5 simple interview questions
    const result = await orchestrator.prepareInterview(
      resumeText,
      job_description
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
          title: job_title,
          companyName: company_name,
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
