import { NextResponse } from "next/server";
import { GetColumnsResponse, ApiError } from "@/types/api";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/applications/columns
 * Retrieve all columns
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/applications/columns - Fetching all columns");
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

    const { data: columns, error: columnError } = await supabase
      .from("columns")
      .select("*")
      .eq("user_id", user.id);

    if (columnError) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve columns",
          message: columnError.message,
        },
        { status: 500 }
      );
    }

    if (!columns) {
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
        columns,
      },
      message: "Columns retrieved successfully",
    };
    console.log("GET /api/applications/columns - Columns retrieved:", columns);
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
