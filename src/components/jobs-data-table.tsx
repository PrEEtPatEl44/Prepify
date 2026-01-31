"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Building2,
  ExternalLink,
  Eye,
  FileText,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Job, Column } from "@/types/jobs";
import { editJob } from "@/app/(protected)/jobs/actions";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";

import { type DocumentBasicInfo } from "@/types/docs";

interface JobsDataTableProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  columns: Column[];
  searchTerm?: string;
  onViewFile?: (job: Job, file?: DocumentBasicInfo) => void;
}

export function JobsDataTable({
  jobs,
  setJobs,
  columns,
  searchTerm,
  onViewFile,
}: JobsDataTableProps) {
  const sidebar = useSidebar();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [resumes, setResumes] = React.useState<DocumentBasicInfo[]>([]);
  const [coverLetters, setCoverLetters] = React.useState<DocumentBasicInfo[]>(
    [],
  );
  const { setOpen } = sidebar;
  // Fetch resumes and cover letters on mount
  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [resumesRes, coverLettersRes] = await Promise.all([
          fetch("/api/docs?type=resumes"),
          fetch("/api/docs?type=coverLetters"),
        ]);

        if (resumesRes.ok) {
          const resumesData = await resumesRes.json();
          if (resumesData.success) {
            const resumeWithType = resumesData.data.map(
              (r: DocumentBasicInfo) => ({
                ...r,
                documentType: "resumes" as const,
              }),
            );
            setResumes(resumeWithType);
          }
        }

        if (coverLettersRes.ok) {
          const coverLettersData = await coverLettersRes.json();
          if (coverLettersData.success) {
            const coverLettersWithType = coverLettersData.data.map(
              (c: DocumentBasicInfo) => ({
                ...c,
                documentType: "coverLetters" as const,
              }),
            );
            setCoverLetters(coverLettersWithType);
          }
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  // Filter jobs based on search term
  const filteredJobs = React.useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return jobs;
    const query = searchTerm.toLowerCase().trim();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.companyName.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.applicationLink?.toLowerCase().includes(query),
    );
  }, [jobs, searchTerm]);

  // Handle silent update for dropdowns
  const handleFieldUpdate = async (
    jobId: string,
    field: "resumeId" | "coverLetterId" | "columnId",
    value: string | undefined,
  ) => {
    try {
      const result = await editJob(jobId, { [field]: value || null });
      if (result.success && result.data) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? result.data! : j)));
        toast.success("Updated successfully");
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update");
    }
  };

  const tableColumns: ColumnDef<Job>[] = React.useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Company
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const companyName = row.getValue("companyName") as string;
          const companyIconUrl = row.original.companyIconUrl;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={companyIconUrl} alt={companyName} />
                <AvatarFallback>
                  <Building2 className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate max-w-[120px]">
                {companyName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Job Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium truncate max-w-[150px]">
              {row.getValue("title")}
            </div>
          );
        },
      },
      {
        accessorKey: "columnId",
        header: "Status",
        cell: ({ row }) => {
          const job = row.original;
          const currentColumn = columns.find((c) => c.id === job.columnId);
          return (
            <Select
              value={job.columnId}
              onValueChange={(value) =>
                handleFieldUpdate(job.id, "columnId", value)
              }
            >
              <SelectTrigger className="w-[80%]">
                <SelectValue>
                  {currentColumn?.name || "Select status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const job = row.original;
          const resume = resumes.find((r) => r.id === job.resumeId);
          const coverLetter = coverLetters.find(
            (cl) => cl.id === job.coverLetterId,
          );

          return (
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!job.description}
                      onClick={() => {
                        if (job.description && onViewFile) {
                          setOpen(false);
                          onViewFile(job);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Description</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!job.applicationLink}
                      onClick={() =>
                        job.applicationLink &&
                        window.open(job.applicationLink, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open Link</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!resume}
                      onClick={() => {
                        if (resume && onViewFile) {
                          onViewFile(job, resume);
                        }
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {resume ? `View Resume: ${resume.file_name}` : "No Resume"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!coverLetter}
                      onClick={() => {
                        if (coverLetter && onViewFile) {
                          onViewFile(job, coverLetter);
                        }
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {coverLetter
                      ? `View Cover Letter: ${coverLetter.file_name}`
                      : "No Cover Letter"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          );
        },
      },
    ],
    [columns, resumes, coverLetters],
  );

  const table = useReactTable({
    data: filteredJobs,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col h-full pt-6 w-full pr-3 pb-2">
      <ScrollArea className="flex-1 min-h-0 rounded-xl shadow-xl bg-card px-2">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card border-b shadow-[0_1px_0_0_var(--color-border)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow key={row.id} className={`border-0 bg-card`}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No job applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4 shrink-0">
        <div className="flex-1 text-sm text-muted-foreground">
          {filteredJobs.length} job application(s) total.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
