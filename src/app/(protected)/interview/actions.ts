"use server";

import { createClient } from "@/utils/supabase/server";
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "User not authenticated",
        error: authError?.message,
      };
    }

    // Insert interview feedback into database
    const { data: insertedData, error: insertError } = await supabase
      .from("interview_feedback")
      .insert({
        user_id: user.id,
        job_id: data.jobId,
        overall_score: data.overallScore,
        general_comments: data.generalComments,
        questions_feedback: data.questionsFeedback,
        interview_duration: data.interviewDuration,
        difficulty: data.difficulty,
        type: data.type,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting interview feedback:", insertError);
      return {
        success: false,
        message: "Failed to save interview feedback",
        error: insertError.message,
      };
    }

    // Revalidate the interview page
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "User not authenticated",
        error: authError?.message,
      };
    }

    let query = supabase
      .from("interview_feedback")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filter by job_id if provided
    if (jobId) {
      query = query.eq("job_id", jobId);
    }

    const { data: feedbackData, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching interview feedback:", fetchError);
      return {
        success: false,
        message: "Failed to fetch interview feedback",
        error: fetchError.message,
      };
    }

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
