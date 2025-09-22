// Individual Job API Route
// File: src/app/api/applications/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { jobService } from "@/lib/services/jobService";
import {
  UpdateJobRequest,
  UpdateJobResponse,
  DeleteJobResponse,
  ApiError,
} from "@/types/api";

/**
 * GET /api/applications/[id]
 * Get a specific job application by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log(`GET /api/applications/${id} - Fetching job`);

    if (!id) {
      const errorResponse: ApiError = {
        success: false,
        error: "Bad Request",
        message: "Job ID is required",
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const job = await jobService.getJobById(id);

    if (!job) {
      const errorResponse: ApiError = {
        success: false,
        error: "Not Found",
        message: `Job with ID ${id} not found`,
        statusCode: 404,
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    console.log(`Found job: ${job.name} at ${job.company}`);

    const response = {
      success: true,
      data: {
        job,
      },
      message: "Job retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`GET /api/applications/${params.id} error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Failed to retrieve job",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/applications/[id]
 * Update a specific job application
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log(`PUT /api/applications/${id} - Updating job`);

    if (!id) {
      const errorResponse: ApiError = {
        success: false,
        error: "Bad Request",
        message: "Job ID is required",
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse request body
    const body: UpdateJobRequest = await request.json();
    console.log("Update data:", body);

    // Validate column if provided
    const validColumns = ["col-1", "col-2", "col-3", "col-4"];
    if (body.column && !validColumns.includes(body.column)) {
      const errorResponse: ApiError = {
        success: false,
        error: "Validation Error",
        message: `Invalid column. Must be one of: ${validColumns.join(", ")}`,
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Prevent empty name or company
    if (body.name === "" || body.company === "") {
      const errorResponse: ApiError = {
        success: false,
        error: "Validation Error",
        message: "Name and company cannot be empty",
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const updatedJob = await jobService.updateJob(id, body);

    if (!updatedJob) {
      const errorResponse: ApiError = {
        success: false,
        error: "Not Found",
        message: `Job with ID ${id} not found`,
        statusCode: 404,
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    console.log(`Updated job: ${updatedJob.name} at ${updatedJob.company}`);

    const response: UpdateJobResponse = {
      success: true,
      data: {
        job: updatedJob,
      },
      message: "Job application updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`PUT /api/applications/${params.id} error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Failed to update job",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete a specific job application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    console.log(`DELETE /api/applications/${id} - Deleting job`);

    if (!id) {
      const errorResponse: ApiError = {
        success: false,
        error: "Bad Request",
        message: "Job ID is required",
        statusCode: 400,
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const deleted = await jobService.deleteJob(id);

    if (!deleted) {
      const errorResponse: ApiError = {
        success: false,
        error: "Not Found",
        message: `Job with ID ${id} not found`,
        statusCode: 404,
      };

      return NextResponse.json(errorResponse, { status: 404 });
    }

    console.log(`Deleted job with ID: ${id}`);

    const response: DeleteJobResponse = {
      success: true,
      data: {
        deletedId: id,
      },
      message: "Job application deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/applications/${params.id} error:`, error);

    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Failed to delete job",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
