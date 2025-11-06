import { NextRequest, NextResponse } from "next/server";
import { ResumeAnalysisOrchestrator } from "@/lib/agents/orchestrator";

/**
 * POST /api/resume-analysis
 * Analyzes a resume against a job description using LangChain agents
 *
 * Request body:
 * {
 *   "resume": "string - full resume text",
 *   "jobDescription": "string - full job description text"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    // Validate inputs
    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: "Both resume and jobDescription are required" },
        { status: 400 }
      );
    }

    if (typeof resume !== "string" || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Resume and jobDescription must be strings" },
        { status: 400 }
      );
    }

    // Check for OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Create orchestrator and analyze
    const orchestrator = new ResumeAnalysisOrchestrator();
    const result = await orchestrator.analyzeResume(resume, jobDescription);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
