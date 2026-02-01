import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GetAllTemplatesResult } from "@/types/templates";

/**
 * GET /api/templates
 * Retrieve all templates for the authenticated user
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/templates - Fetching all templates");

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

    const { data: templates, error: templatesError } = await supabase
      .from("templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (templatesError) {
      console.error("Database query error:", templatesError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to retrieve templates",
          message: templatesError.message,
        },
        { status: 500 }
      );
    }

    const response: GetAllTemplatesResult = {
      success: true,
      data: templates || [],
    };

    console.log(`Found ${templates?.length || 0} templates`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("GET /api/templates error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve templates",
      },
      { status: 500 }
    );
  }
}
