import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { JobAnalysisResult } from "./jobAnalysisAgent";

// Interview settings interface
export interface InterviewSettings {
  difficulty: "easy" | "intermediate" | "hard";
  type: "technical" | "behavioral" | "mixed";
  questionCount: number;
}

// Define the output schema for a single question
const interviewQuestionSchema = z.object({
  question: z.string().describe("The interview question"),
  topic: z.string().describe("Main topic or skill area the question addresses"),
});

// Function to create dynamic schema based on question count
const createInterviewQuestionsSchema = (count: number) => {
  return z.object({
    questions: z
      .array(interviewQuestionSchema)
      .length(count)
      .describe(`Exactly ${count} interview questions`),
  });
};

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type InterviewQuestionsSet = {
  questions: InterviewQuestion[];
};

/**
 * Interview Questions Generator Agent
 * Generates comprehensive interview questions based on job analysis
 */
export class QuestionGeneratorAgent {
  private llm: ChatOpenAI;

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
  }

  /**
   * Generate interview questions based on job analysis and user settings
   */
  async generateQuestions(
    analysis: JobAnalysisResult,
    settings: InterviewSettings = {
      difficulty: "intermediate",
      type: "mixed",
      questionCount: 5,
    }
  ): Promise<InterviewQuestionsSet> {
    // Create parser with dynamic question count
    const schema = createInterviewQuestionsSchema(settings.questionCount);
    const parser = StructuredOutputParser.fromZodSchema(schema);
    const formatInstructions = parser.getFormatInstructions();

    // Build difficulty description
    const difficultyDescriptions = {
      easy: "Entry-level questions that are straightforward and fundamental. Suitable for junior candidates or warm-up questions.",
      intermediate:
        "Mid-level questions that require solid understanding and some experience. Suitable for candidates with 2-5 years of experience.",
      hard: "Advanced questions that require deep expertise and complex problem-solving. Suitable for senior candidates or technical leads.",
    };

    // Build type description
    const typeDescriptions = {
      technical:
        "Focus exclusively on technical skills, coding abilities, system design, and technical problem-solving.",
      behavioral:
        "Focus exclusively on soft skills, past experiences, teamwork, leadership, and situational responses.",
      mixed:
        "Include a balanced mix of both technical and behavioral questions to assess both hard and soft skills.",
    };

    const prompt = new PromptTemplate({
      template: `Generate exactly {questionCount} interview questions for this role.

**Job:** {jobTitle}
**Key Skills:** {keySkills}
**Focus Areas:** {focusAreas}

**Difficulty Level:** {difficulty}
{difficultyDescription}

**Question Type:** {type}
{typeDescription}

Create {questionCount} questions that:
1. Match the specified difficulty level ({difficulty})
2. Follow the question type guidance ({type})
3. Cover the key skills and focus areas
4. Are clear, concise, and professionally worded
5. Are appropriate for the role and seniority level

{format_instructions}`,
      inputVariables: [
        "jobTitle",
        "keySkills",
        "focusAreas",
        "questionCount",
        "difficulty",
        "difficultyDescription",
        "type",
        "typeDescription",
      ],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      jobTitle: analysis.job_title,
      keySkills: analysis.key_skills.join(", "),
      focusAreas: analysis.focus_areas.join(", "),
      questionCount: settings.questionCount.toString(),
      difficulty: settings.difficulty,
      difficultyDescription: difficultyDescriptions[settings.difficulty],
      type: settings.type,
      typeDescription: typeDescriptions[settings.type],
    });

    const response = await this.llm.invoke(input);
    const parsed = await parser.parse(response.content as string);

    return parsed;
  }
}
