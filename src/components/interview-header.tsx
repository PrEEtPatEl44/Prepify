"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";

import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";
import { Sparkle } from "lucide-react";
import { Button } from "./ui/button";

interface InterviewHeaderProps {
  onStartInterview?: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export default function InterviewHeader({
  onStartInterview,
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
          <div className="flex ">
            <Button
              onClick={onStartInterview}
              className="bg-[#F2F2FD] text-[#636AE8] cursor-pointer hover:bg-[#E9E9FF] hover:text-[#4B4FD6] hover:shadow-md"
            >
              <Sparkle className="mr-2" />
              Start an AI Interview
            </Button>
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
