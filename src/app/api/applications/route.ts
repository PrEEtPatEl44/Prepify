import { NextRequest, NextResponse } from "next/server";
import { jobService } from "@/lib/services/jobService";
import { GetJobsResponse, ApiError } from "@/types/api";

/**
 * GET /api/applications
 * Retrieve all job applications
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("GET /api/applications - Fetching all jobs");

    // Extract query parameters for potential filtering/searching
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let jobs;

    if (search) {
      // Search functionality
      jobs = await jobService.searchJobs(search);
      console.log(`Found ${jobs.length} jobs matching search: ${search}`);
    } else {
      // Get all jobs
      jobs = await jobService.getAllJobs();
      console.log(`Found ${jobs.length} total jobs`);
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
