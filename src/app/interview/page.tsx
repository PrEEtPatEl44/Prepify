"use client";

import React, { useState } from "react";
import InterviewHeader from "@/components/interview-header";
import Questions from "@/components/questions";
import { Video } from "lucide-react";

const Page = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  return (
    <div className="h-screen flex flex-1 flex-col overflow-hidden">
      <div className="mt-6 px-1 max-w-[95%]">
        <InterviewHeader onStartInterview={() => setIsInterviewActive(true)} />
      </div>
      <div className="flex-1 overflow-hidden">
        {isInterviewActive ? (
          <div className="h-full flex items-center justify-center overflow-auto p-6 space-y-4">
            <Questions />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <Video className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Interviews Yet
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              You haven&apos;t completed any interviews yet. Start practicing to
              improve your skills and track your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
