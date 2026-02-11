import { type Job } from "@/types/jobs";
import { type KanbanItemProps } from "@/components/ui/shadcn-io/kanban/index";
import { type JobApplication } from "@/db/types";

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

// Drizzle returns camelCase fields — map to the Job type
const transformDbRowToJob = (row: JobApplication): Job => {
  return {
    id: row.id,
    title: row.jobTitle,
    companyName: row.companyName,
    columnId: row.columnId ?? "",
    companyIconUrl: row.companyDomain
      ? `https://cdn.brandfetch.io/${row.companyDomain}?c=${process.env.BRANDFETCH_CLIENT_ID}`
      : "/logo.svg",
    description: row.jobDescription || "",
    applicationLink: row.jobUrl || "",
    resumeId: row.resumeId ?? undefined,
    coverLetterId: row.coverLetterId ?? undefined,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    companyDomain: row.companyDomain ?? undefined,
  };
};

export {
  transformJobsToKanbanItem,
  transformKanbanItemsToJobs,
  transformDbRowToJob,
};
