"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import CreateJobModal from "@/components/modals/CreateJobModal";
import { type Column, CreateJob } from "@/types/jobs";
import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";
import { useRef } from "react";

export default function Header({
  onCreateJob,
  columns,
  setSearchTerm,
}: {
  onCreateJob: (job: CreateJob) => Promise<void>;
  columns: Column[];
  setSearchTerm: (term: string) => void;
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
      <div className="p-2 flex justify-between items-center bg-card rounded-xl shadow-md gap-2 sm:gap-4">
        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search jobs..."
          className="max-w-2xl max-h-8 bg-muted !border-none"
          onChange={handleChange}
        />

        <div className="flex items-center gap-6 mr-4">
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
