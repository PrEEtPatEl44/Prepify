// Updated types to match your database schema
// File: src/types/jobs.ts

interface Job {
  id: string;
  title: string;
  description: string;
  columnId?: string;
  createdAt: Date;
  updatedAt: Date;
  applicationLink: string;
  companyIconUrl: string;
  companyName: string;
  coverLetterId?: string;
  resumeId?: string;
  companyDomain?: string;
}

type CreateJob = Omit<Job, "id" | "createdAt" | "updatedAt" | "companyIconUrl">;

interface JobDbRow {
  id: string;
  job_title: string;
  company_name: string;
  column_id: string;
  company_domain?: string;
  job_description?: string;
  job_url?: string;
  resume_id?: string;
  cover_letter_id?: string;
  created_at: string; // Assuming this is a string from the database
}

interface Column {
  id: string;
  name: string;
  [key: string]: unknown;
}

export type { Job, Column, JobDbRow, CreateJob };
