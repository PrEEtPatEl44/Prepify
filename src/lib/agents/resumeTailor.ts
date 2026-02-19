import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { resumeDataSchema, type ResumeData } from "./resumeDataExtractor";

/**
 * Resume Tailor Agent
 * Takes a user's profile data and a job description, then produces
 * a tailored ResumeData with rephrased bullets, reordered skills,
 * and an adjusted summary to match the target role.
 */
export class ResumeTailorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof resumeDataSchema>
  >;

  constructor(apiKey?: string, modelName?: string) {
    const useOpenAI = apiKey || process.env.OPENAI_API_KEY;
    const useOpenRouter = !useOpenAI && process.env.OPENROUTER_API_KEY;

    if (useOpenAI) {
      this.llm = new ChatOpenAI({
        model: modelName || process.env.OPENAI_MODEL_NAME || "gpt-4o-mini",
        apiKey: apiKey || process.env.OPENAI_API_KEY,
        temperature: 0.3,
        maxRetries: 2,
      });
    } else if (useOpenRouter) {
      this.llm = new ChatOpenAI({
        configuration: {
          baseURL:
            process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer":
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Prepify Resume Tailoring",
          },
        },
        model:
          modelName ||
          process.env.OPENROUTER_MODEL_NAME ||
          "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: 0.3,
        maxRetries: 2,
      });
    } else {
      throw new Error(
        "No API key found. Please provide either OPENAI_API_KEY or OPENROUTER_API_KEY environment variable.",
      );
    }

    this.parser = StructuredOutputParser.fromZodSchema(resumeDataSchema);
  }

  /**
   * Tailor resume data to match a specific job description
   */
  async tailorResume(
    profileData: ResumeData,
    jobDescription: string,
  ): Promise<ResumeData> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are an expert resume writer and career coach. Given a candidate's profile data and a target job description, produce a tailored version of the resume data optimized for this specific role.

STRICT RULES — you MUST follow these:
1. NEVER fabricate experience, companies, job titles, degrees, certifications, or skills that are not in the original profile.
2. Rewrite the summary/objective to target the specific role described in the job description.
3. Rewrite work experience bullet points to emphasize achievements, metrics, and responsibilities most relevant to the target role. Use strong action verbs and quantify results where the original data supports it.
4. Reorder bullet points within each role so the most relevant ones appear first.
5. Reorder skills categories and items within each category by relevance to the job.
6. Reorder projects by relevance to the job. You may remove irrelevant projects but keep at least 2.
7. Keep all contact info (name, email, phone, location, links) EXACTLY as-is.
8. Keep all education entries, certifications, and dates EXACTLY as-is — do not modify them.
9. Preserve ALL work experience entries — do not remove any roles.
10. In case a summary is not provided or is very generic, create a new one that targets the job description, but do not add any information that is not supported by the original profile data.
CANDIDATE PROFILE:
{profileData}

TARGET JOB DESCRIPTION:
{jobDescription}

{format_instructions}`,
      inputVariables: ["profileData", "jobDescription"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      profileData: JSON.stringify(profileData, null, 2),
      jobDescription,
    });
    const response = await this.llm.invoke(input);
    return this.parser.parse(response.content as string);
  }
}
