import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the output schema for holistic comparison
const holisticComparisonSchema = z.object({
  holistic_score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall compatibility score (0-100)"),
  experience_match: z
    .object({
      score: z.number().min(0).max(100),
      analysis: z.string(),
    })
    .describe("How well the candidate's experience matches job requirements"),
  qualification_match: z
    .object({
      score: z.number().min(0).max(100),
      analysis: z.string(),
    })
    .describe("How well the candidate's qualifications match job requirements"),
  cultural_fit: z
    .object({
      score: z.number().min(0).max(100),
      analysis: z.string(),
    })
    .describe("Potential cultural and value alignment"),
  career_trajectory: z
    .object({
      score: z.number().min(0).max(100),
      analysis: z.string(),
    })
    .describe("How the role aligns with candidate's career progression"),
  strengths: z.array(z.string()).describe("Key strengths and positive aspects"),
  areas_for_improvement: z
    .array(z.string())
    .describe("Areas where the candidate could improve or gaps to address"),
  overall_assessment: z
    .string()
    .describe("Comprehensive assessment of the match"),
});

export type HolisticComparison = z.infer<typeof holisticComparisonSchema>;

/**
 * Agent 3: Holistic Comparator Agent
 * Performs a comprehensive comparison between resume and job description
 */
export class HolisticComparatorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof holisticComparisonSchema>
  >;

  constructor(apiKey?: string, modelName: string = "openai/gpt-oss-20b:free") {
    this.llm = new ChatOpenAI({
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Prepify Resume Analysis",
        },
      },

      model: modelName,
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      temperature: 0.4,
    });

    this.parser = StructuredOutputParser.fromZodSchema(
      holisticComparisonSchema
    );
  }

  /**
   * Perform holistic comparison between resume and job description
   */
  async compareHolistically(
    resume: string,
    jobDescription: string
  ): Promise<HolisticComparison> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are a senior recruiter and talent acquisition expert with years of experience.
Your task is to perform a comprehensive, holistic analysis of a candidate's resume against a job description.

Go beyond keyword matching and consider:
1. **Experience Match**: Does the candidate have the right level and type of experience?
2. **Qualification Match**: Do they have the necessary education, certifications, and credentials?
3. **Cultural Fit**: Based on the writing style and content, would they fit the company culture?
4. **Career Trajectory**: Is this role a logical next step in their career?

Provide a nuanced analysis that a human recruiter would give.

Resume:
{resume}

Job Description:
{jobDescription}

Provide detailed insights, be specific about strengths and areas for improvement.

{format_instructions}`,
      inputVariables: ["resume", "jobDescription"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      resume,
      jobDescription,
    });

    const response = await this.llm.invoke(input);
    const parsed = await this.parser.parse(response.content as string);

    return parsed;
  }
}
