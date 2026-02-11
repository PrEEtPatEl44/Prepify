// Job types — computed/presentation layer types
// DB types are inferred from Drizzle schema in @/db/types

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

type CreateJob = Omit<
  Job,
  "id" | "createdAt" | "updatedAt" | "companyIconUrl" | "columnId"
> & {
  columnId?: string;
};

interface Column {
  id: string;
  name: string;
  color?: string;
  [key: string]: unknown;
}

export type { Job, Column, CreateJob };
