"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, BookOpen, Mic, ChevronRight } from "lucide-react";
import Calender from "@/components/GithubActivityCalender";
import StatsCard from "@/components/StatsCard";

export default function Home() {
  const actionButtons = [
    {
      icon: <CloudUpload size={40} />,
      title: "Upload Your Resume",
      url: "/upload",
    },
    {
      icon: <Mic size={40} />,
      title: "Simulate an Interview",
      url: "/interview",
    },
    {
      icon: <BookOpen size={40} />,
      title: "Get ATS Score",
      url: "/ats",
    },
  ];
  return (
    <div className="flex flex-col gap-8 mt-10 p-6 w-full">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, Amanda</h1>
        <p className="text-gray-600">
          Get started with your job application journey
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
        {actionButtons.map((button) => (
          <Card
            key={button.title}
            className="shadow-lg transition-all duration-300 py-4 !border-none hover:shadow-xl hover:translate-y-[-2px]"
          >
            <CardContent className="flex justify-between items-center p-4 group">
              <div className="bg-[#CED0F8] text-[#161D96] p-4 rounded-md transition-all duration-300">
                {button.icon}
              </div>
              <span className="w-full text-center sm:text-left font-semibold text-base sm:text-lg lg:text-xl transition-colors duration-300 px-2 group-hover:text-[#161D96]">
                {button.title}
              </span>
              <ChevronRight
                size={40}
                className="text-[#161D96] transition-transform duration-300 group-hover:translate-x-1"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Grid (GitHub-like) */}
      <div>
        <h2 className="text-xl font-bold mb-3">
          Applications Created / Interviews Completed
        </h2>
        <div className="shadow-xl bg-white max-w-fit rounded-md pt-3 px-6">
          <Calender />
        </div>
      </div>

      {/* Progress Overview */}

      <div className="max-w-lg">
        <h2 className="text-xl font-bold mb-3">Progress Overview</h2>
        <StatsCard />
      </div>

      {/* Upcoming Mock Interview */}
      {/* <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="flex items-center gap-3 p-4">
          <Image
            src="/icons/calendar.svg"
            alt="Calendar"
            width={24}
            height={24}
          />
          <p className="text-sm font-medium">
            You have a mock interview scheduled tomorrow at 10 AM
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
