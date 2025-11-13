"use client";

import * as React from "react";
import {
  Building2,
  ExternalLink,
  Sparkle,
  ChevronRight,
  ChevronDown,
  Award,
  Calendar,
  Eye,
  Target,
  Brain,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Job } from "@/types/jobs";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionFeedback {
  question: string;
  userAnswer: string;
  areasOfImprovement: string[];
  suggestedAnswer: string;
  score: number;
}

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  company_icon_url: string;
  company_domain?: string;
  application_link: string;
}

interface Interview {
  id: string;
  job_id: string;
  overall_score: number;
  difficulty: "easy" | "intermediate" | "hard";
  type: "technical" | "behavioral" | "mixed";
  interview_duration: number;
  created_at: string;
  job_applications: JobApplication;
  questions_feedback: QuestionFeedback[];
  general_comments?: string;
}

interface JobsListViewProps {
  data: Job[];
  onStartInterview?: (job: Job) => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
  onViewInterviewDetails?: (interview: Interview) => void;
}

export function JobsListView({
  data,
  onStartInterview,
  searchFilter = "",
  onViewInterviewDetails,
}: JobsListViewProps) {
  const [localSearch, setLocalSearch] = React.useState(searchFilter);
  const [expandedJobs, setExpandedJobs] = React.useState<Set<string>>(
    new Set()
  );
  const [jobInterviews, setJobInterviews] = React.useState<
    Record<string, Interview[]>
  >({});

  React.useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  // Fetch all interviews on initial load
  React.useEffect(() => {
    const fetchAllInterviews = async () => {
      try {
        const response = await fetch("/api/interview/history");
        const result = await response.json();

        if (result.success && result.data?.interviews) {
          // Group interviews by job_id
          const groupedInterviews: Record<string, Interview[]> = {};
          result.data.interviews.forEach((interview: Interview) => {
            if (!groupedInterviews[interview.job_id]) {
              groupedInterviews[interview.job_id] = [];
            }
            groupedInterviews[interview.job_id].push(interview);
          });
          setJobInterviews(groupedInterviews);
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    };

    fetchAllInterviews();
  }, []);

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);

    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }

    setExpandedJobs(newExpanded);
  };

  const calculateAverageScore = (jobId: string): number | null => {
    const interviews = jobInterviews[jobId] || [];
    if (interviews.length === 0) return null;

    const sum = interviews.reduce(
      (acc, interview) => acc + interview.overall_score,
      0
    );
    return Math.round(sum / interviews.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technical":
        return <Brain className="w-4 h-4" />;
      case "behavioral":
        return <Users className="w-4 h-4" />;
      case "mixed":
        return <Target className="w-4 w-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const filteredJobs = React.useMemo(() => {
    if (!localSearch) return data;

    const searchLower = localSearch.toLowerCase();
    return data.filter(
      (job) =>
        job.companyName.toLowerCase().includes(searchLower) ||
        job.title.toLowerCase().includes(searchLower)
    );
  }, [data, localSearch]);

  return (
    <div className="w-full space-y-6">
      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isExpanded = expandedJobs.has(job.id);
            const interviews = jobInterviews[job.id] || [];
            const averageScore = calculateAverageScore(job.id);

            return (
              <Card
                key={job.id}
                className={`hover:shadow-lg  transition-all duration-200 border border-gray-200 hover:border-[#636AE8]/30 bg-white ${
                  isExpanded ? "pb-0 pt-3" : "py-3"
                }`}
              >
                <div className="px-4 ">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Section - Chevron & Company & Job Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => toggleJobExpansion(job.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-600" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {isExpanded
                                ? "Hide interview history"
                                : "View interview history"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage
                          src={job.companyIconUrl}
                          alt={job.companyName}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-[#636AE8] to-[#4B4FD6] text-white">
                          <Building2 className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {job.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Average Score & Actions */}
                    <div className="flex flex-1 gap-3 justify-end items-center">
                      {averageScore !== null && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Avg:</span>
                          <span
                            className={`text-lg font-bold ${getScoreColor(
                              averageScore
                            )}`}
                          >
                            {averageScore}
                          </span>
                        </div>
                      )}
                      <Button
                        size="default"
                        className="bg-gradient-to-r from-[#636AE8] to-[#4B4FD6] hover:from-[#4B4FD6] hover:to-[#3B3FC6] text-white shadow-md hover:shadow-lg transition-all"
                        onClick={() => {
                          if (onStartInterview) {
                            onStartInterview(job);
                          }
                        }}
                      >
                        <Sparkle className="mr-2 h-4 w-4" />
                        Start Interview
                      </Button>
                      <Button
                        size="default"
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50"
                        onClick={() =>
                          window.open(job.applicationLink, "_blank")
                        }
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Posting
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Interview History */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-xl">
                    {interviews.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Interview History ({interviews.length})
                        </h4>
                        {interviews.map((interview) => (
                          <Card
                            key={interview.id}
                            className="p-3 bg-white border border-gray-200 hover:border-[#636AE8]/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Interview Details */}
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-gray-400" />
                                  <span
                                    className={`text-base font-bold ${getScoreColor(
                                      interview.overall_score
                                    )}`}
                                  >
                                    {interview.overall_score}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                  {getTypeIcon(interview.type)}
                                  <span className="capitalize">
                                    {interview.type}
                                  </span>
                                </div>

                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                    interview.difficulty
                                  )}`}
                                >
                                  {interview.difficulty
                                    .charAt(0)
                                    .toUpperCase() +
                                    interview.difficulty.slice(1)}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      interview.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                  <span>
                                    {interview.questions_feedback.length}{" "}
                                    {interview.questions_feedback.length === 1
                                      ? "Question"
                                      : "Questions"}
                                  </span>
                                </div>
                              </div>

                              {/* View Details Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-50"
                                onClick={() => {
                                  if (onViewInterviewDetails) {
                                    onViewInterviewDetails(interview);
                                  }
                                }}
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Feedback
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          No interviews yet for this job
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border border-gray-200">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {localSearch
                ? "No matching jobs found"
                : "No job applications yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {localSearch
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start adding job applications to track your progress and prepare for interviews."}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredJobs.length}</span>{" "}
            {filteredJobs.length === 1 ? "application" : "applications"}
            {localSearch && data.length !== filteredJobs.length && (
              <span className="text-gray-500">
                {" "}
                (filtered from {data.length} total)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
