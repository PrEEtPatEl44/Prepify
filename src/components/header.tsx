"use client";

import { useState } from "react";
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
  onCreateJob: (job: Partial<Job>, column: string) => Promise<void>;
  columns: Column[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("Header columns:", columns);
  const [targetColumn, setTargetColumn] = useState(columns[0]?.id);

  const handleOpenModal = () => {
    if (columns.length <= 0) {
      console.error("No columns available to assign the job.");
      alert("Please create a column before adding a job.");
      return;
    }

    setTargetColumn(columns[0]?.id); // default col umn
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      await onCreateJob(jobData, targetColumn);
      setIsModalOpen(false);
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
          <Button
            className="bg-[#636AE8] hover:bg-[#5A5FD3]"
            onClick={handleOpenModal}
          >
            <Plus />
            <span className="text-sm font-inter hidden sm:inline">
              Create Application
            </span>
            <span className="text-sm font-inter sm:hidden">Create</span>
          </Button>

          {/* Avatar */}
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={undefined} alt={"testname"} />
            <AvatarFallback className="rounded-full">CN</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateJob}
        targetColumn={targetColumn}
      />
    </>
  );
}
