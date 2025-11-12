import { NextRequest, NextResponse } from "next/server";
import { FeedbackGeneratorAgent } from "@/lib/agents/interview-agents";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewData } = body;

    if (!interviewData || !Array.isArray(interviewData)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid interview data provided",
        },
        { status: 400 }
      );
    }

    // Initialize the feedback generator agent
    const feedbackAgent = new FeedbackGeneratorAgent();

    // Generate feedback
    const feedback = await feedbackAgent.generateFeedback(interviewData);

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate feedback",
      },
      { status: 500 }
    );
  }
}
