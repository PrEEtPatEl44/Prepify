"use client";
import React from "react";
import Header from "@/components/header";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAllColumns, getAllJobs, createJob } from "./actions";
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

  // Handler to create a new job and update state at parent level as state
  // was not updating in header component due to missing jobs
  const handleCreateJob = async (
    jobData: Partial<Job>,
    targetColumn: string
  ) => {
    const newJob = await createJob({ ...jobData, column: targetColumn });
    setJobs((prev) => [...prev, newJob]);
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
