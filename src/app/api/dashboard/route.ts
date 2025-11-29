import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
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
          message: "User not authenticated",
          error: authError?.message,
        },
        { status: 401 }
      );
    }

    // Get counts for job_applications and interview_feedback
    const { count: jobsCount, error: jobsError } = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true });

    if (jobsError) {
      console.error("Error fetching jobs count:", jobsError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch jobs count",
          error: jobsError.message,
        },
        { status: 500 }
      );
    }

    const { count: interviewsCount, error: interviewsError } = await supabase
      .from("interview_feedback")
      .select("id", { count: "exact", head: true });

    if (interviewsError) {
      console.error("Error fetching interviews count:", interviewsError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch interviews count",
          error: interviewsError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs_count: jobsCount ?? 0,
        interviews_count: interviewsCount ?? 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching dashboard counts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
