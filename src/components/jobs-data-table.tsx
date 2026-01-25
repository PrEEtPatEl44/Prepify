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
import { ArrowUpDown, Building2, ExternalLink } from "lucide-react";

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
import { Job, Column } from "@/types/jobs";
import { editJob } from "@/app/jobs/actions";
import { toast } from "sonner";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
}

interface JobsDataTableProps {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  columns: Column[];
  searchTerm?: string;
}

export function JobsDataTable({
  jobs,
  setJobs,
  columns,
  searchTerm,
}: JobsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [resumes, setResumes] = React.useState<Document[]>([]);
  const [coverLetters, setCoverLetters] = React.useState<Document[]>([]);

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
            setResumes(resumesData.data);
          }
        }

        if (coverLettersRes.ok) {
          const coverLettersData = await coverLettersRes.json();
          if (coverLettersData.success) {
            setCoverLetters(coverLettersData.data);
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
        job.applicationLink?.toLowerCase().includes(query)
    );
  }, [jobs, searchTerm]);

  // Handle silent update for dropdowns
  const handleFieldUpdate = async (
    jobId: string,
    field: "resumeId" | "coverLetterId" | "columnId",
    value: string | undefined
  ) => {
    try {
      const result = await editJob(jobId, { [field]: value || null });
      if (result.success && result.data) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? result.data! : j))
        );
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
              <span className="font-medium">{companyName}</span>
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
          return <div className="font-medium">{row.getValue("title")}</div>;
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const description = row.original.description;
          return (
            <div
              className="max-w-[200px] truncate text-muted-foreground"
              title={description}
            >
              {description || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "resumeId",
        header: "Resume",
        cell: ({ row }) => {
          const job = row.original;
          return (
            <Select
              value={job.resumeId || "none"}
              onValueChange={(value) =>
                handleFieldUpdate(
                  job.id,
                  "resumeId",
                  value === "none" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select resume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "coverLetterId",
        header: "Cover Letter",
        cell: ({ row }) => {
          const job = row.original;
          return (
            <Select
              value={job.coverLetterId || "none"}
              onValueChange={(value) =>
                handleFieldUpdate(
                  job.id,
                  "coverLetterId",
                  value === "none" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select cover letter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {coverLetters.map((letter) => (
                  <SelectItem key={letter.id} value={letter.id}>
                    {letter.file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "applicationLink",
        header: "Link",
        cell: ({ row }) => {
          const link = row.original.applicationLink;
          return link ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(link, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          ) : (
            <span className="text-muted-foreground">-</span>
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
              <SelectTrigger className="w-[130px]">
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
    ],
    [columns, resumes, coverLetters]
  );

  const table = useReactTable({
    data: filteredJobs,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full p-4">
      <div className="rounded-xl shadow-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-0">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                <TableRow
                  key={row.id}
                  className={`border-0 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#FAFAFB]"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
