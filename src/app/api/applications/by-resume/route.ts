import { NextResponse } from "next/server";
import { GetJobsResponse, ApiError } from "@/types/api";
import { createClient } from "@/utils/supabase/server";
import { transformDbRowToJob } from "@/adapters/jobAdapters";

/**
 * GET /api/applications/by-resume?resume_id=xxx
 * Retrieve all job applications for a specific resume
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resume_id");

    if (!resumeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "resume_id query parameter is required",
        },
        { status: 400 }
      );
    }

    console.log(
      `GET /api/applications/by-resume - Fetching jobs for resume_id: ${resumeId}`
    );

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
      .eq("resume_id", resumeId)
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

    if (!jobs || jobs.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            jobs: [],
            total: 0,
          },
          message: `No job applications found for resume ID: ${resumeId}`,
        },
        { status: 200 }
      );
    }

    const transformedJobs = jobs.map(transformDbRowToJob);

    console.log(`Found ${jobs.length} job(s) for resume_id: ${resumeId}`);

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
    console.error("GET /api/applications/by-resume error:", error);

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
