import { type Job } from "@/types/jobs";
import { type KanbanItemProps } from "@/components/ui/shadcn-io/kanban/index";
import { type JobDbRow } from "@/types/jobs";

export interface JobKanbanItem extends KanbanItemProps {
  title: string;
  companyName: string;
  companyIconUrl: string;
  applicationLink: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
const transformJobsToKanbanItem = (job: Job): JobKanbanItem => ({
  id: job.id,
  name: job.title,
  column: job.columnId,
  title: job.title,
  companyName: job.companyName,
  companyIconUrl: job.companyIconUrl,
  applicationLink: job.applicationLink,
  description: job.description,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

// Utility to reverse-transform after drag/drop
const transformKanbanItemsToJobs = (
  kanbanItem: JobKanbanItem,
  originalJob?: Partial<Job>
): Partial<Job> => ({
  ...originalJob,
  id: kanbanItem.id,
  title: kanbanItem.title,
  columnId: kanbanItem.column,
  companyName: kanbanItem.companyName,
  companyIconUrl: kanbanItem.companyIconUrl,
  applicationLink: kanbanItem.applicationLink,
  description: kanbanItem.description,
  coverLetterId: originalJob?.coverLetterId,
  resumeId: originalJob?.resumeId,
  createdAt: kanbanItem.createdAt,
  updatedAt: kanbanItem.updatedAt,
  companyDomain: originalJob?.companyDomain,
});

const transformDbRowToJob = (row: JobDbRow): Job => {
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
};

export {
  transformJobsToKanbanItem,
  transformKanbanItemsToJobs,
  transformDbRowToJob,
};
