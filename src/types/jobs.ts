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
  companyDomain?: string;
}

interface Column {
  id: string;
  name: string;
  [key: string]: unknown;
}

export type { Job, Column };
