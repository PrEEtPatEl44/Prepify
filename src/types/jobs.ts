// Updated types to match your database schema
// File: src/types/jobs.ts

interface Job {
  id: string;
  title: string;
  description: string;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
  applicationLink: string;
  companyIconUrl: string;
  companyName: string;
  coverLetterId?: string;
  resumeId?: string;
}

interface Column {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Additional types that match your database
interface DatabaseJobApplication {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_description?: string;
  company_logo_url?: string;
  application_status: 'APPLIED' | 'FINAL_INTERVIEW' | 'OFFER' | 'PHONE_SCREEN' | 'REJECTED' | 'TECHNICAL_INTERVIEW' | 'WISHLIST';
  date_applied?: string;
  job_url?: string;
  location?: string;
  employment_type?: string;
  salary_range?: string;
  resume_id?: string;
  cover_letter_id?: string;
  notes?: string;
  ai_match_score?: number;
  column_position?: number;
  created_at: string;
}

export type { Job, Column, DatabaseJobApplication };