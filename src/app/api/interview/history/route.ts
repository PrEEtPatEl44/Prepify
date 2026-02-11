import { NextResponse } from "next/server";
import { db } from "@/db";
import { interviewFeedback } from "@/db/schema";
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

    // Fetch all interview feedback with job application details using relational query
    const interviews = await db.query.interviewFeedback.findMany({
      where: eq(interviewFeedback.userId, userId),
      orderBy: [desc(interviewFeedback.createdAt)],
      with: {
        jobApplication: {
          columns: {
            id: true,
            jobTitle: true,
            companyName: true,
            companyDomain: true,
            jobUrl: true,
          },
        },
      },
    });

    // Transform interviews to match the existing API shape
    const transformedInterviews = interviews.map((interview) => {
      const { jobApplication, ...rest } = interview;
      return {
        ...rest,
        job_applications: {
          id: jobApplication.id,
          job_title: jobApplication.jobTitle,
          company_name: jobApplication.companyName,
          company_domain: jobApplication.companyDomain,
          job_url: jobApplication.jobUrl,
          company_icon_url: jobApplication.companyDomain
            ? `https://cdn.brandfetch.io/${jobApplication.companyDomain}?c=${process.env.BRANDFETCH_CLIENT_ID}`
            : "/logo.svg",
          application_link: jobApplication.jobUrl || "",
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        interviews: transformedInterviews,
      },
    });
  } catch (error) {
    console.error("Unexpected error fetching interview history:", error);
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
