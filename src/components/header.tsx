"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import CreateJobModal from "@/components/modals/CreateJobModal";
import { type Job, type Column } from "@/types/jobs";

export default function Header({
  onCreateJob,
  columns,
}: {
  onCreateJob: (job: Partial<Job>) => Promise<void>;
  columns: Column[];
}) {
  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      await onCreateJob(jobData);
      // Optionally trigger a refresh or callback to parent if needed
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  return (
    <>
      <div className="p-2 flex justify-between items-center bg-white rounded-xl shadow-md gap-2 sm:gap-4">
        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search..."
          className="max-w-2xl max-h-8 bg-[#F3F4F6] !border-none"
        />

        <div className="flex items-center gap-6 mr-4">
          {/* Create Application Button */}
          <CreateJobModal
            onSubmit={handleCreateJob}
            targetColumn={columns[0]?.id} // Default to first column if available
          >
            <Button className="bg-[#636AE8] hover:bg-[#5A5FD3]">
              <Plus />
              <span className="text-sm font-inter hidden sm:inline">
                Create Application
              </span>
              <span className="text-sm font-inter sm:hidden">Create</span>
            </Button>
          </CreateJobModal>

          {/* Avatar */}
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={undefined} alt={"testname"} />
            <AvatarFallback className="rounded-full">CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  );
}
