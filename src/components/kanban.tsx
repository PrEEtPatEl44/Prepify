"use client";

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { CreateJob, type Column, type Job } from "@/types/jobs";
import CreateJobModal from "@/components/modals/CreateJobModal";
import CreateListModal from "@/components/modals/CreateListModal";
import DeleteJobModal from "@/components/modals/DeleteJobModal";
import { deleteJob, moveJob, createColumn } from "@/app/jobs/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  transformJobsToKanbanItem,
  transformKanbanItemsToJobs,
  type JobKanbanItem,
} from "@/adapters/jobAdapters";
import EditJobModal from "./modals/EditJobModal";
import { toast } from "sonner";

const Kanban = ({
  jobs,
  setJobs,
  columns,
  setColumns,
  handleCreateJob,
}: {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  handleCreateJob: (jobData: CreateJob) => Promise<void>;
}) => {
  // UPDATED: Handle kanban data changes and transform back to Job format
  const handleKanbanDataChange = (updatedKanbanItems: JobKanbanItem[]) => {
    console.log("Kanban data changed:", updatedKanbanItems);

    // Transform back to Job format using the adapter
    const updatedJobs = updatedKanbanItems.map((kanbanItem) => {
      const originalJob = jobs.find((j) => j.id === kanbanItem.id);
      return transformKanbanItemsToJobs(kanbanItem, originalJob);
    });

    setJobs(updatedJobs as Job[]);
  };

  const [pickedItem, setPickedItem] = useState<JobKanbanItem | null>();
  const [prevJobs, setPrevJobs] = useState<Job[] | null>(null);

  const handleCreateList = async (listName: string) => {
    if (!listName) return;
    const newColumn: Column = await createColumn(listName).then((res) => {
      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to create column");
      }
      return res.data;
    });
    console.log("Created new column:", newColumn);
    setColumns((prev) => [...prev, newColumn]);
  };

  const handleConfirmDelete = async (selectedJob: Job) => {
    console.log("Confirming delete for job:", selectedJob.id);
    try {
      await deleteJob(selectedJob.id).then((res) => {
        if (!res.success) {
          throw new Error(res.error || "Failed to delete job");
        }
        toast.success("Job deleted successfully");
        return { success: true, error: null };
      });
      setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error(
        `Failed to delete job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleJobUpdated = (updatedJob: Job) => {
    console.log("Job updated:", updatedJob);
    setJobs((prev) =>
      prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStart = (e: any) => {
    const item = kanbanItems.find((item) => item.id === e.active.id);
    setPickedItem(item);
    setPrevJobs(jobs);
    console.log("Drag started!!!!!!!!:", item);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (e: any) => {
    const item = kanbanItems.find((item) => item.id === e.active.id);
    if (item && pickedItem && item.column !== pickedItem.column) {
      try {
        await moveJob(item.id, item.column).then((res) => {
          if (!res.success) {
            throw new Error(res.error || "Failed to move job");
          }
          return { success: true, error: null };
        });
      } catch (error) {
        console.error("Move failed:", error);
        alert(
          `Failed to move job: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        // Revert to previous state on failure
        if (prevJobs) {
          setJobs(prevJobs);
        }
      }
    }
  };

  const allColumns = [
    ...columns,
    { id: "create-new-list", name: "Create New List" },
  ];
  const kanbanItems = jobs.map(transformJobsToKanbanItem);
  const kanbanColumns = allColumns;
  return (
    <>
      <KanbanProvider
        columns={kanbanColumns}
        data={kanbanItems}
        onDataChange={handleKanbanDataChange}
        onDragStart={(e) => handleDragStart(e)}
        onDragEnd={(e) => handleDragEnd(e)}
      >
        {(column) =>
          column.id === "create-new-list" ? (
            <KanbanBoard
              id={column.id}
              key={column.id}
              className="bg-gray-100 p-2 shadow-lg"
            >
              <KanbanHeader className="border-0">
                <CreateListModal onSubmit={handleCreateList} />
              </KanbanHeader>
            </KanbanBoard>
          ) : (
            <KanbanBoard
              id={column.id}
              key={column.id}
              className="bg-white p-2 shadow-lg"
            >
              <KanbanHeader className="border-0">
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-md font-archivo font-semibold`}>
                    {column.name}
                  </span>

                  <CreateJobModal
                    onSubmit={handleCreateJob}
                    targetColumn={column.id}
                  />
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(item) => {
                  const jobData = item as JobKanbanItem; // Type assertion since item contains all Job fields
                  return (
                    <KanbanCard
                      column={column.id}
                      id={jobData.id}
                      key={jobData.id}
                      name={jobData.name}
                      className="bg-[#F3F4F6] border-0"
                    >
                      <div className="flex items-start justify-between gap-2 relative">
                        <div className="flex gap-3">
                          {jobData.companyIconUrl && (
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage
                                src={jobData.companyIconUrl}
                                className="!rounded-md"
                              />
                              <AvatarFallback>
                                {jobData.title?.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col gap-1 max-w-30">
                            <p className="mt-1 flex-1 font-medium text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                              {jobData.title}
                            </p>
                            <p className="m-0 text-muted-foreground text-2xs">
                              {jobData.companyName}
                            </p>
                          </div>
                        </div>

                        <div
                          className="relative"
                          style={{ touchAction: "none" }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="cursor-pointer"
                              asChild
                            >
                              <div
                                className="text-gray-500 p-1.5 rounded-md transition-all hover:text-gray-700 hover:bg-gray-200"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Ellipsis className="h-4 w-4" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40"
                              side="bottom"
                              sideOffset={4}
                              onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => {
                                  console.log(
                                    "Going to link " + jobData.applicationLink
                                  );
                                }}
                              >
                                Go to link
                              </DropdownMenuItem>
                              <DeleteJobModal
                                onConfirm={() => {
                                  handleConfirmDelete(
                                    transformKanbanItemsToJobs(jobData) as Job
                                  );
                                }}
                                job={transformKanbanItemsToJobs(jobData) as Job}
                              />
                              <EditJobModal
                                job={
                                  transformKanbanItemsToJobs(
                                    jobData,
                                    jobs.find((j) => j.id === jobData.id)
                                  ) as Job
                                }
                                onJobUpdated={handleJobUpdated}
                              >
                                <div>Edit</div>
                              </EditJobModal>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </KanbanCard>
                  );
                }}
              </KanbanCards>
            </KanbanBoard>
          )
        }
      </KanbanProvider>
    </>
  );
};

export default Kanban;
