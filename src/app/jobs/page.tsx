"use client";
import React from "react";
import Header from "@/components/header";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAllJobs, createJob, getAllColumns } from "@/lib/clients";
import { type Column, type Job } from "@/types/jobs";
import { Skeleton } from "@/components/ui/skeleton";

const Example = dynamic(() => import("@/components/kanban"), { ssr: false });

const Page = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch jobs and columns on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const columnsData = await getAllColumns();
      const jobsData = await getAllJobs();
      console.log("Fetched jobs:", jobsData);
      setColumns(columnsData);
      setJobs(jobsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // TODO: Will need to update this as is being repeated in kanban.tsx as well
  // we could probabply change the CreateJobModal to use asChild for trigger
  // and instead of manual usestate hooks from parent component
  // and then centralize the create job logic here

  // Handler to create a new job and update state at parent level as state
  // was not updating in header component due to missing jobs
  const handleCreateJob = async (jobData: Partial<Job>) => {
    console.log("Creating job via API:", jobData);
    if (
      !jobData.title ||
      !jobData.companyName ||
      !jobData.companyIconUrl ||
      !jobData.description ||
      !jobData.applicationLink ||
      !jobData.resumeId ||
      !jobData.coverLetterId ||
      !jobData.columnId
    ) {
      throw new Error("All fields are required");
    }

    // Convert jobData to match CreateJobRequest interface with proper type casting
    const requestData = {
      title: jobData.title,
      companyName: jobData.companyName,
      columnId: jobData.columnId,
      companyIconUrl: jobData.companyIconUrl,
      description: jobData.description,
      applicationLink: jobData.applicationLink,
      resumeId: jobData.resumeId,
      coverLetterId: jobData.coverLetterId,
    };

    const newJob = await createJob(requestData);
    console.log("Job created successfully:", newJob);

    setJobs((prevJobs) => [...prevJobs, newJob]);
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
        <Header columns={columns} onCreateJob={handleCreateJob} />
      </div>
      <div className="flex-1 overflow-hidden">
        <Example
          jobs={jobs}
          setJobs={setJobs}
          columns={columns}
          setColumns={setColumns}
        />
      </div>
    </div>
  );
};

export default Page;
