"use client";

import React, { useState, useEffect } from "react";
import InterviewHeader from "@/components/interview-header";
import Questions from "@/components/questions";
import { JobsDataTable } from "@/components/jobs-data-table";
import { Video } from "lucide-react";
import { Job } from "@/types/jobs";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleStartInterview = (job: Job) => {
    setSelectedJob(job);
    setIsInterviewActive(true);
  };

  return (
    <div className="h-screen flex flex-1 flex-col overflow-hidden">
      <div className="mt-6 px-1 max-w-[95%]">
        <InterviewHeader
          onStartInterview={() => setIsInterviewActive(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
      <div className="flex-1 overflow-auto">
        {isInterviewActive ? (
          <div className="h-full flex flex-col p-6 space-y-4">
            {selectedJob && (
              <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Interview for: {selectedJob.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedJob.companyName}
                </p>
              </div>
            )}
            <div className="flex-1 flex items-center justify-center">
              <Questions />
            </div>
          </div>
        ) : (
          <div className="pl-1 pr-6 py-4 w-full">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            ) : jobs.length > 0 ? (
              <JobsDataTable
                data={jobs}
                onStartInterview={handleStartInterview}
                searchFilter={searchQuery}
              />
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
