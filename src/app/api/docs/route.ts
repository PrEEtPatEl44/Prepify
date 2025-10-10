import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
// GET /api/docs

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get("type");

    if (documentType !== "resumes" && documentType !== "coverLetters") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Bad Request",
          message: "Invalid document type",
        }),
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
          message: "User not authenticated. Please log in.",
        }),
        { status: 401 }
      );
    }

    // Query only id, file_name, and file_path from the specified table
    const tableName = documentType === "resumes" ? "resumes" : "cover_letters";
    const { data, error: queryError } = await supabase
      .from(tableName)
      .select("id, file_name, file_path")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      console.error("Database query error:", queryError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Database Error",
          message: `Database query failed: ${queryError.message}`,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data || [],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/docs error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        message: `Failed to fetch documents info: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}
