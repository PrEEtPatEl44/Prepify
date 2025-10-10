import { NextResponse } from "next/server";
import { jobService } from "@/lib/services/jobService";
import { GetColumnsResponse, ApiError } from "@/types/api";

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
