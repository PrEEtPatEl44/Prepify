import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the output schema for simple job analysis
const jobAnalysisSchema = z.object({
  job_title: z.string().describe("The job title"),
  key_skills: z
    .array(z.string())
    .describe("3-5 key skills required for the role"),
  candidate_experience: z
    .string()
    .describe("Brief summary of candidate's relevant experience"),
  focus_areas: z
    .array(z.string())
    .describe("2-3 main areas to focus on in interview"),
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
      template: `You are an interview preparation assistant. Analyze the job and candidate briefly.

**Job Description:**
{jobDescription}

**Candidate's Resume:**
{resumeText}

Provide a simple analysis including:
1. Job title
2. 3-5 key skills needed for the role
3. Brief summary of candidate's relevant experience (1-2 sentences)
4. 2-3 main focus areas for interview questions

Keep it concise and straightforward.

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
    const summaryPrompt = `Based on the following interview analysis, provide a concise 1-2 sentence summary:

Job: ${analysis.job_title}
Key Skills: ${analysis.key_skills.join(", ")}
Experience: ${analysis.candidate_experience}
Focus Areas: ${analysis.focus_areas.join(", ")}

Summary:`;

    const response = await this.llm.invoke(summaryPrompt);
    return response.content as string;
  }
}
