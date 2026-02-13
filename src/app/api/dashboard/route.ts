import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const [jobsResult] = await db
      .select({ value: count() })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId));

    return NextResponse.json({
      success: true,
      data: {
        jobs_count: jobsResult?.value ?? 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching dashboard counts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
