// Main API Route for Job Applications
// File: src/app/api/applications/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jobService } from "@/lib/services/jobService";
import {
  CreateJobRequest,
  GetJobsResponse,
  CreateJobResponse,
  ApiError,
} from "@/types/api";

/**
 * GET /api/applications
 * Retrieve all job applications
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("GET /api/applications - Fetching all jobs");

    // Extract query parameters for potential filtering/searching
    const { searchParams } = new URL(request.url);
    const column = searchParams.get("column");
    const search = searchParams.get("search");

    let jobs;

    if (column) {
      // Filter by column if specified
      jobs = await jobService.getJobsByColumn(column);
      console.log(`Found ${jobs.length} jobs in column: ${column}`);
    } else if (search) {
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

/**
 * POST /api/applications
 * Create a new job application
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("POST /api/applications - Creating new job");

    // Parse request body
    const body: CreateJobRequest = await request.json();
    console.log("Request body:", body);

    // Basic validation
    if (!body.title || !body.companyName) {
      const errorResponse: ApiError = {
        success: false,
        error: "Validation Error",
        message: "Title and company name are required fields",
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate column if provided
    const validColumns = ["col-1", "col-2", "col-3", "col-4"];
    if (body.columnId && !validColumns.includes(body.columnId)) {
      const errorResponse: ApiError = {
        success: false,
        error: "Validation Error",
        message: `Invalid column. Must be one of: ${validColumns.join(", ")}`,
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create the job
    const newJob = await jobService.createJob(body);
    console.log("Created job:", newJob);

    const response: CreateJobResponse = {
      success: true,
      data: {
        job: newJob,
      },
      message: "Job application created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("required")) {
      const errorResponse: ApiError = {
        success: false,
        error: "Validation Error",
        message: error.message,
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Handle other errors
    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Failed to create job",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
