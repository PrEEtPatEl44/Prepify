"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";

import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";

interface InterviewHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export default function InterviewHeader({
  searchQuery,
  onSearchChange,
}: InterviewHeaderProps) {
  const { profile } = useUser();

  return (
    <>
      <div className="p-2 flex justify-between items-center bg-white rounded-xl shadow-md gap-2 sm:gap-4">
        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search by company..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="max-w-2xl max-h-8 bg-[#F3F4F6] !border-none"
        />

        <div className="flex items-center gap-6 mr-4">
          {/* Start interview button*/}
          <div className="flex mr-8">
            <div className="px-2 !m-0 font-semibold mr-4 cursor-pointer transition duration-200 text-[#636AE8] underline underline-offset-[95%] decoration-[#636AE8] decoration-3">
              Jobs
            </div>
            <div className="px-2 !m-0 font-semibold mr-4 cursor-pointer transition duration-200 text-muted-foreground hover:text-gray-400">
              Interviews
            </div>
          </div>
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
