"use client";

import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Ellipsis, Eye, ExternalLink, FileText, GripVertical, Loader2, Mail, Pencil, Sparkles, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateJob, type Column, type Job } from "@/types/jobs";
import { type DocumentBasicInfo } from "@/types/docs";
import CreateJobModal from "@/components/modals/CreateJobModal";
import CreateListModal from "@/components/modals/CreateListModal";
import DeleteJobModal from "@/components/modals/DeleteJobModal";
import DeleteColumnModal from "./modals/DeleteColumnModal";
import { deleteJob, moveJob, createColumn, updateColumn, deleteColumn, generateResumeFromProfile } from "@/app/(protected)/jobs/actions";
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
import SearchResultsDock from "./search-results-dock";

const Kanban = ({
  jobs,
  setJobs,
  columns,
  setColumns,
  handleCreateJob,
  searchTerm,
  onViewFile,
}: {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  handleCreateJob: (jobData: CreateJob) => Promise<void>;
  searchTerm?: string;
  onViewFile?: (job: Job, file?: DocumentBasicInfo) => void;
}) => {
  const router = useRouter();

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

  // Handle column reordering
  const handleColumnsChange = (updatedColumns: Column[]) => {
    console.log("Columns reordered:", updatedColumns);
    // Filter out the "create-new-list" pseudo-column if it exists
    const realColumns = updatedColumns.filter(
      (col) => col.id !== "create-new-list"
    );
    setColumns(realColumns);
    // TODO: Call backend API to persist column order
  };

  const [pickedItem, setPickedItem] = useState<JobKanbanItem | null>();
  const [prevJobs, setPrevJobs] = useState<Job[] | null>(null);
  const [resumes, setResumes] = useState<DocumentBasicInfo[]>([]);
  const [coverLetters, setCoverLetters] = useState<DocumentBasicInfo[]>([]);
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState("");
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  const handleUpdateColumnName = async (columnId: string) => {
    if (!editingColumnName.trim()) {
      setEditingColumnId(null);
      setEditingColumnName("");
      return;
    }

    try {
      const result = await updateColumn(columnId, editingColumnName.trim());
      if (result.success) {
        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId ? { ...col, name: editingColumnName.trim() } : col
          )
        );
        toast.success("Column name updated");
      } else {
        toast.error(result.error || "Failed to update column name");
      }
    } catch {
      toast.error("Failed to update column name");
    } finally {
      setEditingColumnId(null);
      setEditingColumnName("");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      const result = await deleteColumn(columnId);
      if (result.success) {
        setColumns((prev) => prev.filter((col) => col.id !== columnId));
        toast.success("Column deleted");
      } else {
        toast.error(result.error || "Failed to delete column");
      }
    } catch {
      toast.error("Failed to delete column");
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [resumesRes, coverLettersRes] = await Promise.all([
          fetch("/api/docs?type=resumes"),
          fetch("/api/docs?type=coverLetters"),
        ]);

        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          if (resumesData.success) {
            setResumes(
              resumesData.data.map((r: DocumentBasicInfo) => ({
                ...r,
                documentType: "resumes" as const,
              }))
            );
          }
        }

        if (coverLettersRes.ok) {
          const coverLettersData = await coverLettersRes.json();
          if (coverLettersData.success) {
            setCoverLetters(
              coverLettersData.data.map((c: DocumentBasicInfo) => ({
                ...c,
                documentType: "coverLetters" as const,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return jobs;
    const query = searchTerm.toLowerCase().trim();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.applicationLink?.toLowerCase().includes(query)
    );
  }, [jobs, searchTerm]);

  const handleCreateList = async (listName: string, color?: string) => {
    if (!listName) return;
    const newColumn: Column = await createColumn(listName, color).then((res) => {
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
  const kanbanItems = filteredJobs.map(transformJobsToKanbanItem);
  const kanbanColumns = allColumns;
  return (
    <>
      <SearchResultsDock
        searchTerm={searchTerm || ""}
        filteredCount={filteredJobs.length}
        totalCount={jobs.length}
        itemType="job"
      />
      <KanbanProvider
        columns={kanbanColumns}
        data={kanbanItems}
        onDataChange={handleKanbanDataChange}
        onColumnsChange={handleColumnsChange}
        onDragStart={(e) => handleDragStart(e)}
        onDragEnd={(e) => handleDragEnd(e)}
      >
        {(column) =>
          column.id === "create-new-list" ? (
            <div
              key={column.id}
              className="flex h-[100%] max-h-[100vh] flex-col divide-y overflow-hidden !rounded-t-xl border bg-muted text-xs shadow-lg p-2"
            >
              <div className="m-0 p-2 font-semibold text-sm border-0">
                <CreateListModal onSubmit={handleCreateList} />
              </div>
            </div>
          ) : (
            <KanbanBoard
              id={column.id}
              key={column.id}
              className="bg-card p-2 shadow-lg"
            >
              <KanbanHeader className="border-0">
                <div className="flex justify-between items-center gap-2">
                  {editingColumnId === column.id ? (
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-muted-foreground/70 text-xs">
                        <GripVertical size={16} />
                      </span>
                      <input
                        type="text"
                        value={editingColumnName}
                        onChange={(e) => setEditingColumnName(e.target.value)}
                        className="text-sm font-archivo font-semibold bg-transparent border-b border-primary focus:outline-none w-full px-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateColumnName(column.id);
                          } else if (e.key === "Escape") {
                            setEditingColumnId(null);
                            setEditingColumnName("");
                          }
                        }}
                      />
                      <button
                        onClick={() => handleUpdateColumnName(column.id)}
                        className="p-1 rounded-md hover:bg-primary/10 text-primary transition-colors"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="group flex items-center gap-2 flex-1"
                      onMouseEnter={() => setHoveredColumnId(column.id)}
                      onMouseLeave={() => setHoveredColumnId(null)}
                    >
                      <span className="text-muted-foreground/70 text-xs">
                        <GripVertical size={16} />
                      </span>
                      <span className="text-md font-archivo font-semibold">
                        {column.name}
                      </span>
                      <button
                        onClick={() => {
                          setEditingColumnId(column.id);
                          setEditingColumnName(column.name);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground ${
                          hoveredColumnId === column.id ? "opacity-100" : ""
                        }`}
                      >
                        <Pencil size={14} />
                      </button>
                      <DeleteColumnModal
                        columnName={column.name}
                        onConfirm={() => handleDeleteColumn(column.id)}
                      >
                        <button
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all duration-200 hover:bg-destructive/10 text-muted-foreground hover:text-destructive ${
                            hoveredColumnId === column.id ? "opacity-100" : ""
                          }`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </DeleteColumnModal>
                    </div>
                  )}

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
                      className="bg-muted border-0"
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
                                className="text-muted-foreground p-1.5 rounded-md transition-all hover:text-foreground/80 hover:bg-muted"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Ellipsis className="h-4 w-4" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48"
                              side="bottom"
                              sideOffset={4}
                              onCloseAutoFocus={(e) => e.preventDefault()}
                            >
                              {(() => {
                                const originalJob = jobs.find(
                                  (j) => j.id === jobData.id
                                );
                                const resume = resumes.find(
                                  (r) => r.id === originalJob?.resumeId
                                );
                                const coverLetter = coverLetters.find(
                                  (cl) => cl.id === originalJob?.coverLetterId
                                );
                                return (
                                  <>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={!originalJob?.description}
                                      onSelect={() => {
                                        if (originalJob && onViewFile) {
                                          onViewFile(originalJob);
                                        }
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Description
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={!resume}
                                      onSelect={() => {
                                        if (
                                          originalJob &&
                                          resume &&
                                          onViewFile
                                        ) {
                                          onViewFile(originalJob, resume);
                                        }
                                      }}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Resume
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={!coverLetter}
                                      onSelect={() => {
                                        if (
                                          originalJob &&
                                          coverLetter &&
                                          onViewFile
                                        ) {
                                          onViewFile(originalJob, coverLetter);
                                        }
                                      }}
                                    >
                                      <Mail className="h-4 w-4 mr-2" />
                                      View Cover Letter
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      disabled={generatingJobId === jobData.id}
                                      onSelect={async (e) => {
                                        e.preventDefault()
                                        if (!originalJob) return
                                        setGeneratingJobId(originalJob.id)
                                        try {
                                          const result = await generateResumeFromProfile(originalJob.id)
                                          if (result.success && result.data) {
                                            const { resumeId, fileName, filePath } = result.data
                                            setResumes((prev) => [
                                              ...prev,
                                              { id: resumeId, file_name: fileName, file_path: filePath, documentType: "resumes" as const },
                                            ])
                                            setJobs((prev) =>
                                              prev.map((j) =>
                                                j.id === originalJob.id
                                                  ? { ...j, resumeId }
                                                  : j
                                              )
                                            )
                                            router.push(`/jobs/${originalJob.id}/resume`)
                                          } else {
                                            toast.error(result.error || "Failed to generate resume")
                                          }
                                        } catch {
                                          toast.error("Failed to generate resume")
                                        } finally {
                                          setGeneratingJobId(null)
                                        }
                                      }}
                                    >
                                      {generatingJobId === jobData.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                      )}
                                      Generate Resume
                                    </DropdownMenuItem>
                                  </>
                                );
                              })()}
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => {
                                  window.open(
                                    jobData.applicationLink,
                                    "_blank"
                                  );
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Posting
                              </DropdownMenuItem>
                              <DeleteJobModal
                                onConfirm={() => {
                                  handleConfirmDelete(
                                    transformKanbanItemsToJobs(jobData) as Job
                                  );
                                }}
                                job={transformKanbanItemsToJobs(jobData) as Job}
                                trigger={
                                  <DropdownMenuItem
                                    className="cursor-pointer text-red-600 hover:bg-destructive/10 focus:bg-destructive/10"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                }
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
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
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
