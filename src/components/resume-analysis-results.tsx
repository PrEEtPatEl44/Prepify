"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResumeScoreCard from "@/components/resume-score-card";
import ResumeIssueCard from "@/components/resume-issue-card";

interface AnalysisResult {
  total_score: number;
  score_breakdown: {
    keyword_match_score: number;
    holistic_score: number;
  };
  description: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  detailed_analysis: {
    keyword_analysis: {
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
}

interface ResumeAnalysisResultsProps {
  result: AnalysisResult;
  showFullJson?: boolean;
}

export default function ResumeAnalysisResults({
  result,
  showFullJson = false,
}: ResumeAnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Resume Score Card */}
      <ResumeScoreCard score={result.total_score} />

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Keyword Match
              </p>
              <p className="text-2xl font-semibold">
                {result.score_breakdown.keyword_match_score}/100
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Holistic Analysis
              </p>
              <p className="text-2xl font-semibold">
                {result.score_breakdown.holistic_score}/100
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths - Using Green Issue Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Strengths</h2>
        <div className="space-y-3">
          {result.strengths.map((strength, index) => (
            <ResumeIssueCard key={index} title={strength} stripColor="green" />
          ))}
        </div>
      </div>

      {/* Areas for Improvement - Using Red Issue Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Areas for Improvement</h2>
        <div className="space-y-3">
          {result.areas_for_improvement.map((area, index) => (
            <ResumeIssueCard key={index} title={area} stripColor="red" />
          ))}
        </div>
      </div>

      {/* Recommendations - Using Red Issue Cards with Suggested Fixes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recommendations</h2>
        <div className="space-y-3">
          {result.recommendations.map((rec, index) => (
            <ResumeIssueCard
              key={index}
              title={`Recommendation ${index + 1}`}
              subtitle={rec}
              stripColor="red"
              showSuggestedFix={true}
              suggestedFix={rec}
            />
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      <h2 className="text-2xl font-bold mb-4">Detailed Analysis</h2>
      {/* Keyword Analysis */}
      <ResumeIssueCard
        title="Keyword Analysis"
        subtitle={result.detailed_analysis.keyword_analysis.insights}
        stripColor="green"
        showSuggestedFix={false}
      />

      {/* Experience Match */}
      <ResumeIssueCard
        title={`Experience Match (${result.detailed_analysis.experience_match.score}/100)`}
        subtitle={result.detailed_analysis.experience_match.analysis}
        stripColor={
          result.detailed_analysis.experience_match.score >= 70
            ? "green"
            : "red"
        }
        showSuggestedFix={false}
      />

      {/* Qualification Match */}
      <ResumeIssueCard
        title={`Qualification Match (${result.detailed_analysis.qualification_match.score}/100)`}
        subtitle={result.detailed_analysis.qualification_match.analysis}
        stripColor={
          result.detailed_analysis.qualification_match.score >= 70
            ? "green"
            : "red"
        }
        showSuggestedFix={false}
      />

      {/* Cultural Fit */}
      <ResumeIssueCard
        title={`Cultural Fit (${result.detailed_analysis.cultural_fit.score}/100)`}
        subtitle={result.detailed_analysis.cultural_fit.analysis}
        stripColor={
          result.detailed_analysis.cultural_fit.score >= 70 ? "green" : "red"
        }
        showSuggestedFix={false}
      />

      {/* Career Trajectory */}
      <ResumeIssueCard
        title={`Career Trajectory (${result.detailed_analysis.career_trajectory.score}/100)`}
        subtitle={result.detailed_analysis.career_trajectory.analysis}
        stripColor={
          result.detailed_analysis.career_trajectory.score >= 70
            ? "green"
            : "red"
        }
        showSuggestedFix={false}
      />

      {/* Full JSON Response - Optional */}
      {showFullJson && (
        <Card>
          <CardHeader>
            <CardTitle>Full JSON Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto max-h-96 text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
