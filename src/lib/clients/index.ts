import { JobsApiClient } from "./jobsClient";
import { ColumnsApiClient } from "./columnClient";
import { CreateJobRequest, UpdateJobRequest } from "@/types/api";

export class ApiClient {
  public readonly jobs: JobsApiClient;
  public readonly columns: ColumnsApiClient;

  constructor() {
    this.jobs = new JobsApiClient();
    this.columns = new ColumnsApiClient();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export services for direct access
export const jobsService = apiClient.jobs;
export const columnsService = apiClient.columns;

// Backward compatibility - individual function exports
export const getAllJobs = () => apiClient.jobs.getAllJobs();
export const searchJobs = (query: string) => apiClient.jobs.searchJobs(query);
export const getJobById = (id: string) => apiClient.jobs.getJobById(id);
export const createJob = (jobData: CreateJobRequest) =>
  apiClient.jobs.createJob(jobData);
export const updateJob = (id: string, updateData: UpdateJobRequest) =>
  apiClient.jobs.updateJob(id, updateData);
export const deleteJob = (id: string) => apiClient.jobs.deleteJob(id);
export const moveJob = (id: string, newColumn: string) =>
  apiClient.jobs.moveJob(id, newColumn);
export const getAllColumns = () => apiClient.columns.getAllColumns();
export const createColumn = (columnData: { name: string }) =>
  apiClient.columns.createColumn(columnData);
