import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { buildJakeResume } from "@/lib/data/jake-resume-template";

/**
 * POST /api/docs/template-resume
 * Generate a PDF from a resume's extracted data using the Jake template
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: "resumeId is required" },
        { status: 400 },
      );
    }

    // Fetch resume_data for this resume owned by the current user
    const { data: resume, error: queryError } = await supabase
      .from("resumes")
      .select("resume_data")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (queryError || !resume) {
      return NextResponse.json(
        { success: false, error: "Resume not found" },
        { status: 404 },
      );
    }

    if (!resume.resume_data) {
      return NextResponse.json(
        { success: false, error: "Resume data not yet extracted" },
        { status: 404 },
      );
    }

    // Generate LaTeX from the structured resume data
    const latex = buildJakeResume(resume.resume_data);

    // Compile LaTeX to PDF
    const latexServiceUrl = process.env.LATEX_SERVICE_URL;
    if (!latexServiceUrl) {
      return NextResponse.json(
        { success: false, error: "LaTeX service URL not configured" },
        { status: 500 },
      );
    }

    const compileResponse = await fetch(`${latexServiceUrl}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latex,
        compiler: "pdflatex",
        filename: "resume.tex",
      }),
    });

    if (!compileResponse.ok) {
      const errorData = await compileResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Failed to compile LaTeX",
          details: errorData.details,
        },
        { status: compileResponse.status },
      );
    }

    const pdfBuffer = await compileResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=resume.pdf",
      },
    });
  } catch (error) {
    console.error("POST /api/docs/template-resume error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate template resume",
      },
      { status: 500 },
    );
  }
}
