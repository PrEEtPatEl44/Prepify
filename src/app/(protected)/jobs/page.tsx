"use client";
import React from "react";
import Header from "@/components/header";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { createJob } from "@/app/(protected)/jobs/actions";
import { type CreateJob, type Column, type Job } from "@/types/jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Kanban = dynamic(() => import("@/components/kanban"), { ssr: false });

const Page = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
        }`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col w-full">
        <Skeleton className="h-12 mt-6 px-1 max-w-[95%] rounded-xl bg-gray-200 mb-2" />

        <div className="flex flex-1 gap-2">
          <Skeleton className="flex-1 rounded-lg bg-gray-200" />
          <Skeleton className="flex-1 rounded-lg bg-gray-200" />
          <Skeleton className="flex-1 rounded-lg bg-gray-200" />
          <Skeleton className="flex-1 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="mt-6 px-1 max-w-[95%]">
        <Header
          columns={columns}
          onCreateJob={handleCreateJob}
          setSearchTerm={setSearchTerm}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <Kanban
          jobs={jobs}
          setJobs={setJobs}
          columns={columns}
          setColumns={setColumns}
          handleCreateJob={handleCreateJob}
          searchTerm={searchTerm}
        />
      </div>
    </div>
  );
};

export default Page;
