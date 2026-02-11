"use server";

import { db } from "@/db";
import { interviewFeedback } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface QuestionFeedback {
  question: string;
  userAnswer: string;
  areasOfImprovement: string[];
  suggestedAnswer: string;
  score: number;
}

interface InterviewFeedbackData {
  jobId: string;
  overallScore: number;
  generalComments: string;
  questionsFeedback: QuestionFeedback[];
  interviewDuration: number;
  difficulty: "easy" | "intermediate" | "hard";
  type: "technical" | "behavioral" | "mixed";
}

export async function uploadInterview(data: InterviewFeedbackData) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
        error: "Not authenticated",
      };
    }

    const [insertedData] = await db
      .insert(interviewFeedback)
      .values({
        userId,
        jobId: data.jobId,
        overallScore: data.overallScore,
        generalComments: data.generalComments,
        questionsFeedback: data.questionsFeedback,
        interviewDuration: data.interviewDuration,
        difficulty: data.difficulty,
        type: data.type,
      })
      .returning();

    revalidatePath("/interview");

    return {
      success: true,
      message: "Interview feedback saved successfully",
      data: insertedData,
    };
  } catch (error) {
    console.error("Unexpected error saving interview feedback:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getInterviewFeedback(jobId?: string) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
        error: "Not authenticated",
      };
    }

    const conditions = [eq(interviewFeedback.userId, userId)];
    if (jobId) {
      conditions.push(eq(interviewFeedback.jobId, jobId));
    }

    const feedbackData = await db
      .select()
      .from(interviewFeedback)
      .where(and(...conditions))
      .orderBy(desc(interviewFeedback.createdAt));

    return {
      success: true,
      data: feedbackData,
    };
  } catch (error) {
    console.error("Unexpected error fetching interview feedback:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
