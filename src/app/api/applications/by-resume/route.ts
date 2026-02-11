import { NextResponse } from "next/server";
import { GetJobsResponse, ApiError } from "@/types/api";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, and, desc } from "drizzle-orm";
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
      .where(
        and(
          eq(jobApplications.userId, userId),
          eq(jobApplications.resumeId, resumeId)
        )
      )
      .orderBy(desc(jobApplications.createdAt));

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
