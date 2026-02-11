import { NextResponse } from "next/server";
import { GetJobsResponse, ApiError } from "@/types/api";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, desc } from "drizzle-orm";
import { transformDbRowToJob } from "@/adapters/jobAdapters";

/**
 * GET /api/applications
 * Retrieve all job applications
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/applications - Fetching all jobs");

    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        },
        { status: 401 }
      );
    }

    const jobs = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.createdAt));

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
