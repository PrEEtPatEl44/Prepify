import { JobAnalysisAgent, JobAnalysisResult } from "./jobAnalysisAgent";
import {
  QuestionGeneratorAgent,
  InterviewQuestionsSet,
  InterviewQuestion,
} from "./questionGeneratorAgent";

/**
 * Complete interview preparation result
 */
export interface InterviewPreparationResult {
  analysis: JobAnalysisResult;
  questions: InterviewQuestionsSet;
  summary: string;
  metadata: {
    generated_at: string;
    total_questions: number;
    recommended_duration: string;
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
   * Prepare a complete interview package with analysis and questions
   */
  async prepareInterview(
    resumeText: string,
    jobDescription: string,
    questionCount?: {
      technical?: number;
      behavioral?: number;
      situational?: number;
      problemSolving?: number;
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

    // Step 3: Generate interview questions based on analysis
    console.log("Step 3: Generating interview questions...");
    const questions = await this.questionGeneratorAgent.generateQuestions(
      analysis,
      jobDescription,
      resumeText,
      questionCount
    );

    // Calculate total questions and recommended duration
    const totalQuestions =
      questions.technical_questions.length +
      questions.behavioral_questions.length +
      questions.situational_questions.length +
      questions.problem_solving_questions.length +
      questions.role_specific_questions.length;

    // Estimate 5-8 minutes per question
    const estimatedMinutes = totalQuestions * 6.5;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = Math.round(estimatedMinutes % 60);
    const recommendedDuration =
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    console.log("Interview preparation complete!");

    return {
      analysis,
      questions,
      summary,
      metadata: {
        generated_at: new Date().toISOString(),
        total_questions: totalQuestions,
        recommended_duration: recommendedDuration,
      },
    };
  }

  /**
   * Prepare a focused interview for specific skill gaps
   */
  async prepareFocusedInterview(
    resumeText: string,
    jobDescription: string,
    focusAreas: string[]
  ): Promise<{
    analysis: JobAnalysisResult;
    focused_questions: Array<{
      topic: string;
      questions: InterviewQuestion[];
    }>;
  }> {
    // Analyze the job and candidate
    const analysis = await this.jobAnalysisAgent.analyzeForInterview(
      resumeText,
      jobDescription
    );

    // Generate questions for each focus area
    const focused_questions = await Promise.all(
      focusAreas.map(async (topic) => ({
        topic,
        questions:
          await this.questionGeneratorAgent.generateTopicSpecificQuestions(
            topic,
            analysis.interview_recommendations.difficulty_level,
            3
          ),
      }))
    );

    return {
      analysis,
      focused_questions,
    };
  }

  /**
   * Generate additional questions for identified gaps
   */
  async generateGapQuestions(
    analysis: JobAnalysisResult
  ): Promise<Array<{ gap: string; questions: InterviewQuestion[] }>> {
    const allGaps = [
      ...analysis.skill_gaps.technical_gaps,
      ...analysis.skill_gaps.experience_gaps,
      ...analysis.skill_gaps.soft_skill_gaps,
    ];

    const gapQuestions = await Promise.all(
      allGaps.slice(0, 5).map(async (gap) => ({
        gap,
        questions:
          await this.questionGeneratorAgent.generateTopicSpecificQuestions(
            gap,
            analysis.interview_recommendations.difficulty_level,
            2
          ),
      }))
    );

    return gapQuestions;
  }

  /**
   * Quick interview prep with fewer questions
   */
  async prepareQuickInterview(
    resumeText: string,
    jobDescription: string
  ): Promise<InterviewPreparationResult> {
    return this.prepareInterview(resumeText, jobDescription, {
      technical: 3,
      behavioral: 2,
      situational: 2,
      problemSolving: 2,
    });
  }

  /**
   * Comprehensive interview prep with more questions
   */
  async prepareComprehensiveInterview(
    resumeText: string,
    jobDescription: string
  ): Promise<InterviewPreparationResult> {
    return this.prepareInterview(resumeText, jobDescription, {
      technical: 8,
      behavioral: 6,
      situational: 5,
      problemSolving: 5,
    });
  }
}
