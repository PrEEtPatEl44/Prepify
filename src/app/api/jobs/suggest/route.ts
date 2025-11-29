import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { extractTextFromDOCX } from "@/lib/textExtraction";

interface JobSuggestion {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  matchedKeywords: string[];
}

interface JobSuggestResponse {
  success: boolean;
  data?: {
    jobs: JobSuggestion[];
    keywords: string[];
    skills: string[];
  };
  error?: string;
  message?: string;
}

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description?: string;
  job_apply_link?: string;
  job_google_link?: string;
}

/**
 * POST /api/jobs/suggest
 * Extract keywords from resume and suggest matching jobs
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
    const limit = parseInt(formData.get("limit") as string) || 3;

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

    // Step 1: Extract text from resume
    let extractedText = "";

    if (file) {
      extractedText = await extractTextFromDOCX(file);
    } else if (resumeId) {
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

      console.log("Downloading file from path:", resumeData.file_path);

      // Download the file from storage with correct path
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("documents")
        .download(resumeData.file_path);

      if (downloadError) {
        console.error("Storage download error:", downloadError);
        return NextResponse.json(
          {
            success: false,
            error: "Storage Error",
            message: `Failed to download resume: ${downloadError.message}`,
          },
          { status: 500 }
        );
      }

      if (!fileData) {
        return NextResponse.json(
          {
            success: false,
            error: "Storage Error",
            message: "File data is empty",
          },
          { status: 500 }
        );
      }

      console.log("File downloaded successfully, size:", fileData.size);

      // Convert Blob to File
      const fileFromStorage = new File([fileData], "resume.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      extractedText = await extractTextFromDOCX(fileFromStorage);
    }

    // Step 2: Extract keywords and skills
    const { keywords, skills } = extractKeywordsFromText(extractedText);

    // Read optional query params forwarded from the client
    const url = new URL(request.url);
    const employment_types =
      url.searchParams.get("employment_types") || undefined;
    const country = url.searchParams.get("country") || undefined;

    // Step 3: Search for matching jobs
    const allSearchTerms = [...keywords, ...skills];
    const jobs = await searchJobs(
      allSearchTerms,
      limit,
      employment_types,
      country
    );

    const response: JobSuggestResponse = {
      success: true,
      data: {
        jobs,
        keywords,
        skills,
      },
      message: `Found ${jobs.length} matching job${
        jobs.length !== 1 ? "s" : ""
      }`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("POST /api/jobs/suggest error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "Failed to suggest jobs",
      },
      { status: 500 }
    );
  }
}

/**
 * Extract keywords and skills from resume text
 */
function extractKeywordsFromText(text: string): {
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
    "php",
    "ruby",
    "go",
    "rust",
    "swift",
    "kotlin",
    "react",
    "angular",
    "vue",
    "svelte",
    "next.js",
    "nextjs",
    "node.js",
    "nodejs",
    "express",
    "django",
    "flask",
    "spring",
    "asp.net",
    "rails",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "dynamodb",
    "elasticsearch",
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "heroku",
    "docker",
    "kubernetes",
    "jenkins",
    "circleci",
    "github actions",
    "git",
    "github",
    "gitlab",
    "agile",
    "scrum",
    "kanban",
    "html",
    "css",
    "sass",
    "tailwind",
    "bootstrap",
    "webpack",
    "vite",
    "rest api",
    "graphql",
    "microservices",
    "ci/cd",
    "devops",
    "terraform",
    "jest",
    "pytest",
    "junit",
    "tensorflow",
    "pytorch",
    "pandas",
    "numpy",
  ];

  const lowerText = text.toLowerCase();

  // Extract skills
  const foundSkills = commonSkills.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );

  // Extract job titles
  const jobTitlePatterns = [
    /\b(senior|junior|lead|principal|staff|mid-level|entry-level)?\s*(software|web|frontend|backend|full[\s-]?stack|mobile|data|devops|cloud)\s+(developer|engineer|architect|programmer)\b/gi,
    /\b(project|product|program|engineering|technical)\s+manager\b/gi,
    /\b(ui|ux|product)\s+designer\b/gi,
    /\b(data|business|systems)\s+(analyst|scientist)\b/gi,
  ];

  const keywords = new Set<string>();

  jobTitlePatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => keywords.add(match.toLowerCase().trim()));
    }
  });

  // Infer job roles from skills if no explicit titles found
  if (keywords.size === 0) {
    const skillBasedRoles = inferRolesFromSkills(foundSkills);
    skillBasedRoles.forEach((role) => keywords.add(role));
  }

  return {
    keywords: Array.from(keywords).slice(0, 10),
    skills: foundSkills.slice(0, 15),
  };
}

