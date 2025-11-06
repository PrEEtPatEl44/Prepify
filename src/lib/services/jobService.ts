/////////////////////////////////////////////////////////////////////////////

// File: src/lib/services/jobService.ts
// This service is just kept for reference
// It is no longer used since we moved to direct queries in the API routes
// The service can be deleted once Prisma is fully set up

/////////////////////////////////////////////////////////////////////////////

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/utils/supabase/server";
import { Column, Job } from "@/types/jobs";

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
      companyIconUrl: row.company_domain
        ? `https://cdn.brandfetch.io/${row.company_domain}?c=${process.env.BRANDFETCH_CLIENT_ID}`
        : "/logo.svg",
      description: row.job_description || "",
      applicationLink: row.job_url || "",
      resumeId: row.resume_id,
      coverLetterId: row.cover_letter_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.created_at),
      companyDomain: row.company_domain,
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
    if (job.companyDomain !== undefined)
      dbRow.company_domain = job.companyDomain;

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
