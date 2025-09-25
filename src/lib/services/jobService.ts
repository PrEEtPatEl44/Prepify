/* eslint-disable @typescript-eslint/no-explicit-any */

// Database Job Service Layer - For existing job_applications table
// File: src/lib/services/jobService.ts

import { createClient } from "@/utils/supabase/server";
import { Column, Job } from "@/types/jobs";
import {
  CreateJobRequest,
  UpdateJobRequest,
  CreateColumnRequest,
} from "@/types/api";

export class DatabaseJobService {
  constructor() {
    // Don't initialize supabase client here - do it in methods instead
  }

  /**
   * Initialize supabase client (call this in methods that need it)
   */
  private async getSupabaseClient() {
    return await createClient();
  }

  ///TRANSFORMERS ARE ONLY USED TO MAP THE NAMES BETWEEN DB AND API
  /// ONCE PRISMA IS SETUP, THESE CAN BE REMOVED

  /**
   * Transform database row to Job type
   */
  private transformDbRowToJob(row: any): Job {
    return {
      id: row.id,
      title: row.job_title,
      companyName: row.company_name,
      columnId: row.column_id,
      companyIconUrl: row.company_logo_url,
      description: row.job_description || "",
      applicationLink: row.job_url || "",
      resumeId: row.resume_id,
      coverLetterId: row.cover_letter_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.created_at),
    };
  }

  /**
   * Transform Job type to database row
   */
  private transformJobToDbRow(job: Partial<Job>, userId?: string) {
    const dbRow: any = {};

    if (job.title !== undefined) dbRow.job_title = job.title;
    if (job.companyName !== undefined) dbRow.company_name = job.companyName;
    if (job.columnId !== undefined) dbRow.column_id = job.columnId;
    if (job.companyIconUrl !== undefined)
      dbRow.company_logo_url = job.companyIconUrl;
    if (job.description !== undefined) dbRow.job_description = job.description;
    if (job.applicationLink !== undefined) dbRow.job_url = job.applicationLink;

    // Handle UUID fields - only include if they're valid UUIDs or null
    if (job.resumeId !== undefined) {
      if (job.resumeId && this.isValidUUID(job.resumeId)) {
        dbRow.resume_id = job.resumeId;
      } else if (job.resumeId === null || job.resumeId === "") {
        dbRow.resume_id = null;
      }
      // If it's not a valid UUID and not null/empty, don't include it
    }

    if (job.coverLetterId !== undefined) {
      if (job.coverLetterId && this.isValidUUID(job.coverLetterId)) {
        dbRow.cover_letter_id = job.coverLetterId;
      } else if (job.coverLetterId === null || job.coverLetterId === "") {
        dbRow.cover_letter_id = null;
      }
      // If it's not a valid UUID and not null/empty, don't include it
    }

    if (userId) dbRow.user_id = userId;

    return dbRow;
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Get current user ID from Supabase auth
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const supabase = await this.getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get all job applications for current user
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Fix the context binding issue by using arrow function or bind
      return (data || []).map((row) => this.transformDbRowToJob(row));
    } catch (error) {
      console.error("Error in getAllJobs:", error);
      throw error;
    }
  }

  /**
   * Get a specific job by ID
   */
  async getJobById(id: string): Promise<Job | null> {
    try {
      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No rows found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data ? this.transformDbRowToJob(data) : null;
    } catch (error) {
      console.error("Error in getJobById:", error);
      throw error;
    }
  }

  /**
   * Create a new job application
   */
  async createJob(jobData: CreateJobRequest): Promise<Job> {
    try {
      // Validate required fields
      if (!jobData.title || !jobData.companyName) {
        throw new Error("Title and company name are required fields");
      }

      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const dbRow = this.transformJobToDbRow(
        {
          title: jobData.title,
          companyName: jobData.companyName,
          columnId: jobData.columnId || "col-1",
          companyIconUrl: jobData.companyIconUrl,
          description: jobData.description || "",
          applicationLink: jobData.applicationLink || "",
          resumeId: jobData.resumeId,
          coverLetterId: jobData.coverLetterId,
        },
        userId
      );

      console.log("Inserting job with data:", dbRow);

      const { data, error } = await supabase
        .from("job_applications")
        .insert([dbRow])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return this.transformDbRowToJob(data);
    } catch (error) {
      console.error("Error in createJob:", error);
      throw error;
    }
  }

  /**
   * Update an existing job application
   */
  async updateJob(
    id: string,
    updateData: UpdateJobRequest
  ): Promise<Job | null> {
    try {
      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const dbRow = this.transformJobToDbRow(updateData);

      const { data, error } = await supabase
        .from("job_applications")
        .update(dbRow)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No rows found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data ? this.transformDbRowToJob(data) : null;
    } catch (error) {
      console.error("Error in updateJob:", error);
      throw error;
    }
  }

  /**
   * Delete a job application
   */
  async deleteJob(id: string): Promise<boolean> {
    try {
      // Validate UUID format
      if (!this.isValidUUID(id)) {
        throw new Error(`Invalid UUID format: ${id}`);
      }

      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("Error in deleteJob:", error);
      throw error;
    }
  }

  /**
   * Search jobs by company name or job title
   */
  async searchJobs(query: string): Promise<Job[]> {
    try {
      if (!query.trim()) {
        return this.getAllJobs();
      }

      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const searchTerm = `%${query.toLowerCase()}%`;

      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", userId)
        .or(`job_title.ilike.${searchTerm},company_name.ilike.${searchTerm}`)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return (data || []).map((row) => this.transformDbRowToJob(row));
    } catch (error) {
      console.error("Error in searchJobs:", error);
      throw error;
    }
  }

  /**
   * Move a job to a different column
   */
  async moveJob(id: string, newColumn: string): Promise<Job | null> {
    return this.updateJob(id, { columnId: newColumn });
  }

  /**
   * Get total count of jobs for current user
   */
  async getJobsCount(): Promise<number> {
    try {
      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { count, error } = await supabase
        .from("job_applications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error("Error in getJobsCount:", error);
      throw error;
    }
  }

  /**
   * Create a new column
   */
  async createColumn(columnData: CreateColumnRequest): Promise<Column> {
    try {
      if (!columnData.name) {
        throw new Error("Column name is required");
      }

      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("columns")
        .insert([{ user_id: userId, name: columnData.name }])
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in createColumn:", error);
      throw error;
    }
  }

  /**
   * Get all columns for current user
   */
  async getAllColumns(): Promise<Column[]> {
    try {
      const supabase = await this.getSupabaseClient();
      const userId = await this.getCurrentUserId();

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllColumns:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const jobService = new DatabaseJobService();
