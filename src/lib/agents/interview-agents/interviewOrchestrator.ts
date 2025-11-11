import { JobAnalysisAgent, JobAnalysisResult } from "./jobAnalysisAgent";
import {
  QuestionGeneratorAgent,
  InterviewQuestionsSet,
} from "./questionGeneratorAgent";

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
   * Prepare a simple interview package with analysis and 5 questions
   */
  async prepareInterview(
    resumeText: string,
    jobDescription: string
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

    // Step 3: Generate 5 simple interview questions
    console.log("Step 3: Generating 5 interview questions...");
    const questions = await this.questionGeneratorAgent.generateQuestions(
      analysis
    );

    console.log("Interview preparation complete!");

    return {
      analysis,
      questions,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        total_questions: 5,
      },
    };
  }
}
