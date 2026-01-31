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
  const [filterTab, setFilterTab] = React.useState<
    "all" | "with-interviews" | "without-interviews"
  >("all");

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
        return "bg-green-500/15 text-green-600 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-destructive/15 text-destructive";
      default:
        return "bg-muted text-foreground/80";
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
    let filtered = data;

    // Apply filter tab
    if (filterTab === "with-interviews") {
      filtered = filtered.filter((job) => {
        const interviews = jobInterviews[job.id] || [];
        return interviews.length > 0;
      });
    } else if (filterTab === "without-interviews") {
      filtered = filtered.filter((job) => {
        const interviews = jobInterviews[job.id] || [];
        return interviews.length === 0;
      });
    }

    // Apply search filter
    if (localSearch) {
      const searchLower = localSearch.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.companyName.toLowerCase().includes(searchLower) ||
          job.title.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [data, localSearch, filterTab, jobInterviews]);

  return (
    <div className="w-full space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filterTab === "all"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          All Jobs
        </button>
        <button
          onClick={() => setFilterTab("with-interviews")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filterTab === "with-interviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          With Interviews
        </button>
        <button
          onClick={() => setFilterTab("without-interviews")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            filterTab === "without-interviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Without Interviews
        </button>
      </div>

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
                className={`hover:shadow-lg  transition-all duration-200 border border-border hover:border-primary/30 bg-card ${
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
                              className="p-1 hover:bg-muted rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white">
                          <Building2 className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">
                          {job.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Average Score & Actions */}
                    <div className="flex flex-1 gap-3 justify-end items-center">
                      {averageScore !== null && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg">
                          <Award className="w-4 h-4 text-muted-foreground/70" />
                          <span className="text-sm text-muted-foreground">Avg:</span>
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
                        className="bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-hover text-white shadow-md hover:shadow-lg transition-all"
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
                        className="border-border hover:bg-muted/50"
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
                  <div className="border-t border-border bg-muted/50 p-4 rounded-xl">
                    {interviews.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground/80 mb-3">
                          Interview History ({interviews.length})
                        </h4>
                        {interviews.map((interview) => (
                          <Card
                            key={interview.id}
                            className="p-3 bg-card border border-border hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Interview Details */}
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-muted-foreground/70" />
                                  <span
                                    className={`text-base font-bold ${getScoreColor(
                                      interview.overall_score
                                    )}`}
                                  >
                                    {interview.overall_score}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium">
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

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-foreground/80 text-xs font-medium">
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
                                className="border-border hover:bg-muted/50"
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
                        <p className="text-sm text-muted-foreground">
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
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-lg border border-border">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Building2 className="w-16 h-16 text-muted-foreground/70" />
            </div>
            <h3 className="text-xl font-semibold text-foreground/80 mb-2">
              {localSearch
                ? "No matching jobs found"
                : "No job applications yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {localSearch
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start adding job applications to track your progress and prepare for interviews."}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredJobs.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold">{filteredJobs.length}</span>{" "}
            {filteredJobs.length === 1 ? "application" : "applications"}
            {localSearch && data.length !== filteredJobs.length && (
              <span className="text-muted-foreground">
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
