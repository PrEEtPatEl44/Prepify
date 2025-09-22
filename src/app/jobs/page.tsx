"use client";
import React from "react";
import Header from "@/components/header";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
// TODO: Remove this and use the apiClient directly
import { getAllColumns } from "./actions";
import { getAllJobs, createJob } from "@/lib/clients/apiClient";
import { type Column, type Job } from "./jobStore";

const Example = dynamic(() => import("@/components/kanban"), { ssr: false });

const Page = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const columnsData = await getAllColumns();
      const jobsData = await getAllJobs();
      setColumns(columnsData.filter((c) => c.name !== "CREATE_NEW"));
      setJobs(jobsData);
    };
    fetchData();
  }, []);

  // TODO: Will need to update this as is being repeated in kanban.tsx as well
  // we could probabply change the CreateJobModal to use asChild for trigger
  // and instead of manual usestate hooks from parent component
  // and then centralize the create job logic here

  // Handler to create a new job and update state at parent level as state
  // was not updating in header component due to missing jobs
  const handleCreateJob = async (
    jobData: Partial<Job>,
    targetColumn: string
  ) => {
    console.log("Creating job via API:", jobData);

    // Convert jobData to match CreateJobRequest interface with proper type casting
    const requestData = {
      name: jobData.name || "",
      company: jobData.company || "",
      column: targetColumn,
      image: jobData.image as string | undefined,
      jobDescription: jobData.jobDescription as string | undefined,
      link: jobData.link as string | undefined,
      location: jobData.location as string | undefined,
      employmentType: jobData.employmentType as string | undefined,
      salaryRange: jobData.salaryRange as string | undefined,
      resumeId: jobData.resumeId as string | undefined,
      coverLetterId: jobData.coverLetterId as string | undefined,
    };

    const newJob = await createJob(requestData);
    console.log("Job created successfully:", newJob);

    setJobs((prevJobs) => [...prevJobs, newJob]);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="mt-6 px-1 max-w-[95%]">
        <Header onCreateJob={handleCreateJob} />
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
