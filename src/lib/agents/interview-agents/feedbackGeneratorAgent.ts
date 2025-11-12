import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

// Define the output schema for individual question feedback
const questionFeedbackSchema = z.object({
  question: z.string().describe("The interview question"),
  userAnswer: z.string().describe("The user's answer to the question"),
  areasOfImprovement: z
    .array(z.string())
    .describe(
      "Specific areas where the answer can be improved (3-5 bullet points)"
    ),
  suggestedAnswer: z
    .string()
    .describe(
      "A well-structured suggested answer that demonstrates best practices"
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Score for this individual answer out of 100"),
});

// Define the output schema for overall interview feedback
const interviewFeedbackSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall interview score out of 100"),
  questionsFeedback: z
    .array(questionFeedbackSchema)
    .describe("Detailed feedback for each question"),
  generalComments: z
    .string()
    .describe(
      "Overall comments about the interview performance, strengths, and general improvement areas"
    ),
});

export type QuestionFeedback = z.infer<typeof questionFeedbackSchema>;
export type InterviewFeedback = z.infer<typeof interviewFeedbackSchema>;

interface InterviewData {
  questionId: number;
  question: string;
  answer: string;
}

/**
 * Feedback Generator Agent
 * Analyzes interview responses and generates detailed feedback
 */
export class FeedbackGeneratorAgent {
  private llm: ChatOpenAI;
  private parser: ReturnType<
    typeof StructuredOutputParser.fromZodSchema<typeof interviewFeedbackSchema>
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
            "X-Title": "Prepify Interview Feedback",
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

    this.parser = StructuredOutputParser.fromZodSchema(interviewFeedbackSchema);
  }

  /**
   * Generate detailed feedback for interview responses
   */
  async generateFeedback(
    interviewData: InterviewData[]
  ): Promise<InterviewFeedback> {
    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = PromptTemplate.fromTemplate(`
You are an expert interview coach and evaluator with years of experience in technical recruiting and career development.

You are analyzing a candidate's interview responses. Your task is to provide constructive, actionable feedback that will help them improve their interview skills.

For each question and answer pair:
1. Evaluate the quality, clarity, structure, and relevance of the answer
2. Identify 3-5 specific areas where the answer could be improved
3. Provide a well-structured suggested answer that demonstrates best practices
4. Assign a score out of 100 based on:
   - Content quality and relevance (40%)
   - Structure and clarity (30%)
   - Depth and detail (20%)
   - Professional communication (10%)

For the overall interview:
1. Calculate an average score based on individual question scores
2. Provide general comments about strengths and areas for improvement
3. Be constructive, encouraging, and specific in your feedback

Interview Questions and Answers:
{interviewData}

{format_instructions}

Remember to be specific, actionable, and encouraging in your feedback. Focus on helping the candidate improve their interview skills.
`);

    const formattedPrompt = await prompt.format({
      interviewData: JSON.stringify(interviewData, null, 2),
      format_instructions: formatInstructions,
    });

    try {
      const response = await this.llm.invoke(formattedPrompt);
      const parsed = await this.parser.parse(response.content as string);

      return parsed;
    } catch (error) {
      console.error("Error generating interview feedback:", error);
      throw new Error(
        "Failed to generate interview feedback. Please try again."
      );
    }
  }
}
