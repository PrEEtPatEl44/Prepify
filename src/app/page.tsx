"use client";

import Image from "next/image";
import { AppSidebar } from "@/components/app-sidebar"; // sidebar you already have
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <SidebarInset className="flex flex-col p-6 gap-6 bg-gray-50 min-h-screen">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, Amanda</h1>
          <p className="text-gray-600">
            Get started with your job application journey
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Image src="/icons/upload.svg" alt="Upload" width={40} height={40} />
              <p className="font-semibold mt-3">Upload Your Resume</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Image src="/icons/mic.svg" alt="Interview" width={40} height={40} />
              <p className="font-semibold mt-3">Simulate an Interview</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Image src="/icons/ats.svg" alt="ATS" width={40} height={40} />
              <p className="font-semibold mt-3">Get ATS Score</p>
            </CardContent>
          </Card>
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
            <Image src="/icons/calendar.svg" alt="Calendar" width={24} height={24} />
            <p className="text-sm font-medium">
              You have a mock interview scheduled tomorrow at 10 AM
            </p>
          </CardContent>
        </Card>
      </SidebarInset>
    </SidebarProvider>
  );
}
