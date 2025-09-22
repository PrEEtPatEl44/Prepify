import { type Job } from "@/types/jobs";
import { type KanbanItemProps } from "@/components/ui/shadcn-io/kanban/index";

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
});

export { transformJobsToKanbanItem, transformKanbanItemsToJobs };
