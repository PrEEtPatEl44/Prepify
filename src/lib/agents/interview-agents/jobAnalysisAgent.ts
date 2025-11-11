import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the output schema for job analysis
const jobAnalysisSchema = z.object({
  role_overview: z.object({
    position_level: z
      .string()
      .describe("Entry-level, Mid-level, Senior, or Lead position"),
    key_responsibilities: z
      .array(z.string())
      .describe("Primary responsibilities for the role"),
    required_qualifications: z
      .array(z.string())
      .describe("Must-have qualifications"),
  }),
  candidate_strengths: z.object({
    matching_skills: z
      .array(z.string())
      .describe("Skills from resume that match job requirements"),
    relevant_experience: z
      .array(z.string())
      .describe("Relevant work experience that aligns with the job"),
    educational_fit: z
      .string()
      .describe("How candidate's education aligns with requirements"),
  }),
  skill_gaps: z.object({
    technical_gaps: z
      .array(z.string())
      .describe("Technical skills mentioned in job but missing from resume"),
    experience_gaps: z
      .array(z.string())
      .describe("Experience areas that need clarification or are missing"),
    soft_skill_gaps: z
      .array(z.string())
      .describe("Soft skills that need assessment during interview"),
  }),
  focus_areas: z.object({
    technical_topics: z
      .array(z.string())
      .describe("Technical areas to explore in the interview"),
    behavioral_topics: z
      .array(z.string())
      .describe("Behavioral competencies to assess"),
    scenario_topics: z
      .array(z.string())
      .describe("Situational scenarios to present"),
  }),
  red_flags: z
    .array(z.string())
    .describe("Areas requiring special attention or clarification"),
  interview_recommendations: z.object({
    difficulty_level: z
      .enum(["basic", "intermediate", "advanced", "expert"])
      .describe("Recommended difficulty level for questions"),
    time_allocation: z.object({
      technical: z
        .number()
        .describe("Percentage of time for technical questions"),
      behavioral: z
        .number()
        .describe("Percentage of time for behavioral questions"),
      situational: z
        .number()
        .describe("Percentage of time for situational questions"),
    }),
    priority_areas: z
      .array(z.string())
      .describe("Top 3-5 areas to prioritize in the interview"),
  }),
});

export type JobAnalysisResult = z.infer<typeof jobAnalysisSchema>;

/**
 * Job Analysis Agent
 * Analyzes resume and job description to identify key areas for interview focus
 */
export class JobAnalysisAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof jobAnalysisSchema>
  >;

  constructor(apiKey?: string, modelName?: string) {
    // Check if OpenAI API key is available, otherwise fall back to OpenRouter
    const useOpenAI = apiKey || process.env.OPENAI_API_KEY;
    const useOpenRouter = !useOpenAI && process.env.OPENROUTER_API_KEY;

    if (useOpenAI) {
      // Primary: Use OpenAI directly
      console.log("api key", process.env.OPENAI_API_KEY);
      console.log("Using OpenAI LLM for Job Analysis Agent");
      this.llm = new ChatOpenAI({
        model: modelName || process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        apiKey: apiKey || process.env.OPENAI_API_KEY,
        temperature: 0.4,
        maxRetries: 2,
      });
    } else if (useOpenRouter) {
      // Fallback: Use OpenRouter
      this.llm = new ChatOpenAI({
        configuration: {
          baseURL:
            process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Prepify Interview Analysis",
          },
        },
        model:
          modelName ||
          process.env.OPENROUTER_MODEL_NAME ||
          "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: 0.4,
        maxRetries: 2,
      });
    } else {
      throw new Error(
        "No API key found. Please provide either OPENAI_API_KEY or OPENROUTER_API_KEY environment variable."
      );
    }

    this.parser = StructuredOutputParser.fromZodSchema(jobAnalysisSchema);
  }

  /**
   * Analyze resume against job description for interview preparation
   */
  async analyzeForInterview(
    resumeText: string,
    jobDescription: string
  ): Promise<JobAnalysisResult> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are an expert technical recruiter and interview preparation specialist with deep knowledge of various industries and roles.

Your task is to analyze the candidate's resume against the job description to prepare a comprehensive interview strategy.

**Job Description:**
{jobDescription}

**Candidate's Resume:**
{resumeText}

Perform a thorough analysis focusing on:

1. **Role Overview**: Understand the position level and core requirements
2. **Candidate Strengths**: Identify what the candidate brings that matches the role
3. **Skill Gaps**: Pinpoint areas where the candidate may lack experience or need to demonstrate competency
4. **Focus Areas**: Determine which topics should be explored during the interview
5. **Red Flags**: Note any concerns or areas requiring clarification
6. **Interview Recommendations**: Provide strategic guidance for conducting the interview

Be objective and thorough. Consider both technical and behavioral aspects. The goal is to help prepare targeted interview questions that will effectively assess the candidate's fit for the role.

{format_instructions}`,
      inputVariables: ["resumeText", "jobDescription"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      resumeText,
      jobDescription,
    });

    const response = await this.llm.invoke(input);
    const parsed = await this.parser.parse(response.content as string);

    return parsed;
  }

  /**
   * Generate a quick summary of the analysis
   */
  async generateAnalysisSummary(analysis: JobAnalysisResult): Promise<string> {
    const summaryPrompt = `Based on the following interview analysis, provide a concise 2-3 sentence summary of the candidate's fit for the role and key interview focus areas:

Matching Skills: ${analysis.candidate_strengths.matching_skills.join(", ")}
Technical Gaps: ${analysis.skill_gaps.technical_gaps.join(", ")}
Priority Areas: ${analysis.interview_recommendations.priority_areas.join(", ")}

Summary:`;

    const response = await this.llm.invoke(summaryPrompt);
    return response.content as string;
  }
}
