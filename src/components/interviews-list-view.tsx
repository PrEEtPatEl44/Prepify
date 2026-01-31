"use client";

import * as React from "react";
import {
  Building2,
  Calendar,
  Award,
  Eye,
  Target,
  Brain,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  company_icon_url: string;
  company_domain?: string;
  application_link: string;
}

interface QuestionFeedback {
  question: string;
  userAnswer: string;
  areasOfImprovement: string[];
  suggestedAnswer: string;
  score: number;
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

interface InterviewsListViewProps {
  data: Interview[];
  onViewDetails?: (interview: Interview) => void;
  searchFilter?: string;
  onSearchChange?: (value: string) => void;
}

export function InterviewsListView({
  data,
  onViewDetails,
  searchFilter = "",
}: InterviewsListViewProps) {
  const [localSearch, setLocalSearch] = React.useState(searchFilter);

  React.useEffect(() => {
    setLocalSearch(searchFilter);
  }, [searchFilter]);

  const filteredInterviews = React.useMemo(() => {
    if (!localSearch) return data;

    const searchLower = localSearch.toLowerCase();
    return data.filter(
      (interview) =>
        interview.job_applications.company_name
          .toLowerCase()
          .includes(searchLower) ||
        interview.job_applications.job_title.toLowerCase().includes(searchLower)
    );
  }, [data, localSearch]);

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
        return <Target className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search Bar */}
      {/* <div className="relative mb-6">
        <Input
          placeholder="Search interviews by company or job title..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 h-12 text-base border-gray-200 focus:border-[#636AE8] focus:ring-[#636AE8]"
        />
      </div> */}

      {/* Interviews List */}
      <div className="space-y-4 flex-1 overflow-auto pb-4">
        {filteredInterviews.length > 0 ? (
          filteredInterviews.map((interview) => (
            <Card
              key={interview.id}
              className="p-4 hover:shadow-lg transition-all duration-200 border border-border hover:border-primary/30 bg-card"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Section - Company & Job Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10 rounded-lg">
                    <AvatarImage
                      src={interview.job_applications.company_icon_url}
                      alt={interview.job_applications.company_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white">
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground truncate">
                      {interview.job_applications.job_title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {interview.job_applications.company_name}
                    </p>
                  </div>
                </div>

                {/* Middle Section - Interview Details */}
                <div className="flex items-center gap-4">
                  {/* Score */}
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-muted-foreground/70" />
                    <span
                      className={`text-lg font-bold ${getScoreColor(
                        interview.overall_score
                      )}`}
                    >
                      {interview.overall_score}
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-medium">
                    {getTypeIcon(interview.type)}
                    <span className="capitalize">{interview.type}</span>
                  </div>

                  {/* Difficulty Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      interview.difficulty
                    )}`}
                  >
                    {interview.difficulty.charAt(0).toUpperCase() +
                      interview.difficulty.slice(1)}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(interview.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="default"
                    variant="outline"
                    className="border-border hover:bg-muted/50"
                    onClick={() => {
                      if (onViewDetails) {
                        onViewDetails(interview);
                      }
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Feedback
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-lg border border-border">
            <div className="bg-muted rounded-full p-6 mb-4">
              <Award className="w-16 h-16 text-muted-foreground/70" />
            </div>
            <h3 className="text-xl font-semibold text-foreground/80 mb-2">
              {localSearch
                ? "No matching interviews found"
                : "No interviews yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {localSearch
                ? "Try adjusting your search terms to find what you're looking for."
                : "Complete your first mock interview to see your history here."}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {filteredInterviews.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-border sticky bottom-0">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold">{filteredInterviews.length}</span>{" "}
            {filteredInterviews.length === 1 ? "interview" : "interviews"}
            {localSearch && data.length !== filteredInterviews.length && (
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
