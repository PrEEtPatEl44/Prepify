import { NextResponse } from "next/server";
import { GetColumnsResponse, ApiError } from "@/types/api";
import { db } from "@/db";
import { columns } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq } from "drizzle-orm";

/**
 * GET /api/applications/columns
 * Retrieve all columns
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/applications/columns - Fetching all columns");

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

    const userColumns = await db
      .select()
      .from(columns)
      .where(eq(columns.userId, userId));

    if (!userColumns || userColumns.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No columns found",
          message: "No columns found for the user",
        },
        { status: 404 }
      );
    }

    const response: GetColumnsResponse = {
      success: true,
      data: {
        columns: userColumns,
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
