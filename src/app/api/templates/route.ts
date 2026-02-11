import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, desc } from "drizzle-orm";
import { GetAllTemplatesResult } from "@/types/templates";

/**
 * GET /api/templates
 * Retrieve all templates for the authenticated user
 */
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/templates - Fetching all templates");

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

    const userTemplates = await db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(desc(templates.createdAt));

    const response: GetAllTemplatesResult = {
      success: true,
      data: userTemplates,
    };

    console.log(`Found ${userTemplates.length} templates`);

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
