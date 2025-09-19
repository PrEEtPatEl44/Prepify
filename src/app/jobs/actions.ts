"use server";

import { columns, exampleJobs, Column, Job } from "./jobStore";

// In-memory storage for development (replace with database later)
// eslint-disable-next-line prefer-const
let jobs = [...exampleJobs];

/**
 * Get all columns defined in the job board
 * @returns Array of columns with their properties
 */
export async function getAllColumns(): Promise<Column[]> {
  return columns;
}

/**
 * Get all jobs currently in the system
 * @returns Array of job objects
 */
export async function getAllJobs(): Promise<Job[]> {
  return jobs;
}

/**
 * Create a new job application
 * @param jobData - Partial job object with required fields
 * @returns Created job object
 */
export async function createJob(jobData: Partial<Job>): Promise<Job> {
  // Simulate API delay
  // await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate unique ID
  const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create the new job with required fields
  const newJob: Job = {
    id,
    name: jobData.name || "",
    company: jobData.company || "",
    column: jobData.column || "col-1",
    image:
      jobData.image ||
      `https://cdn.brandfetch.io/${jobData.company
        ?.toLowerCase()
        .replace(/\s+/g, "")}.com?c=1idy7WQ5YtpRvbd1DQy`,
    // Include any additional fields passed in
    jobDescription: jobData.jobDescription,
    link: jobData.link,
    location: jobData.location,
    employmentType: jobData.employmentType,
    salaryRange: jobData.salaryRange,
    resumeId: jobData.resumeId,
    coverLetterId: jobData.coverLetterId,
    ...jobData,
  };

  // Add to in-memory storage
  jobs.push(newJob);

  console.log("Created new job:", newJob); // For debugging

  return newJob;
}

/**
 * Update an existing job application
 * @param jobId - ID of the job to update
 * @param updateData - Fields to update
 * @returns Updated job object
 */
export async function updateJob(
  jobId: string,
  updateData: Partial<Job>
): Promise<Job | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const jobIndex = jobs.findIndex((job) => job.id === jobId);

  if (jobIndex === -1) {
    throw new Error("Job not found");
  }

  // Update the job
  jobs[jobIndex] = { ...jobs[jobIndex], ...updateData };

  return jobs[jobIndex];
}

/**
 * Delete a job application
 * @param jobId - ID of the job to delete
 * @returns Success boolean
 */
export async function deleteJob(jobId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const jobIndex = jobs.findIndex((job) => job.id === jobId);

  if (jobIndex === -1) {
    throw new Error("Job not found");
  }

  // Remove from array
  jobs.splice(jobIndex, 1);

  return true;
}

/**
 * Move a job to a different column
 * @param jobId - ID of the job to move
 * @param newColumn - Target column ID
 * @returns Updated job object
 */
export async function moveJob(
  jobId: string,
  newColumn: string
): Promise<Job | null> {
  return updateJob(jobId, { column: newColumn });
}
