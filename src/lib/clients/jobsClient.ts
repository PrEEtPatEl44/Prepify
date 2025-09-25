import { BaseApiClient } from "@/lib/clients/baseClient";
import { Job } from "@/types/jobs";
import {
  CreateJobRequest,
  UpdateJobRequest,
  GetJobsResponse,
  CreateJobResponse,
  UpdateJobResponse,
  DeleteJobResponse,
} from "@/types/api";

export class JobsApiClient extends BaseApiClient {
  /**
   * Get all job applications
   */
  async getAllJobs(): Promise<Job[]> {
    const response = await this.fetchApi<GetJobsResponse>("/applications");
    return response.data.jobs;
  }

  /**
   * Get job applications filtered by column
   */
  async getJobsByColumn(columnId: string): Promise<Job[]> {
    const response = await this.fetchApi<GetJobsResponse>(
      `/applications?column=${columnId}`
    );
    return response.data.jobs;
  }

  /**
   * Search job applications
   */
  async searchJobs(query: string): Promise<Job[]> {
    const response = await this.fetchApi<GetJobsResponse>(
      `/applications?search=${encodeURIComponent(query)}`
    );
    return response.data.jobs;
  }

  /**
   * Get a specific job application by ID
   */
  async getJobById(id: string): Promise<Job> {
    const response = await this.fetchApi<{
      success: boolean;
      data: { job: Job };
    }>(`/applications/${id}`);
    return response.data.job;
  }

  /**
   * Create a new job application
   */
  async createJob(jobData: CreateJobRequest): Promise<Job> {
    const response = await this.fetchApi<CreateJobResponse>("/applications", {
      method: "POST",
      body: JSON.stringify(jobData),
    });
    return response.data.job;
  }

  /**
   * Update an existing job application
   */
  async updateJob(id: string, updateData: UpdateJobRequest): Promise<Job> {
    const response = await this.fetchApi<UpdateJobResponse>(
      `/applications/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );
    return response.data.job;
  }

  /**
   * Delete a job application
   */
  async deleteJob(id: string): Promise<string> {
    const response = await this.fetchApi<DeleteJobResponse>(
      `/applications/${id}`,
      {
        method: "DELETE",
      }
    );
    return response.data.deletedId;
  }

  /**
   * Move a job to a different column
   */
  async moveJob(id: string, newColumn: string): Promise<Job> {
    return this.updateJob(id, { columnId: newColumn });
  }
}
