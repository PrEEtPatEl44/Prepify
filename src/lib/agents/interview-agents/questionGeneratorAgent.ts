import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { JobAnalysisResult } from "./jobAnalysisAgent";

// Define the output schema for a single question
const interviewQuestionSchema = z.object({
  question: z.string().describe("The interview question"),
  topic: z.string().describe("Main topic or skill area the question addresses"),
});

// Define the output schema for 5 simple interview questions
const interviewQuestionsSchema = z.object({
  questions: z
    .array(interviewQuestionSchema)
    .length(5)
    .describe("Exactly 5 simple interview questions"),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type InterviewQuestionsSet = z.infer<typeof interviewQuestionsSchema>;

/**
 * Interview Questions Generator Agent
 * Generates comprehensive interview questions based on job analysis
 */
export class QuestionGeneratorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof interviewQuestionsSchema>
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
        temperature: 0.7,
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
            "X-Title": "Prepify Interview Questions",
          },
        },
        model:
          modelName ||
          process.env.OPENROUTER_MODEL_NAME ||
          "openai/gpt-4o-mini",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: 0.7,
        maxRetries: 2,
      });
    } else {
      throw new Error(
        "No API key found. Please provide either OPENAI_API_KEY or OPENROUTER_API_KEY environment variable."
      );
    }

    this.parser = StructuredOutputParser.fromZodSchema(
      interviewQuestionsSchema
    );
  }

  /**
   * Generate 5 simple interview questions based on job analysis
   */
  async generateQuestions(
    analysis: JobAnalysisResult
  ): Promise<InterviewQuestionsSet> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `Generate exactly 5 simple interview questions for this role.

**Job:** {jobTitle}
**Key Skills:** {keySkills}
**Focus Areas:** {focusAreas}

Create 5 straightforward questions that cover the key skills and focus areas. Keep questions clear and concise.

{format_instructions}`,
      inputVariables: ["jobTitle", "keySkills", "focusAreas"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      jobTitle: analysis.job_title,
      keySkills: analysis.key_skills.join(", "),
      focusAreas: analysis.focus_areas.join(", "),
    });

    const response = await this.llm.invoke(input);
    const parsed = await this.parser.parse(response.content as string);

    return parsed;
  }
}
