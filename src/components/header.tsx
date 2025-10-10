"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import CreateJobModal from "@/components/modals/CreateJobModal";
import { type Column, CreateJob } from "@/types/jobs";
import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";

export default function Header({
  onCreateJob,
  columns,
}: {
  onCreateJob: (job: CreateJob) => Promise<void>;
  columns: Column[];
}) {
  const { profile } = useUser();

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
