import { JobAnalysisAgent, JobAnalysisResult } from "./jobAnalysisAgent";
import {
  QuestionGeneratorAgent,
  InterviewQuestionsSet,
} from "./questionGeneratorAgent";

/**
 * Interview settings from user configuration
 */
export interface InterviewSettings {
  difficulty: "easy" | "intermediate" | "hard";
  type: "technical" | "behavioral" | "mixed";
  questionCount: number;
}

/**
 * Simple interview preparation result
 */
export interface InterviewPreparationResult {
  analysis: JobAnalysisResult;
  questions: InterviewQuestionsSet;
  summary: string;
  metadata: {
    generated_at: string;
    total_questions: number;
    difficulty: string;
    type: string;
  };
}

/**
 * Interview Preparation Orchestrator
 * Coordinates job analysis and question generation for complete interview prep
 */
export class InterviewOrchestrator {
  private jobAnalysisAgent: JobAnalysisAgent;
  private questionGeneratorAgent: QuestionGeneratorAgent;

  constructor(apiKey?: string, modelName?: string) {
    this.jobAnalysisAgent = new JobAnalysisAgent(apiKey, modelName);
    this.questionGeneratorAgent = new QuestionGeneratorAgent(apiKey, modelName);
  }

  /**
   * Prepare an interview package with analysis and customized questions
   */
  async prepareInterview(
    resumeText: string,
    jobDescription: string,
    settings: InterviewSettings = {
      difficulty: "intermediate",
      type: "mixed",
      questionCount: 5,
    }
  ): Promise<InterviewPreparationResult> {
    // Step 1: Analyze the job and candidate
    console.log("Step 1: Analyzing job and candidate profile...");
    const analysis = await this.jobAnalysisAgent.analyzeForInterview(
      resumeText,
      jobDescription
    );

    // Step 2: Generate analysis summary
    console.log("Step 2: Generating analysis summary...");
    const summary = await this.jobAnalysisAgent.generateAnalysisSummary(
      analysis
    );

    // Step 3: Generate interview questions with user settings
    console.log(
      `Step 3: Generating ${settings.questionCount} ${settings.difficulty} ${settings.type} interview questions...`
    );
    const questions = await this.questionGeneratorAgent.generateQuestions(
      analysis,
      settings
    );

    console.log("Interview preparation complete!");

    return {
      analysis,
      questions,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        total_questions: settings.questionCount,
        difficulty: settings.difficulty,
        type: settings.type,
      },
    };
  }
}
