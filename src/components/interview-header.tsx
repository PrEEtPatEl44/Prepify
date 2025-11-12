"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Timer, FileDown } from "lucide-react";

import UserDropdown from "@/components/user-dropdown";
import { useUser } from "@/hooks/useUser";

interface InterviewHeaderProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  isInterviewActive?: boolean;
  interviewDuration?: string;
  activeTab?: "questions" | "review";
  onTabChange?: (tab: "questions" | "review") => void;
  isInterviewCompleted?: boolean;
}

export default function InterviewHeader({
  searchQuery,
  onSearchChange,
  isInterviewActive = false,
  interviewDuration = "00:00",
  activeTab = "questions",
  onTabChange,
  isInterviewCompleted = false,
}: InterviewHeaderProps) {
  const { profile } = useUser();

  // Interview mode header
  if (isInterviewActive) {
    return (
      <div className="flex min-h-4 items-center justify-center">
        <div className="p-2 flex justify-between items-center mt-4 min-w-2xl bg-white rounded-xl shadow-md gap-2 sm:gap-4">
          <div className="flex mr-8">
            <div
              className={`px-2 !m-0 font-semibold mr-4 transition duration-200 ${
                activeTab === "questions"
                  ? "text-[#636AE8] underline underline-offset-[95%] decoration-[#636AE8] decoration-3"
                  : isInterviewCompleted
                  ? "text-muted-foreground hover:text-gray-400 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => {
                if (isInterviewCompleted) {
                  onTabChange?.("questions");
                }
              }}
            >
              Questions
            </div>
            <div
              className={`px-2 !m-0 font-semibold mr-4 transition duration-200 ${
                activeTab === "review"
                  ? "text-[#636AE8] underline underline-offset-[95%] decoration-[#636AE8] decoration-3"
                  : isInterviewCompleted
                  ? "text-muted-foreground hover:text-gray-400 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => {
                if (isInterviewCompleted) {
                  onTabChange?.("review");
                }
              }}
            >
              Review
            </div>
          </div>
          {/* Timer or Export PDF */}
          {activeTab === "questions" ? (
            <div className="flex items-center gap-2 px-3 rounded-md">
              <Timer className="w-5 h-5 text-gray-400" />
              <span className="text-[20px] text-[#636ae8]">
                {interviewDuration}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#636ae8] hover:bg-[#5058c9] cursor-pointer transition-colors">
              <FileDown className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default mode header (job selection)
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
