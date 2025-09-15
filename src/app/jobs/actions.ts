"use server";

import { columns, exampleJobs, Column, Job } from "./jobStore";

/**
 * Get all columns defined in the job board
 * @returns Array of columns with their properties
 */
export async function getAllColumns(): Promise<Column[]> {
  // later this would fetch from a database
  // For now, we're returning the columns directly from jobStore
  return columns;
}

/**
 * Get all jobs currently in the system
 * @returns Array of job objects
 */
export async function getAllJobs(): Promise<Job[]> {
  // later this would fetch from a database
  // For now, we're returning the example jobs from jobStore
  return exampleJobs;
}
