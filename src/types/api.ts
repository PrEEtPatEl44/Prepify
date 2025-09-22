// API Types for Job Applications
// File: src/types/api.ts

import { Job } from "@/types/jobs";

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request bodies for API endpoints
export interface CreateJobRequest {
  title: string;
  description: string;
  columnId: string;
  applicationLink: string;
  companyIconUrl: string;
  companyName: string;
  coverLetterId?: string;
  resumeId?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  id?: never; // Prevent ID from being updated in request body
}

// Response types
export interface GetJobsResponse extends ApiResponse {
  data: {
    jobs: Job[];
    total: number;
  };
}

export interface CreateJobResponse extends ApiResponse {
  data: {
    job: Job;
  };
}

export interface UpdateJobResponse extends ApiResponse {
  data: {
    job: Job;
  };
}

export interface DeleteJobResponse extends ApiResponse {
  data: {
    deletedId: string;
  };
}

// Error response types
export interface ApiError extends ApiResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}
