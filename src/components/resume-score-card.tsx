import React from "react";
import { cn } from "@/lib/utils";

interface ResumeScoreCardProps {
  score?: number; // 0-100
  className?: string;
}

export default function ResumeScoreCard({
  score = 45,
  className,
}: ResumeScoreCardProps) {
  // Calculate position for the "Your Resume" marker (as percentage)
  const yourResumePosition = (score / 100) * 100;

  // Top resumes are typically around 80%
  const topResumesPosition = 80;

  return (
    <div
      className={cn(
        "relative bg-card border border-border rounded-[10px] p-6",
        className
      )}
    >
      {/* Text Content */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Your resume scored {score} out of 100.
        </h3>
        <p className="text-base text-foreground leading-relaxed">
          This is a decent start, but there&apos;s clear room for improvement on
          your resume. It scored low on some key criteria hiring managers and
          resume screening software look for, but they can be easily improved.
          Let&apos;s dive into what we checked your resume for, and how you can
          improve your score by 30+ points.
        </p>
      </div>

      {/* Slider Section */}
      <div className="relative h-[54px]">
        {/* Background bar */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-primary-light rounded-full" />

        {/* Gradient bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-full h-3.5 rounded-full"
          style={{
            background: "linear-gradient(to right, #d6631b 0%, #1dd75b 77%)",
          }}
        />

        {/* Your Resume Marker */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${yourResumePosition}%` }}
        >
          {/* Tooltip */}
          <div className="relative mb-2">
            <div className="bg-[rgba(29,33,40,0.9)] text-white text-xs px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
              Your Resume
            </div>
            {/* Arrow pointing down */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid rgba(29,33,40,0.9)",
              }}
            />
          </div>
          {/* Vertical line */}
          <div className="w-0.5 h-6 bg-[rgba(29,33,40,0.5)]" />
        </div>

        {/* Top Resumes Marker */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${topResumesPosition}%` }}
        >
          {/* Tooltip */}
          <div className="relative mb-2">
            <div className="bg-[rgba(29,33,40,0.9)] text-white text-xs px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
              Top Resumes
            </div>
            {/* Arrow pointing down */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
              style={{
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid rgba(29,33,40,0.9)",
              }}
            />
          </div>
          {/* Vertical line */}
          <div className="w-0.5 h-6 bg-[rgba(29,33,40,0.5)]" />
        </div>
      </div>
    </div>
  );
}
