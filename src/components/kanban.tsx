"use client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis, Plus } from "lucide-react";
import { Archivo } from "next/font/google";
import { useState } from "react";
import { type Column, type Job } from "@/app/jobs/jobStore";
// UPDATED: Replace server actions with API client
import { createJob, deleteJob } from "@/lib/clients/apiClient";
import CreateJobModal from "@/components/modals/CreateJobModal";
import CreateListModal from "@/components/modals/CreateListModal";
import DeleteJobModal from "@/components/modals/DeleteJobModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const Example = ({
  jobs,
  setJobs,
  columns,
  setColumns,
}: {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}) => {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<string>("col-1");
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // UPDATED: Add loading states for better UX
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Job Modal Handlers
  const handleOpenJobModal = (columnId: string) => {
    setTargetColumn(columnId);
    setIsJobModalOpen(true);
  };
  const handleCloseJobModal = () => setIsJobModalOpen(false);

  // UPDATED: Enhanced error handling and loading states with proper type casting
  const handleCreateJob = async (jobData: Partial<Job>) => {
    if (isCreating) return; // Prevent double submission

    setIsCreating(true);
    try {
      console.log("Creating job via API:", jobData);

      // Convert jobData to match CreateJobRequest interface with proper type casting
      const requestData = {
        name: jobData.name || "",
        company: jobData.company || "",
        column: targetColumn,
        image: jobData.image as string | undefined,
        jobDescription: jobData.jobDescription as string | undefined,
        link: jobData.link as string | undefined,
        location: jobData.location as string | undefined,
        employmentType: jobData.employmentType as string | undefined,
        salaryRange: jobData.salaryRange as string | undefined,
        resumeId: jobData.resumeId as string | undefined,
        coverLetterId: jobData.coverLetterId as string | undefined,
      };

      const newJob = await createJob(requestData);
      console.log("Job created successfully:", newJob);

      setJobs((prevJobs) => [...prevJobs, newJob]);
      setIsJobModalOpen(false);
    } catch (error) {
      console.error("Failed to create job:", error);
      // You could add a toast notification here
      alert(
        `Failed to create job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCreating(false);
    }
  };

  // List Modal Handlers
  const handleOpenListModal = () => setIsListModalOpen(true);
  const handleCloseListModal = () => setIsListModalOpen(false);
  const handleCreateList = (listName: string) => {
    if (!listName) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: listName,
    };
    setColumns((prev) => [...prev, newColumn]);
    setIsListModalOpen(false);
  };

  // Delete Modal Handlers
  const handleOpenDeleteModal = (job: Job) => {
    console.log("Opening delete modal for job:", job.id, job.name);
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    console.log("Closing delete modal");
    setSelectedJob(null);
    setIsDeleteModalOpen(false);
  };

  // UPDATED: Enhanced error handling and loading states
  const handleConfirmDelete = async () => {
    if (!selectedJob || isDeleting) return;

    setIsDeleting(true);
    console.log("Confirming delete for job:", selectedJob.id);

    try {
      console.log("Deleting job via API:", selectedJob.id);

      await deleteJob(selectedJob.id);
      console.log("Job deleted successfully");

      setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
      setIsDeleteModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Delete failed:", error);
      // You could add a toast notification here
      alert(
        `Failed to delete job: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const allColumns = [
    ...columns,
    { id: "create-new-list", name: "Create New List" },
  ];

  return (
    <>
      <KanbanProvider columns={allColumns} data={jobs} onDataChange={setJobs}>
        {(column) =>
          column.id === "create-new-list" ? (
            <KanbanBoard
              id={column.id}
              key={column.id}
              className="bg-gray-100 p-2 shadow-lg"
            >
              <KanbanHeader className="border-0">
                <div
                  className="flex items-center justify-center bg-gray-100 cursor-pointer rounded-lg p-2"
                  onClick={handleOpenListModal}
                >
                  <Plus className="h-5 w-5 text-gray-500" />
                  <span className="ml-2 text-gray-500 font-medium">
                    {column.name}
                  </span>
                </div>
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
                  <span className={`text-md ${archivo.variable} font-semibold`}>
                    {column.name}
                  </span>
                  <div
                    className={`cursor-pointer hover:text-accent-foreground rounded-full p-2 transition-colors ${
                      isCreating
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#636AE8] hover:bg-[#5A5FD3]"
                    }`}
                    onClick={
                      !isCreating
                        ? () => handleOpenJobModal(column.id)
                        : undefined
                    }
                  >
                    {isCreating ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus strokeWidth={5} className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(job) => {
                  const jobData = job as Job;
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
                          {jobData && (
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage
                                src={jobData.image as string}
                                className="!rounded-md"
                              />
                              <AvatarFallback>
                                {jobData.name?.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex flex-col gap-1 max-w-30">
                            <p className="mt-1 flex-1 font-medium text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                              {jobData.name}
                            </p>
                            <p className="m-0 text-muted-foreground text-2xs">
                              {jobData.company as string}
                            </p>
                          </div>
                        </div>

                        {/* Dropdown */}
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
                                className="text-gray-500 p-1.5 rounded-md transition-all  hover:text-gray-700 hover:bg-gray-200"
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
                                  console.log("Goint to link " + jobData.link);
                                }}
                              >
                                Go to link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={
                                  isDeleting
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                                }
                                disabled={isDeleting}
                                onSelect={() => {
                                  if (!isDeleting) {
                                    console.log(
                                      "Opening delete modal for job:",
                                      jobData.id
                                    );
                                    handleOpenDeleteModal(jobData);
                                  }
                                }}
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </DropdownMenuItem>
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

      {/* Modals */}
      <CreateJobModal
        isOpen={isJobModalOpen}
        onClose={handleCloseJobModal}
        onSubmit={handleCreateJob}
        targetColumn={targetColumn}
      />
      <CreateListModal
        isOpen={isListModalOpen}
        onClose={handleCloseListModal}
        onSubmit={handleCreateList}
      />

      {/* UPDATED: Show loading state in delete modal */}
      <DeleteJobModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Example;
