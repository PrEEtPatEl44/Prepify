"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import CreateJobModal from "@/components/modals/CreateJobModal";
import { type Column, CreateJob } from "@/types/jobs";
import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";
import { useRef } from "react";
import { LayoutGrid, TableIcon } from "lucide-react";

export type ViewMode = "kanban" | "table";

export default function Header({
  onCreateJob,
  columns,
  setSearchTerm,
  viewMode,
  onViewModeChange,
}: {
  onCreateJob: (job: CreateJob) => Promise<void>;
  columns: Column[];
  setSearchTerm: (term: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}) {
  const { profile } = useUser();
  const debounceRef = useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // simple debounce to avoid too many updates while typing
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      setSearchTerm(val);
    }, 300);
  };

  return (
    <>
      <div className="p-2 flex justify-between items-center bg-white rounded-xl shadow-md gap-2 sm:gap-4">
        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search jobs..."
          className="max-w-2xl max-h-8 bg-[#F3F4F6] !border-none"
          onChange={handleChange}
        />

        <div className="flex items-center gap-4 mr-4">
          {/* View Toggle */}
          {viewMode && onViewModeChange && (
            <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-lg p-1">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("kanban")}
                className="h-7 px-3"
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Kanban
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("table")}
                className="h-7 px-3"
              >
                <TableIcon className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          )}

          {/* Create Application Button */}
          {columns.length > 0 && (
            <CreateJobModal
              onSubmit={onCreateJob}
              targetColumn={columns[0].id}
              isHeader={true}
            />
          )}

          {/* Avatar */}
          <UserDropdown sideForMobile="bottom" sideForDesktop="bottom">
            <Avatar className="h-8 w-8 rounded-full cursor-pointer">
              <AvatarImage src={profile?.avatar} alt={profile?.name} />
              <AvatarFallback className="rounded-full">
                {profile?.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </UserDropdown>
        </div>
      </div>
    </>
  );
}
