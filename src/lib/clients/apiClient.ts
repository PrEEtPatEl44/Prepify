// API Client for Frontend
// File: src/lib/apiClient.ts

import { Job } from "@/types/jobs";
import {
  CreateJobRequest,
  UpdateJobRequest,
  GetJobsResponse,
  CreateJobResponse,
  UpdateJobResponse,
  DeleteJobResponse,
  ApiError,
} from "@/types/api";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`API Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(
          error.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      console.log(`API Response: ${options.method || "GET"} ${url}`, data);
      return data;
    } catch (error) {
      console.error(`API Error: ${options.method || "GET"} ${endpoint}`, error);
      throw error;
    }
  }

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

// Export singleton instance
export const apiClient = new ApiClient();

// Export individual functions for easier importing (maintains compatibility with existing code)
export const getAllJobs = () => apiClient.getAllJobs();
export const getJobsByColumn = (columnId: string) =>
  apiClient.getJobsByColumn(columnId);
export const searchJobs = (query: string) => apiClient.searchJobs(query);
export const getJobById = (id: string) => apiClient.getJobById(id);
export const createJob = (jobData: CreateJobRequest) =>
  apiClient.createJob(jobData);
export const updateJob = (id: string, updateData: UpdateJobRequest) =>
  apiClient.updateJob(id, updateData);
export const deleteJob = (id: string) => apiClient.deleteJob(id);
export const moveJob = (id: string, newColumn: string) =>
  apiClient.moveJob(id, newColumn);
