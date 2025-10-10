// API Types for Job Applications
// File: src/types/api.ts

import { Job, Column } from "@/types/jobs";

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Response types
export interface GetJobsResponse extends ApiResponse {
  data: {
    jobs: Job[];
    total: number;
  };
}

export interface GetColumnsResponse extends ApiResponse {
  data: {
    columns: Column[];
  };
}

// Error response types
export interface ApiError extends ApiResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}
