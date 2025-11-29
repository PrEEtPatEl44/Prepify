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

    // Fetch job_applications for the user (only need created_at and id)
    const { data: jobs, error: fetchError } = await supabase
      .from("job_applications")
      .select("id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error(
        "Error fetching job applications for calendar:",
        fetchError
      );
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch job applications",
          error: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Aggregate counts by date (YYYY-MM-DD)
    const countsByDate: Record<string, number> = (jobs || []).reduce(
      (acc: Record<string, number>, job) => {
        if (!job.created_at) return acc;
        const date = new Date(job.created_at).toISOString().slice(0, 10);
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    const calendar = Object.entries(countsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    return NextResponse.json({
      success: true,
      data: {
        calendar,
      },
    });
  } catch (error) {
    console.error(
      "Unexpected error fetching job applications calendar:",
      error
    );
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
