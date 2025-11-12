"use client";

import { Button } from "./ui/button";

interface QuestionFeedback {
  question: string;
  userAnswer: string;
  areasOfImprovement: string[];
  suggestedAnswer: string;
  score: number;
}

interface InterviewFeedback {
  overallScore: number;
  questionsFeedback: QuestionFeedback[];
  generalComments: string;
}

interface InterviewFeedbackProps {
  feedback: InterviewFeedback | null;
  isGenerating: boolean;
  error: string | null;
  onBack: () => void;
}

export default function InterviewFeedback({
  feedback,
  isGenerating,
  error,
  onBack,
}: InterviewFeedbackProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md gap-6 min-w-4xl flex flex-col max-h-[80vh] overflow-auto">
      <div className="flex items-center justify-between mb-2 sticky top-0 bg-white z-10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#171a1f]">
            Interview Feedback
          </h2>
          {feedback && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg text-gray-600">Overall Score:</span>
              <span
                className={`text-2xl font-bold ${
                  feedback.overallScore >= 80
                    ? "text-green-600"
                    : feedback.overallScore >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {feedback.overallScore}/100
              </span>
            </div>
          )}
        </div>
        <Button
          onClick={onBack}
          className="bg-[#636ae8] text-white hover:bg-[#5058c9] px-6 py-2 rounded-md"
        >
          Back
        </Button>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-16 h-16 border-4 border-[#636ae8] border-t-transparent rounded-full animate-spin" />
          <h3 className="text-xl font-semibold text-gray-800">
            Generating Your Feedback...
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            Our AI is analyzing your responses and preparing detailed feedback
            to help you improve
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            Failed to Generate Feedback
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : feedback ? (
        <div className="space-y-6">
          {/* General Comments */}
          {feedback.generalComments && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                General Comments
              </h3>
              <p className="text-blue-800 leading-relaxed">
                {feedback.generalComments}
              </p>
            </div>
          )}

          {/* Question-by-Question Feedback */}
          <div className="space-y-6">
            {feedback.questionsFeedback.map((qf, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-5 bg-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    Question {index + 1}
                  </h3>
                  <span
                    className={`text-lg font-bold px-3 py-1 rounded-full ${
                      qf.score >= 80
                        ? "bg-green-100 text-green-700"
                        : qf.score >= 60
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {qf.score}/100
                  </span>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <p className="text-[#636ae8] font-medium text-base">
                    {qf.question}
                  </p>
                </div>

                {/* User's Answer */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Your Answer:
                  </h4>
                  <div className="bg-white border border-gray-200 rounded p-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {qf.userAnswer || "No answer provided"}
                    </p>
                  </div>
                </div>

                {/* Areas of Improvement */}
                {qf.areasOfImprovement.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Areas of Improvement:
                    </h4>
                    <ul className="space-y-2">
                      {qf.areasOfImprovement.map((area, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-[#636ae8] mt-1">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Answer */}
                {qf.suggestedAnswer && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Suggested Answer:
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {qf.suggestedAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
