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
  showingReview?: boolean;
  activeTab?: "jobs" | "interviews";
  onTabChange?: (tab: "jobs" | "interviews") => void;
}

export default function InterviewHeader({
  searchQuery,
  onSearchChange,
  isInterviewActive = false,
  interviewDuration = "00:00",
  showingReview = false,
  activeTab = "jobs",
  onTabChange,
}: InterviewHeaderProps) {
  const { profile } = useUser();

  // Interview mode header
  if (isInterviewActive) {
    return (
      <div className="flex min-h-4 items-center justify-center">
        <div className="p-2 flex justify-between items-center mt-4 min-w-2xl bg-card rounded-xl shadow-md gap-2 sm:gap-4">
          <div className="flex mr-8">
            <h2 className="px-2 !m-0 font-semibold text-foreground text-lg">
              {showingReview ? "Review" : "Questions"}
            </h2>
          </div>
          {/* Timer or Export PDF */}
          {!showingReview ? (
            <div className="flex items-center gap-2 px-3 rounded-md">
              <Timer className="w-5 h-5 text-muted-foreground/70" />
              <span className="text-[20px] text-primary">
                {interviewDuration}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary hover:bg-primary-hover cursor-pointer transition-colors">
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
      <div className="p-2 flex justify-between items-center bg-card rounded-xl shadow-md gap-2 sm:gap-4">
        {/* Search Box */}
        <Input
          type="text"
          placeholder="Search by company..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="max-w-2xl max-h-8 bg-muted !border-none"
        />

        <div className="flex items-center gap-6 mr-4">
          {/* Tabs */}
          <div className="flex mr-8">
            <div
              className={`px-2 !m-0 font-semibold mr-4 cursor-pointer transition duration-200 ${
                activeTab === "jobs"
                  ? "text-primary underline underline-offset-[95%] decoration-primary decoration-3"
                  : "text-muted-foreground hover:text-muted-foreground/70"
              }`}
              onClick={() => onTabChange?.("jobs")}
            >
              Jobs
            </div>
            <div
              className={`px-2 !m-0 font-semibold mr-4 cursor-pointer transition duration-200 ${
                activeTab === "interviews"
                  ? "text-primary underline underline-offset-[95%] decoration-primary decoration-3"
                  : "text-muted-foreground hover:text-muted-foreground/70"
              }`}
              onClick={() => onTabChange?.("interviews")}
            >
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
