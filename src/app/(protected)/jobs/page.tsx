"use client";
import React from "react";
import Header, { type ViewMode } from "@/components/header";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { X, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type DocumentBasicInfo } from "@/types/docs";
import { createJob } from "@/app/(protected)/jobs/actions";
import { type CreateJob, type Column, type Job } from "@/types/jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { JobsDataTable } from "@/components/jobs-data-table";

const Viewer = dynamic(() => import("@/components/pdf-viewer"), { ssr: false });
const Kanban = dynamic(() => import("@/components/kanban"), { ssr: false });

const Page = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [file, setFile] = useState<DocumentBasicInfo | null>(null);

  const handleViewFile = (job: Job, file?: DocumentBasicInfo) => {
    setSelectedJob(job);
    if (file) {
      setFile(file);
    } else {
      setFile(null);
    }
  };
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("jobsViewMode", mode);
    setSelectedJob(null);
    setFile(null);
  }, []);

  useEffect(() => {
    const savedViewMode = localStorage.getItem("jobsViewMode") as ViewMode;
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Fetch jobs and columns on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const columnsData = await fetch("/api/applications/columns")
        .then((res) => {
          if (!res.ok) {
            console.error("Failed to fetch columns:", res.statusText);
            return [];
          }
          return res.json().then((data) => data.data.columns);
        })
        .catch((error) => {
          console.error("Error fetching columns:", error);
          return [];
        });
      const jobsData = await fetch("/api/applications")
        .then((res) => {
          if (!res.ok) {
            console.error("Failed to fetch jobs:", res.statusText);
            return [];
          }
          return res.json().then((data) => data.data.jobs);
        })

        .catch((error) => {
          console.error("Error fetching jobs:", error);
          return [];
        });
      setColumns(columnsData);
      setJobs(jobsData);
      console.log(jobsData);
      console.log(columnsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Handler to create a new job and update state at parent level as state
  // was not updating in header component due to missing jobs
  const handleCreateJob = async (jobData: CreateJob) => {
    console.log("stack trace", new Error().stack);

    try {
      console.log("Creating job via API:", jobData);
      const job = await createJob(jobData).then((res) => {
        if (!res.success || !res.data) {
          throw new Error(res.error || "Failed to create job");
        }
        toast.success("Job created successfully");
        return res.data as Job;
      });

      console.log("Job created successfully:", job);

      // Update local state to reflect the new job immediately
      setJobs((prevJobs) => [...prevJobs, job]);
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error(
        `Failed to create job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col w-full">
        <Skeleton className="h-12 mt-6 px-1 max-w-[95%] rounded-xl bg-muted mb-2" />

        <div className="flex flex-1 gap-2">
          <Skeleton className="flex-1 rounded-lg bg-muted" />
          <Skeleton className="flex-1 rounded-lg bg-muted" />
          <Skeleton className="flex-1 rounded-lg bg-muted" />
          <Skeleton className="flex-1 rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-row  flex-1 min-w-0">
      <div
        className={`flex flex-col h-full ${
          selectedJob ? "w-1/2" : "w-full"
        } transition-all duration-500 ease-in-out`}
      >
        <div className="mt-6 px-1 pr-2">
          <Header
            columns={columns}
            onCreateJob={handleCreateJob}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          {viewMode === "kanban" ? (
            <Kanban
              jobs={jobs}
              setJobs={setJobs}
              columns={columns}
              setColumns={setColumns}
              handleCreateJob={handleCreateJob}
              searchTerm={searchTerm}
              onViewFile={handleViewFile}
            />
          ) : (
            <JobsDataTable
              jobs={jobs}
              setJobs={setJobs}
              columns={columns}
              searchTerm={searchTerm}
              onViewFile={handleViewFile}
            />
          )}
        </div>
      </div>

      {selectedJob && (
        <div className="flex-1 flex-shrink-0 animate-in slide-in-from-right duration-300">
          <div className="h-screen flex flex-col bg-background/95 border-l shadow-2xl">
            <div className="sticky top-0 z-10 p-3 bg-muted flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage
                    src={selectedJob.companyIconUrl}
                    alt={selectedJob.companyName}
                  />
                  <AvatarFallback>
                    <Building2 className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{selectedJob.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedJob.companyName}
                  </p>
                </div>
              </div>
              <X
                className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setSelectedJob(null)}
              />
            </div>
            <ScrollArea className="flex-1 min-h-0">
              {file ? (
                <Viewer file={file} />
              ) : (
                <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {selectedJob.description || "No description available."}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
