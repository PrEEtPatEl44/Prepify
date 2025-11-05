type JobResult = {
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_country?: string;
  job_employment_type?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_description?: string;
  job_apply_link?: string;
};

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keywords } = body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or empty keywords list provided",
        },
        { status: 400 }
      );
    }

    // Combine keywords into a search query string
    const searchQuery = keywords.slice(0, 5).join(" OR "); // limit for performance

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&num_pages=1`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("JSearch API Error:", response.status, errorText);
      return NextResponse.json(
        { success: false, message: "Job API request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const jobs = ((data.data as JobResult[]) || [])
  .slice(0, 3)
  .map((job) => ({

        title: job.job_title,
        company: job.employer_name,
        location: job.job_city || job.job_country,
        job_type: job.job_employment_type,
        salary: job.job_min_salary
          ? `$${job.job_min_salary} - $${job.job_max_salary}`
          : "Not provided",
        description: job.job_description?.slice(0, 200) + "...",
        link: job.job_apply_link,
      }));

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("Job match error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
