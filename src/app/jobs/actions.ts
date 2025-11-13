"use server";

import { createClient } from "@/utils/supabase/server";
import { Column, type CreateJob, type Job } from "@/types/jobs";
import { transformDbRowToJob } from "@/adapters/jobAdapters";
import { cookies } from "next/headers";
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
      !data.description ||
      !data.applicationLink
    ) {
      return {
        success: false,
        error: "Missing required fields to create a job.",
      };
    }

    // Get columnId from data or fetch the first column as default
    let columnId = data.columnId;
    if (!columnId) {
      try {
        const cookieHeader = cookies().toString();
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          }/api/applications/columns`,
          {
            headers: {
              "Content-Type": "application/json",
              Cookie: cookieHeader,
            },
            cache: "no-store",
          }
        );
        console.log("Fetched columns response:", response);
        if (response.ok) {
          const result = await response.json();
          console.log("Fetched columns data:", result);
          if (result.success && result.data?.columns?.length > 0) {
            console.log(
              "Using first column ID as default:",
              result.data.columns[0].id
            );
            columnId = result.data.columns[0].id;
          } else {
            return {
              success: false,
              error: "No columns found. Please create a column first.",
            };
          }
        } else {
          return {
            success: false,
            error: "Failed to fetch columns.",
          };
        }
      } catch (fetchError) {
        console.error("Error fetching columns:", fetchError);
        return {
          success: false,
          error: "Failed to fetch columns.",
        };
      }
    }

    const { data: job, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        job_title: data.title,
        company_name: data.companyName,
        column_id: columnId,
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

export async function editJob(
  jobId: string,
  data: Partial<CreateJob>
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

    // Build the update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.job_title = data.title;
    if (data.companyName !== undefined)
      updateData.company_name = data.companyName;
    if (data.columnId !== undefined) updateData.column_id = data.columnId;
    if (data.description !== undefined)
      updateData.job_description = data.description;
    if (data.applicationLink !== undefined)
      updateData.job_url = data.applicationLink;
    if (data.resumeId !== undefined) updateData.resume_id = data.resumeId;
    if (data.coverLetterId !== undefined)
      updateData.cover_letter_id = data.coverLetterId;
    if (data.companyDomain !== undefined)
      updateData.company_domain = data.companyDomain;

    const { data: job, error } = await supabase
      .from("job_applications")
      .update(updateData)
      .eq("id", jobId)
      .eq("user_id", user.id) // Ensure user owns the job
      .select("*")
      .single();

    if (error) {
      console.error("Error updating job:", error);
      return { success: false, error: "Failed to update job" };
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
