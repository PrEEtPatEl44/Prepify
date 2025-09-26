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
import { type Column, type Job } from "@/types/jobs";
import { deleteJob, createColumn, moveJob } from "@/lib/clients";
import CreateJobModal from "@/components/modals/CreateJobModal";
import CreateListModal from "@/components/modals/CreateListModal";
import DeleteJobModal from "@/components/modals/DeleteJobModal";
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

const Example = ({
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
  handleCreateJob: (jobData: Partial<Job>) => Promise<void>;
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pickedItem, setPickedItem] = useState<JobKanbanItem | null>();
  const [prevJobs, setPrevJobs] = useState<Job[] | null>(null);

  const handleCreateList = async (listName: string) => {
    if (!listName) return;
    const newColumn: Column = await createColumn({ name: listName });
    setColumns((prev) => [...prev, newColumn]);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob || isDeleting) return;

    setIsDeleting(true);
    console.log("Confirming delete for job:", selectedJob.id);

    try {
      console.log("Deleting job via API:", selectedJob.id);

      await deleteJob(selectedJob.id);
      console.log("Job deleted successfully");

      setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
      setSelectedJob(null);
    } catch (error) {
      console.error("Delete failed:", error);
      alert(
        `Failed to delete job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
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
        await moveJob(item.id, item.column);
      } catch (error) {
        console.error("Move failed:", error);
        alert(
          `Failed to move job: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        if (prevJobs) {
          setJobs(prevJobs);
        }
      }
      console.log(
        `Drag ended and item moved from ${pickedItem.column} to new column: ${item.column}`
      );
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
                                  handleConfirmDelete();
                                }}
                              >
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    setSelectedJob(
                                      transformKanbanItemsToJobs(jobData) as Job
                                    );
                                    e.preventDefault();
                                  }}
                                  className={
                                    isDeleting
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                                  }
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                              </DeleteJobModal>
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

export default Example;
