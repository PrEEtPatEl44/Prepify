import { KeywordExtractorAgent, ExtractedKeywords } from "./keywordExtractor";
import { KeywordComparatorAgent, KeywordComparison } from "./keywordComparator";
import {
  HolisticComparatorAgent,
  HolisticComparison,
} from "./holisticComparator";

// Final output schema
export interface ResumeAnalysisResult {
  total_score: number;
  score_breakdown: {
    keyword_match_score: number;
    holistic_score: number;
  };
  description: string;
  strengths: string[];
  areas_for_improvement: string[];
  detailed_analysis: {
    keyword_analysis: {
      matching_keywords: ExtractedKeywords;
      missing_keywords: ExtractedKeywords;
      insights: string;
    };
    experience_match: {
      score: number;
      analysis: string;
    };
    qualification_match: {
      score: number;
      analysis: string;
    };
    cultural_fit: {
      score: number;
      analysis: string;
    };
    career_trajectory: {
      score: number;
      analysis: string;
    };
  };
  recommendations: string[];
}

/**
 * Orchestrator that coordinates all three agents
 */
export class ResumeAnalysisOrchestrator {
  private keywordExtractor: KeywordExtractorAgent;
  private keywordComparator: KeywordComparatorAgent;
  private holisticComparator: HolisticComparatorAgent;

  constructor(apiKey?: string) {
    this.keywordExtractor = new KeywordExtractorAgent(apiKey);
    this.keywordComparator = new KeywordComparatorAgent(apiKey);
    this.holisticComparator = new HolisticComparatorAgent(apiKey);
  }

  /**
   * Perform complete resume analysis
   */
  async analyzeResume(
    resume: string,
    jobDescription: string
  ): Promise<ResumeAnalysisResult> {
    console.log("🚀 Starting resume analysis...");

    // Step 1: Extract keywords from both documents
    console.log("📝 Step 1: Extracting keywords...");
    const { resumeKeywords, jobKeywords } =
      await this.keywordExtractor.extractFromBoth(resume, jobDescription);

    // Step 2: Compare keywords
    console.log("🔍 Step 2: Comparing keywords...");
    const keywordComparison = await this.keywordComparator.compareKeywords(
      resumeKeywords,
      jobKeywords
    );

    // Step 3: Perform holistic comparison
    console.log("🎯 Step 3: Performing holistic analysis...");
    const holisticComparison =
      await this.holisticComparator.compareHolistically(resume, jobDescription);

    // Step 4: Combine results and calculate total score
    console.log("📊 Step 4: Combining results...");
    const totalScore = this.calculateTotalScore(
      keywordComparison.keyword_match_score,
      holisticComparison.holistic_score
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      keywordComparison,
      holisticComparison
    );

    const result: ResumeAnalysisResult = {
      total_score: totalScore,
      score_breakdown: {
        keyword_match_score: keywordComparison.keyword_match_score,
        holistic_score: holisticComparison.holistic_score,
      },
      description: this.generateDescription(
        totalScore,
        keywordComparison,
        holisticComparison
      ),
      strengths: holisticComparison.strengths,
      areas_for_improvement: holisticComparison.areas_for_improvement,
      detailed_analysis: {
        keyword_analysis: {
          matching_keywords: keywordComparison.matching_keywords,
          missing_keywords: keywordComparison.missing_keywords,
          insights: keywordComparison.keyword_insights,
        },
        experience_match: holisticComparison.experience_match,
        qualification_match: holisticComparison.qualification_match,
        cultural_fit: holisticComparison.cultural_fit,
        career_trajectory: holisticComparison.career_trajectory,
      },
      recommendations,
    };

    console.log("✅ Analysis complete!");
    return result;
  }

  /**
   * Calculate weighted total score
   * Keyword matching: 40%
   * Holistic analysis: 60%
   */
  private calculateTotalScore(
    keywordScore: number,
    holisticScore: number
  ): number {
    const weightedScore = keywordScore * 0.4 + holisticScore * 0.6;
    return Math.round(weightedScore);
  }

  /**
   * Generate overall description based on score
   */
  private generateDescription(
    totalScore: number,
    keywordComparison: KeywordComparison,
    holisticComparison: HolisticComparison
  ): string {
    let rating = "";
    if (totalScore >= 90) rating = "Excellent Match";
    else if (totalScore >= 75) rating = "Strong Match";
    else if (totalScore >= 60) rating = "Good Match";
    else if (totalScore >= 45) rating = "Moderate Match";
    else rating = "Weak Match";

    return `${rating} (${totalScore}/100): ${holisticComparison.overall_assessment}`;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    keywordComparison: KeywordComparison,
    holisticComparison: HolisticComparison
  ): string[] {
    const recommendations: string[] = [];

    // Keyword-based recommendations
    const missingTechSkills =
      keywordComparison.missing_keywords.technical_skills;
    if (missingTechSkills.length > 0) {
      recommendations.push(
        `Add missing technical skills to your resume: ${missingTechSkills
          .slice(0, 5)
          .join(", ")}`
      );
    }

    const missingCertifications =
      keywordComparison.missing_keywords.certifications;
    if (missingCertifications.length > 0) {
      recommendations.push(
        `Consider obtaining these certifications: ${missingCertifications.join(
          ", "
        )}`
      );
    }

    // Holistic recommendations
    if (holisticComparison.experience_match.score < 70) {
      recommendations.push(
        "Emphasize relevant experience more prominently in your resume"
      );
    }

    if (holisticComparison.qualification_match.score < 70) {
      recommendations.push(
        "Highlight your educational background and relevant qualifications more clearly"
      );
    }

    // Add general recommendation
    recommendations.push(
      "Tailor your resume to include more keywords and phrases from the job description"
    );

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }
}
