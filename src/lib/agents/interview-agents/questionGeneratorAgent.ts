import { ChatOpenAI } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { JobAnalysisResult } from "./jobAnalysisAgent";

// Define the output schema for a single question
const interviewQuestionSchema = z.object({
  question: z.string().describe("The interview question"),
  type: z
    .enum(["technical", "behavioral", "situational", "problem-solving"])
    .describe("Type of question"),
  difficulty: z
    .enum(["basic", "intermediate", "advanced", "expert"])
    .describe("Difficulty level"),
  topic: z.string().describe("Main topic or skill area the question addresses"),
  purpose: z
    .string()
    .describe(
      "What this question aims to assess or reveal about the candidate"
    ),
  follow_up_questions: z
    .array(z.string())
    .describe("Potential follow-up questions based on candidate's response"),
  ideal_answer_points: z
    .array(z.string())
    .describe("Key points that should be covered in a strong answer"),
  red_flags: z
    .array(z.string())
    .describe("Warning signs to watch for in the candidate's response"),
});

// Define the output schema for complete interview question set
const interviewQuestionsSchema = z.object({
  technical_questions: z
    .array(interviewQuestionSchema)
    .describe("Technical questions to assess hard skills"),
  behavioral_questions: z
    .array(interviewQuestionSchema)
    .describe(
      "Behavioral questions to assess soft skills and past experiences"
    ),
  situational_questions: z
    .array(interviewQuestionSchema)
    .describe("Situational questions to assess problem-solving and judgment"),
  problem_solving_questions: z
    .array(interviewQuestionSchema)
    .describe("Problem-solving questions to assess analytical thinking"),
  role_specific_questions: z
    .array(interviewQuestionSchema)
    .describe("Questions specific to the role and responsibilities"),
  closing_questions: z
    .array(z.string())
    .describe("Questions for the candidate to ask the interviewer"),
  interview_structure: z.object({
    warm_up: z
      .array(z.string())
      .describe("Opening questions to make candidate comfortable"),
    main_assessment: z
      .array(z.string())
      .describe("Core questions organized by priority"),
    depth_probes: z
      .array(z.string())
      .describe("Deep-dive questions for key areas"),
    wrap_up: z.array(z.string()).describe("Closing questions and next steps"),
  }),
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
   * Generate comprehensive interview questions based on job analysis
   */
  async generateQuestions(
    analysis: JobAnalysisResult,
    jobDescription: string,
    resumeText: string,
    questionCount: {
      technical?: number;
      behavioral?: number;
      situational?: number;
      problemSolving?: number;
    } = {}
  ): Promise<InterviewQuestionsSet> {
    const {
      technical = 5,
      behavioral = 4,
      situational = 3,
      problemSolving = 3,
    } = questionCount;

    const formatInstructions = this.parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `You are an expert interview coach and technical recruiter specializing in creating effective, insightful interview questions.

Based on the comprehensive job analysis provided, generate a complete set of interview questions that will help assess the candidate's fit for the role.

**Job Description:**
{jobDescription}

**Candidate's Resume:**
{resumeText}

**Job Analysis Results:**
- Position Level: {positionLevel}
- Key Responsibilities: {responsibilities}
- Candidate Strengths: {strengths}
- Technical Gaps: {technicalGaps}
- Experience Gaps: {experienceGaps}
- Focus Areas - Technical: {technicalTopics}
- Focus Areas - Behavioral: {behavioralTopics}
- Priority Areas: {priorityAreas}
- Recommended Difficulty: {difficulty}

**Question Requirements:**
- Generate {technicalCount} technical questions
- Generate {behavioralCount} behavioral questions
- Generate {situationalCount} situational questions
- Generate {problemSolvingCount} problem-solving questions
- Generate 3-5 role-specific questions

**Guidelines:**
1. Questions should be tailored to the specific role and candidate background
2. Focus on the priority areas and skill gaps identified in the analysis
3. Include a mix of difficulty levels appropriate for the position
4. Ensure questions are open-ended and encourage detailed responses
5. For behavioral questions, use the STAR method framework (Situation, Task, Action, Result)
6. Technical questions should be practical and relevant to the role
7. Include follow-up questions to probe deeper into responses
8. Provide evaluation criteria for each question

Create questions that will:
- Validate claimed skills and experiences
- Explore skill gaps and areas of concern
- Assess cultural fit and soft skills
- Challenge the candidate appropriately
- Reveal problem-solving approaches and thinking processes

{format_instructions}`,
      inputVariables: [
        "jobDescription",
        "resumeText",
        "positionLevel",
        "responsibilities",
        "strengths",
        "technicalGaps",
        "experienceGaps",
        "technicalTopics",
        "behavioralTopics",
        "priorityAreas",
        "difficulty",
        "technicalCount",
        "behavioralCount",
        "situationalCount",
        "problemSolvingCount",
      ],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      jobDescription,
      resumeText,
      positionLevel: analysis.role_overview.position_level,
      responsibilities: analysis.role_overview.key_responsibilities.join(", "),
      strengths: analysis.candidate_strengths.matching_skills.join(", "),
      technicalGaps: analysis.skill_gaps.technical_gaps.join(", "),
      experienceGaps: analysis.skill_gaps.experience_gaps.join(", "),
      technicalTopics: analysis.focus_areas.technical_topics.join(", "),
      behavioralTopics: analysis.focus_areas.behavioral_topics.join(", "),
      priorityAreas:
        analysis.interview_recommendations.priority_areas.join(", "),
      difficulty: analysis.interview_recommendations.difficulty_level,
      technicalCount: technical.toString(),
      behavioralCount: behavioral.toString(),
      situationalCount: situational.toString(),
      problemSolvingCount: problemSolving.toString(),
    });

    const response = await this.llm.invoke(input);
    const parsed = await this.parser.parse(response.content as string);

    return parsed;
  }

  /**
   * Generate additional questions for a specific topic or skill gap
   */
  async generateTopicSpecificQuestions(
    topic: string,
    difficulty: "basic" | "intermediate" | "advanced" | "expert",
    count: number = 3
  ): Promise<InterviewQuestion[]> {
    const questionSchema = z.array(interviewQuestionSchema);
    const parser = StructuredOutputParser.fromZodSchema(questionSchema);
    const formatInstructions = parser.getFormatInstructions();

    const prompt = new PromptTemplate({
      template: `Generate {count} interview questions focused on the following topic: {topic}

Difficulty Level: {difficulty}

Create questions that:
- Are appropriate for the difficulty level
- Explore different aspects of the topic
- Include follow-up questions
- Provide clear evaluation criteria

{format_instructions}`,
      inputVariables: ["topic", "difficulty", "count"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      topic,
      difficulty,
      count: count.toString(),
    });

    const response = await this.llm.invoke(input);
    const parsed = await parser.parse(response.content as string);

    return parsed;
  }

  /**
   * Generate custom questions based on free-form requirements
   */
  async generateCustomQuestions(
    requirements: string,
    context: {
      jobTitle?: string;
      industry?: string;
      candidateLevel?: string;
    }
  ): Promise<InterviewQuestion[]> {
    const questionSchema = z.array(interviewQuestionSchema);
    const parser = StructuredOutputParser.fromZodSchema(questionSchema);
    const formatInstructions = parser.getFormatInstructions();

    const contextStr = Object.entries(context)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const prompt = new PromptTemplate({
      template: `Generate interview questions based on the following requirements:

{requirements}

Context:
{context}

Create relevant, insightful questions that address the requirements while considering the context provided.

{format_instructions}`,
      inputVariables: ["requirements", "context"],
      partialVariables: { format_instructions: formatInstructions },
    });

    const input = await prompt.format({
      requirements,
      context: contextStr || "No additional context provided",
    });

    const response = await this.llm.invoke(input);
    const parsed = await parser.parse(response.content as string);

    return parsed;
  }
}
