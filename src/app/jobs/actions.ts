"use server";

import { createClient } from "@/utils/supabase/server";
import { Column, type CreateJob, type Job } from "@/types/jobs";
import { transformDbRowToJob } from "@/adapters/jobAdapters";

// create a job record in the database
export async function createJob(
  data: CreateJob
): Promise<{ success: boolean; data?: Job; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    if (
      !data.title ||
      !data.companyName ||
      !data.columnId ||
      !data.description ||
      !data.applicationLink
    ) {
      return {
        success: false,
        error: "Missing required fields to create a job.",
      };
    }

    const { data: job, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        job_title: data.title,
        company_name: data.companyName,
        column_id: data.columnId,
        job_description: data.description,
        job_url: data.applicationLink,
        resume_id: data.resumeId ? data.resumeId : null,
        cover_letter_id: data.coverLetterId ? data.coverLetterId : null,
        company_domain: data.companyDomain,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return { success: false, error: "Failed to create job" };
    }

    return { success: true, data: transformDbRowToJob(job) as Job };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function deleteJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error);
      return { success: false, error: "Failed to delete job" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function moveJob(
  jobId: string,
  newColumnId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    const { error } = await supabase
      .from("job_applications")
      .update({ column_id: newColumnId, updated_at: new Date().toISOString() })
      .eq("id", jobId);

    if (error) {
      console.error("Error moving job:", error);
      return { success: false, error: "Failed to move job" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}

export async function createColumn(
  name: string
): Promise<{ success: boolean; data?: Column; error?: string }> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated. Please log in.",
      };
    }

    const { data: column, error } = await supabase
      .from("columns")
      .insert({
        user_id: user.id,
        name,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating column:", error);
      return { success: false, error: "Failed to create column" };
    }

    return { success: true, data: column as Column };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: `An unexpected error occurred: ${error}` };
  }
}
