import { NextResponse } from "next/server";
import { jobService } from "@/lib/services/jobService";
import { GetJobsResponse, ApiError } from "@/types/api";

/**
 * GET /api/applications
 * Retrieve all job applications
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/applications - Fetching all jobs");

    // Get all jobs
    const jobs = await jobService.getAllJobs();
    console.log(`Found ${jobs.length} total jobs`);

    if (jobs.length === 0) {
      console.log("No jobs found for the user");
    }

    const response: GetJobsResponse = {
      success: true,
      data: {
        jobs,
        total: jobs.length,
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
