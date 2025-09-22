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

export type { Job, Column };
