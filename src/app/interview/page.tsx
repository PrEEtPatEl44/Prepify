"use client";

import React, { useState, useEffect } from "react";
import InterviewHeader from "@/components/interview-header";
import Questions from "@/components/questions";
import { JobsListView } from "@/components/jobs-list-view";
import { InterviewsListView } from "@/components/interviews-list-view";
import InterviewFeedback from "@/components/interview-feedback";
import { Video, Loader2, Award } from "lucide-react";
import { Job } from "@/types/jobs";
import { Skeleton } from "@/components/ui/skeleton";
import InterviewSettingsModal, {
  InterviewSettings,
} from "@/components/modals/InterviewSettingsModal";

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

interface InterviewQuestion {
  id: number;
  text: string;
  type: string;
  difficulty: string;
  topic: string;
  purpose: string;
  followUpQuestions: string[];
  idealAnswerPoints: string[];
  redFlags: string[];
}

const Page = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<
    InterviewQuestion[]
  >([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [interviewDuration, setInterviewDuration] = useState("00:00");
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(
    null
  );
  const [showingReview, setShowingReview] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [interviewSettings, setInterviewSettings] = useState<{
    difficulty: "easy" | "intermediate" | "hard";
    type: "technical" | "behavioral" | "mixed";
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"jobs" | "interviews">("jobs");
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [viewingInterview, setViewingInterview] = useState<Interview | null>(
    null
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/applications");
        const data = await response.json();

        if (data.success && data.data?.jobs) {
          setJobs(data.data.jobs);
        } else {
          setError(data.message || "Failed to fetch jobs");
        }
      } catch (err) {
        setError("An error occurred while fetching jobs");
        console.error("Error fetching jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (activeTab !== "interviews") return;

      try {
        setIsLoadingInterviews(true);
        const response = await fetch("/api/interview/history");
        const data = await response.json();

        if (data.success && data.data?.interviews) {
          setInterviews(data.data.interviews);
        } else {
          console.error(data.message || "Failed to fetch interviews");
        }
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setIsLoadingInterviews(false);
      }
    };

    fetchInterviews();
  }, [activeTab]);

  // Timer effect for interview duration
  useEffect(() => {
    // Stop timer when showing review or when interview is not active
    if (!isInterviewActive || interviewStartTime === null || showingReview) {
      return;
    }

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - interviewStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setInterviewDuration(
        `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isInterviewActive, interviewStartTime, showingReview]);

  const handleOpenSettings = (job: Job) => {
    setSelectedJob(job);
    setIsSettingsModalOpen(true);
  };

  const handleStartInterview = async (settings: InterviewSettings) => {
    if (!selectedJob) return;

    console.log("Starting interview with settings:", {
      jobId: selectedJob.id,
      companyName: selectedJob.companyName,
      jobTitle: selectedJob.title,
      difficulty: settings.difficulty,
      type: settings.type,
      questionCount: settings.questionCount,
    });

    setQuestionError(null);
    setIsGeneratingQuestions(true);

    try {
      // Generate interview questions with user settings
      const response = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          difficulty: settings.difficulty,
          type: settings.type,
          questionCount: settings.questionCount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to generate interview questions"
        );
      }

      setInterviewQuestions(data.data.questions);
      setInterviewSettings({
        difficulty: settings.difficulty,
        type: settings.type,
      });
      setIsInterviewActive(true);
      setInterviewStartTime(Date.now());
      setInterviewDuration("00:00");
      setShowingReview(false);
    } catch (err) {
      setQuestionError(
        err instanceof Error ? err.message : "Failed to generate questions"
      );
      console.error("Error generating interview questions:", err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <>
      <InterviewSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onStart={handleStartInterview}
        companyName={selectedJob?.companyName}
        jobTitle={selectedJob?.title}
      />
      <div className="h-screen flex flex-1 flex-col overflow-hidden">
        <div className="mt-6 px-1 max-w-[95%]">
          <InterviewHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isInterviewActive={isInterviewActive || !!viewingInterview}
            interviewDuration={interviewDuration}
            showingReview={showingReview || !!viewingInterview}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        <div className="overflow-auto ">
          {isGeneratingQuestions ? (
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2 className="w-16 h-16 text-[#636AE8] animate-spin" />
              <h3 className="text-xl font-semibold text-gray-800">
                Generating Interview Questions...
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                Analyzing job description and resume to create personalized
                interview questions
              </p>
            </div>
          ) : questionError ? (
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Failed to Generate Questions
                </h3>
                <p className="text-red-600">{questionError}</p>
              </div>
            </div>
          ) : viewingInterview ? (
            <div className="mt-6 w-full px-6 justify-center flex-1 flex">
              <InterviewFeedback
                feedback={{
                  overallScore: viewingInterview.overall_score,
                  questionsFeedback: viewingInterview.questions_feedback,
                  generalComments: viewingInterview.general_comments || "",
                }}
                onBack={() => setViewingInterview(null)}
                viewMode="history"
              />
            </div>
          ) : isInterviewActive ? (
            <div className="mt-24 w-full px-6 justify-center flex-1 flex">
              <Questions
                questions={interviewQuestions}
                onBack={() => {
                  setIsInterviewActive(false);
                  setShowingReview(false);
                }}
                onShowResults={(show) => {
                  setShowingReview(show);
                }}
                jobId={selectedJob?.id}
                interviewStartTime={interviewStartTime}
                difficulty={interviewSettings?.difficulty}
                type={interviewSettings?.type}
              />
            </div>
          ) : (
            <div className="py-4 w-full">
              {activeTab === "jobs" ? (
                // Jobs Tab
                isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="flex size-full flex-1 justify-center items-center pl-1 pr-6 mt-4">
                    <JobsListView
                      data={jobs}
                      onStartInterview={handleOpenSettings}
                      searchFilter={searchQuery}
                      onSearchChange={setSearchQuery}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border">
                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                      <Video className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Job Applications Yet
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                      Start adding job applications to track your progress and
                      prepare for interviews.
                    </p>
                  </div>
                )
              ) : // Interviews Tab
              isLoadingInterviews ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : interviews.length > 0 ? (
                <div className="flex size-full flex-1 justify-center items-center pl-1 pr-6 mt-4">
                  <InterviewsListView
                    data={interviews}
                    searchFilter={searchQuery}
                    onSearchChange={setSearchQuery}
                    onViewDetails={(interview) => {
                      setViewingInterview(interview);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg border">
                  <div className="bg-gray-100 rounded-full p-6 mb-4">
                    <Award className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Interviews Yet
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Complete your first mock interview to see your history and
                    feedback here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
