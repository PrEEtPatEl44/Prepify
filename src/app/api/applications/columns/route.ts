import { NextRequest, NextResponse } from "next/server";
import { jobService } from "@/lib/services/jobService";
import {
  CreateColumnRequest,
  CreateColumnResponse,
  GetColumnsResponse,
  ApiError,
} from "@/types/api";

/**
 * GET /api/applications/columns
 * Retrieve all columns
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/applications/columns - Fetching all columns");
    const columns = await jobService.getAllColumns();
    console.log(`Found ${columns.length} total columns`);

    const response: GetColumnsResponse = {
      success: true,
      data: {
        columns,
      },
      message: "Columns retrieved successfully",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/applications/columns error:", error);
    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Failed to retrieve columns",
      statusCode: 500,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/applications/columns
 * Create a new column
 */

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("POST /api/applications/columns - Creating new column");

    const columnData: CreateColumnRequest = await request.json();

    if (!columnData.name) {
      const errorResponse: ApiError = {
        success: false,
        error: "Bad Request",
        message: "Column name is required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const newColumn = await jobService.createColumn(columnData);
    console.log(`Created new column with ID: ${newColumn.id}`);

    const response: CreateColumnResponse = {
      success: true,
      data: {
        column: newColumn,
      },
      message: "Column created successfully",
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications/columns error:", error);
    const errorResponse: ApiError = {
      success: false,
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "Failed to create column",
      statusCode: 500,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