/**
 * Infer job roles from detected skills
 */
function inferRolesFromSkills(skills: string[]): string[] {
  const roles: string[] = [];

  if (
    skills.some((s) => ["react", "vue", "angular", "html", "css"].includes(s))
  ) {
    roles.push("frontend developer");
  }
  if (
    skills.some((s) =>
      ["node.js", "nodejs", "express", "django", "flask"].includes(s)
    )
  ) {
    roles.push("backend developer");
  }
  if (skills.some((s) => ["react", "node.js", "typescript"].includes(s))) {
    roles.push("full stack developer");
  }
  if (
    skills.some((s) =>
      ["python", "tensorflow", "pytorch", "pandas"].includes(s)
    )
  ) {
    roles.push("data scientist");
  }
  if (
    skills.some((s) => ["aws", "docker", "kubernetes", "devops"].includes(s))
  ) {
    roles.push("devops engineer");
  }

  return roles;
}

/**
 * Search for jobs using JSearch API (RapidAPI)
 */
async function searchJobs(
  searchTerms: string[],
  limit: number,
  employment_types?: string | undefined,
  country?: string | undefined
): Promise<JobSuggestion[]> {
  try {
    // Ensure API key is a string before using it in headers
    const apiKey = process.env.RAPIDAPI_KEY || "";
    if (!apiKey) {
      console.warn("RapidAPI key not found, using mock data");
      return searchJobsMock(searchTerms, limit);
    }

    // Prioritize job titles and use the FIRST one found
    const jobTitles = searchTerms.filter(
      (term) =>
        term.includes("developer") ||
        term.includes("engineer") ||
        term.includes("scientist") ||
        term.includes("designer") ||
        term.includes("analyst") ||
        term.includes("manager")
    );

    // Use the most specific job title, or fallback to top 2 skills combined
    let query = "";
    if (jobTitles.length > 0) {
      query = jobTitles[0];
    } else {
      query = searchTerms.slice(0, 2).join(" ");
    }

    console.log("Searching JSearch API for:", query);
    console.log("All extracted terms:", searchTerms);
    console.log("Forwarding params to JSearch:", { employment_types, country });

    // Append optional params if provided
    const extraQs: string[] = [];
    if (employment_types)
      extraQs.push(`employment_types=${encodeURIComponent(employment_types)}`);
    if (country) extraQs.push(`country=${encodeURIComponent(country)}`);

    const extra = extraQs.length > 0 ? `&${extraQs.join("&")}` : "";

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        query
      )}&page=1&num_pages=1&date_posted=all${extra}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`JSearch API error: ${response.status} - ${errorText}`);
      return searchJobsMock(searchTerms, limit);
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log("No jobs found from JSearch API, using mock data");
      return searchJobsMock(searchTerms, limit);
    }

    console.log(`Found ${data.data.length} jobs from JSearch API`);

    // Transform JSearch results to our format
    const jobs: JobSuggestion[] = (data.data as JSearchJob[])
      .slice(0, limit * 3) // Get more jobs to filter from
      .map((job: JSearchJob) => {
        const description = job.job_description || "";
        const lowerDescription = description.toLowerCase();
        const lowerTitle = job.job_title.toLowerCase();

        // Calculate match score based on how many search terms appear
        const matchedKeywords = searchTerms.filter(
          (term) =>
            lowerDescription.includes(term.toLowerCase()) ||
            lowerTitle.includes(term.toLowerCase())
        );

        // Give a base score to all jobs from the search, then boost based on matches
        const baseScore = 40; // Jobs returned by API are at least somewhat relevant
        const matchBonus =
          matchedKeywords.length > 0
            ? Math.round(
                (matchedKeywords.length / Math.min(searchTerms.length, 10)) * 60
              )
            : 0;

        const matchScore = Math.min(100, baseScore + matchBonus);

        return {
          id: job.job_id,
          title: job.job_title,
          company: job.employer_name,
          location:
            job.job_city && job.job_state
              ? `${job.job_city}, ${job.job_state}`
              : job.job_country || "Remote",
          description: job.job_description
            ? job.job_description.substring(0, 250) + "..."
            : "No description available",
          url: job.job_apply_link || job.job_google_link || "#",
          matchScore,
          matchedKeywords: matchedKeywords.slice(0, 5),
        };
      });

    // Sort by match score and return top results
    const topJobs = jobs
      .sort((a: JobSuggestion, b: JobSuggestion) => b.matchScore - a.matchScore)
      .slice(0, limit);

    // If we got jobs, return them; otherwise fallback to mock
    return topJobs.length > 0 ? topJobs : searchJobsMock(searchTerms, limit);
  } catch (error) {
    console.error("Error searching jobs with JSearch API:", error);
    return searchJobsMock(searchTerms, limit);
  }
}

