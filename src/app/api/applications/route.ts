import { NextResponse } from "next/server";
import { GetJobsResponse, ApiError } from "@/types/api";
import { createClient } from "@/utils/supabase/server";
import { transformDbRowToJob } from "@/adapters/jobAdapters";

/**
 * GET /api/applications
 * Retrieve all job applications
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/applications - Fetching all jobs");

    const supabase = await createClient();

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

    const { data: jobs, error: jobsError } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (jobsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve jobs",
          message: jobsError.message,
        },
        { status: 500 }
      );
    }

    if (!jobs) {
      return NextResponse.json(
        {
          success: false,
          error: "No jobs found",
          message: "No job applications found for the user",
        },
        { status: 404 }
      );
    }
    const transformedJobs = jobs.map(transformDbRowToJob);

    console.log(`Found ${jobs.length} total jobs`);

    const response: GetJobsResponse = {
      success: true,
      data: {
        jobs: transformedJobs,
        total: transformedJobs.length,
      },
      message: "Jobs retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/applications error:", error);

    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Failed to retrieve jobs",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
