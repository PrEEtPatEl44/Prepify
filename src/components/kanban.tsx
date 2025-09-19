"use client";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis, Plus } from "lucide-react";
import { Archivo } from "next/font/google";
import { type Column, type Job } from "@/app/jobs/jobStore";
import { createJob, deleteJob } from "@/app/jobs/actions";
import CreateJobModal from "@/components/modals/CreateJobModal";
import CreateListModal from "@/components/modals/CreateListModal";
import DeleteJobModal from "@/components/modals/DeleteJobModal";

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

  // state for dropdown menu
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuJobId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Job Modal Handlers
  const handleOpenJobModal = (columnId: string) => {
    setTargetColumn(columnId);
    setIsJobModalOpen(true);
  };
  const handleCloseJobModal = () => setIsJobModalOpen(false);
  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      const newJob = await createJob({ ...jobData, column: targetColumn });
      setJobs((prevJobs) => [...prevJobs, newJob]);
      setIsJobModalOpen(false);
    } catch (error) {
      console.error("Failed to create job:", error);
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
    console.log("Opening delete modal for job:", job.id, job.name); // Enhanced debug log
    console.log("Current isDeleteModalOpen state:", isDeleteModalOpen); // Check current state
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
    setOpenMenuJobId(null); // close dropdown
    console.log("After setState - isDeleteModalOpen should be true"); // Confirm setState called
  };
  const handleCloseDeleteModal = () => {
    console.log("Closing delete modal"); // Debug log
    setSelectedJob(null);
    setIsDeleteModalOpen(false);
  };
  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    console.log("Confirming delete for job:", selectedJob.id); // Debug log
    try {
      await deleteJob(selectedJob.id);
      setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
      setIsDeleteModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      console.error("Delete failed:", err);
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
                    className="bg-[#636AE8] hover:bg-[#5A5FD3] cursor-pointer hover:text-accent-foreground rounded-full p-2"
                    onClick={() => handleOpenJobModal(column.id)}
                  >
                    <Plus strokeWidth={5} className="h-3 w-3 text-white" />
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

                        {/* Dropdown menu trigger */}
                        <div
                          className="relative"
                          ref={
                            openMenuJobId === jobData.id ? menuRef : undefined
                          }
                        >
                          <div
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-full p-2 z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log(
                                "Clicked three dots for job:",
                                jobData.id,
                                "Current open menu:",
                                openMenuJobId
                              ); // Debug log
                              setOpenMenuJobId(
                                openMenuJobId === jobData.id ? null : jobData.id
                              );
                            }}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Ellipsis className="h-4 w-4" />
                          </div>

                          {/* Dropdown menu */}
                          {openMenuJobId === jobData.id && (
                            <div
                              className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-[100] py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(
                                    "Go to link clicked for job:",
                                    jobData.id,
                                    jobData.name
                                  );
                                  console.log("Job data:", jobData); // Log full job data
                                  const url =
                                    (jobData.link as string) ||
                                    (jobData.url as string) ||
                                    (jobData.jobLink as string);
                                  console.log("Found URL:", url); // Log the URL
                                  if (url && url.trim()) {
                                    console.log("Opening URL:", url);
                                    window.open(url, "_blank");
                                  } else {
                                    console.log(
                                      "No URL available for this job - checking all possible fields"
                                    );
                                    console.log("jobData.link:", jobData.link);
                                    console.log("jobData.url:", jobData.url);
                                    alert(
                                      "No URL available for this job application"
                                    );
                                  }
                                  setOpenMenuJobId(null);
                                }}
                              >
                                Go to link
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(
                                    "Delete clicked for job:",
                                    jobData.id,
                                    jobData.name
                                  );
                                  console.log(
                                    "About to call handleOpenDeleteModal with:",
                                    jobData
                                  );
                                  handleOpenDeleteModal(jobData);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
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

      {/* Use your DeleteJobModal component */}
      <DeleteJobModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default Example;
