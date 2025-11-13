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

    // Fetch all interview feedback for the user with job application details
    const { data: interviews, error: fetchError } = await supabase
      .from("interview_feedback")
      .select(
        `
        *,
        job_applications (
          id,
          job_title,
          company_name,
          company_domain,
          job_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching interview history:", fetchError);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch interview history",
          error: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Transform interviews to include company_icon_url
    const transformedInterviews = (interviews || []).map((interview) => ({
      ...interview,
      job_applications: {
        ...interview.job_applications,
        company_icon_url: interview.job_applications.company_domain
          ? `https://cdn.brandfetch.io/${interview.job_applications.company_domain}?c=${process.env.BRANDFETCH_CLIENT_ID}`
          : "/logo.svg",
        application_link: interview.job_applications.job_url || "",
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        interviews: transformedInterviews,
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching interview history:", error);
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
