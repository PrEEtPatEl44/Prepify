import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractTextFromDOCX } from "@/lib/textExtraction";

interface ParseResumeResponse {
  success: boolean;
  data?: {
    extractedText: string;
    keywords: string[];
    skills: string[];
  };
  error?: string;
  message?: string;
}

/**
 * POST /api/resume/parse
 * Extract keywords from a resume file
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Get the current user
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const resumeId = formData.get("resumeId") as string | null;

    if (!file && !resumeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "Either file or resumeId is required",
        },
        { status: 400 }
      );
    }

    let extractedText = "";

    // If file is provided, extract text directly
    if (file) {
      extractedText = await extractTextFromDOCX(file);
    } else if (resumeId) {
      // If resumeId is provided, fetch the file from storage
      const { data: resumeData, error: resumeError } = await supabase
        .from("resumes")
        .select("file_path")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single();

      if (resumeError || !resumeData) {
        return NextResponse.json(
          {
            success: false,
            error: "Not Found",
            message: "Resume not found",
          },
          { status: 404 }
        );
      }

      // Download the file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("documents")
        .download(resumeData.file_path);

      if (downloadError) {
        return NextResponse.json(
          {
            success: false,
            error: "Storage Error",
            message: `Failed to download resume: ${downloadError.message}`,
          },
          { status: 500 }
        );
      }

      // Convert Blob to File
      const fileFromStorage = new File([fileData], "resume.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      extractedText = await extractTextFromDOCX(fileFromStorage);
    }

    // Extract keywords using OpenRouter API
    const keywords = await extractKeywords(extractedText);

    const response: ParseResumeResponse = {
      success: true,
      data: {
        extractedText,
        keywords: keywords.keywords,
        skills: keywords.skills,
      },
      message: "Resume parsed successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("POST /api/resume/parse error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to parse resume",
      },
      { status: 500 }
    );
  }
}

/**
 * Extract keywords from text using OpenRouter API
 */
async function extractKeywords(text: string): Promise<{
  keywords: string[];
  skills: string[];
}> {
  try {
    // Check if API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("OpenRouter API key not found, using fallback extraction");
      return extractKeywordsFallback(text);
    }

    // Limit text to avoid token limits
    const textToAnalyze = text.length > 8000 ? text.substring(0, 8000) : text;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Prepify Resume Parser",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-3b-instruct:free", // Updated model
          messages: [
            {
              role: "system",
              content:
                "You are an expert resume analyzer. Extract relevant job search keywords and technical skills from the provided resume text. Return ONLY a valid JSON object with two arrays: 'keywords' (job titles, industries, roles) and 'skills' (technical skills, tools, technologies). Example: {\"keywords\": [\"software engineer\", \"full stack\"], \"skills\": [\"javascript\", \"react\"]}",
            },
            {
              role: "user",
              content: `Extract job-relevant keywords and skills from this resume:\n\n${textToAnalyze}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`);
      return extractKeywordsFallback(text);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      };
    } catch (parseError) {
      console.error("Error parsing OpenRouter response:", parseError);
      return extractKeywordsFallback(text);
    }
  } catch (error) {
    console.error("Error extracting keywords with AI:", error);
    return extractKeywordsFallback(text);
  }
}

/**
 * Fallback keyword extraction using simple text analysis
 */
function extractKeywordsFallback(text: string): {
  keywords: string[];
  skills: string[];
} {
  const commonSkills = [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "react",
    "angular",
    "vue",
    "node",
    "express",
    "django",
    "flask",
    "spring",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "git",
    "jenkins",
    "agile",
    "scrum",
    "html",
    "css",
    "sass",
    "webpack",
    "rest",
    "graphql",
    "api",
    "microservices",
    "ci/cd",
    "testing",
    "jest",
    "junit",
  ];

  const lowerText = text.toLowerCase();

  // Extract skills that appear in the text
  const foundSkills = commonSkills.filter((skill) =>
    lowerText.includes(skill)
  );

  // Extract potential job titles and roles
  const jobTitlePatterns = [
    /\b(software|web|frontend|backend|full[\s-]?stack|mobile|data|devops|cloud|security)\s*(developer|engineer|architect|analyst|scientist)\b/gi,
    /\b(project|product|program|engineering|technical)\s*manager\b/gi,
    /\b(senior|junior|lead|principal|staff)\s*(engineer|developer)\b/gi,
  ];

  const keywords = new Set<string>();

  jobTitlePatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => keywords.add(match.toLowerCase().trim()));
    }
  });

  // If no keywords found, add some generic ones based on skills
  if (keywords.size === 0 && foundSkills.length > 0) {
    keywords.add("software developer");
    keywords.add("software engineer");
  }

  return {
    keywords: Array.from(keywords).slice(0, 10),
    skills: foundSkills.slice(0, 15),
  };

  
}




