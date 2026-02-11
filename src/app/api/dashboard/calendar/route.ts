import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobApplications } from "@/db/schema";
import { getAuthUserId } from "@/db/auth";
import { eq, desc } from "drizzle-orm";

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

    // Fetch job_applications for the user (only need created_at and id)
    const jobs = await db
      .select({
        id: jobApplications.id,
        createdAt: jobApplications.createdAt,
      })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.createdAt));

    // Aggregate counts by date (YYYY-MM-DD)
    const countsByDate: Record<string, number> = (jobs || []).reduce(
      (acc: Record<string, number>, job) => {
        if (!job.createdAt) return acc;
        const date = new Date(job.createdAt).toISOString().slice(0, 10);
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    const calendar = Object.entries(countsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    return NextResponse.json({
      success: true,
      data: {
        calendar,
      },
    });
  } catch (error) {
    console.error(
      "Unexpected error fetching job applications calendar:",
      error
    );
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