/**
 * Fallback mock job search when API fails or is unavailable
 */
function searchJobsMock(searchTerms: string[], limit: number): JobSuggestion[] {
  console.log("Using mock job data as fallback");

  const mockJobs = [
    {
      id: "mock-1",
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      location: "Remote",
      description:
        "Looking for an experienced frontend developer with React, TypeScript, and modern web technologies. Build scalable applications with a focus on user experience.",
      url: "https://www.indeed.com/jobs?q=senior+frontend+developer&l=remote",
      keywords: [
        "frontend developer",
        "react",
        "typescript",
        "javascript",
        "html",
        "css",
      ],
    },
    {
      id: "mock-2",
      title: "Full Stack Software Engineer",
      company: "Startup Inc",
      location: "New York, NY",
      description:
        "Join our team as a full stack engineer. Must know Node.js, React, PostgreSQL, and AWS. Work on exciting projects that impact millions of users.",
      url: "https://www.linkedin.com/jobs/search/?keywords=full%20stack%20engineer",
      keywords: [
        "full stack",
        "software engineer",
        "node.js",
        "react",
        "sql",
        "aws",
        "typescript",
      ],
    },
    {
      id: "mock-3",
      title: "Backend Developer - Python",
      company: "Data Solutions",
      location: "San Francisco, CA",
      description:
        "We need a backend developer skilled in Python, Django, PostgreSQL, and REST APIs. Help us build robust data processing pipelines.",
      url: "https://www.indeed.com/jobs?q=backend+python+developer&l=San+Francisco",
      keywords: ["backend developer", "python", "django", "sql", "rest api"],
    },
    {
      id: "mock-4",
      title: "DevOps Engineer",
      company: "Cloud Systems",
      location: "Remote",
      description:
        "Seeking a DevOps engineer with experience in AWS, Docker, Kubernetes, and CI/CD pipelines. Build and maintain cloud infrastructure.",
      url: "https://www.dice.com/jobs?q=devops+engineer&location=Remote",
      keywords: [
        "devops engineer",
        "aws",
        "docker",
        "kubernetes",
        "ci/cd",
        "terraform",
      ],
    },
    {
      id: "mock-5",
      title: "Data Scientist",
      company: "AI Labs",
      location: "Boston, MA",
      description:
        "Join our data science team. Experience with Python, TensorFlow, pandas, and machine learning required. Work on cutting-edge AI projects.",
      url: "https://www.indeed.com/jobs?q=data+scientist&l=Boston",
      keywords: [
        "data scientist",
        "python",
        "tensorflow",
        "pandas",
        "machine learning",
      ],
    },
  ];

  // Calculate match scores
  const jobsWithScores = mockJobs.map((job) => {
    const matchedKeywords = job.keywords.filter((keyword) =>
      searchTerms.some(
        (term) =>
          term.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().includes(term.toLowerCase())
      )
    );

    const matchScore =
      matchedKeywords.length > 0
        ? Math.min(
            100,
            Math.round(
              (matchedKeywords.length /
                Math.min(searchTerms.length, job.keywords.length)) *
                100
            )
          )
        : 0;

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: job.url,
      matchScore,
      matchedKeywords,
    };
  });

  return jobsWithScores
    .filter((job) => job.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
