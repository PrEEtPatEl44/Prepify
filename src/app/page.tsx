"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudUpload, BookOpen, Mic, ChevronRight } from "lucide-react";
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
    <div className="flex flex-col gap-6 p-6 w-full">
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
          <Card key={button.title} className="hover:shadow-lg transition py-4">
            <CardContent className="flex justify-between items-center p-4">
              <div className="bg-[#CED0F8] text-[#161D96] p-4 rounded-md ">
                {button.icon}
              </div>
              <span className="w-full text-center sm:text-left font-semibold text-base sm:text-lg lg:text-xl group-hover:text-[#161D96] duration-300 px-2">
                {button.title}
              </span>
              <ChevronRight size={40} className="text-[#161D96] " />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Grid (GitHub-like) */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Applications Created / Interviews Completed
        </h2>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around items-center">
          {/* Resume Score */}
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="32"
                  cx="40"
                  cy="40"
                />
                <circle
                  className="text-blue-600"
                  strokeWidth="8"
                  strokeDasharray="201"
                  strokeDashoffset="40"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="32"
                  cx="40"
                  cy="40"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                80%
              </span>
            </div>
            <p className="mt-2 text-sm">Resume Score</p>
          </div>

          {/* Interviews Completed */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">3</span>
            <p className="text-sm">Interviews Completed</p>
          </div>

          {/* Total Applications */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">78</span>
            <p className="text-sm">Total Applications</p>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Mock Interview */}
      <Card className="bg-indigo-50 border-indigo-200">
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
      </Card>
    </div>
  );
}
