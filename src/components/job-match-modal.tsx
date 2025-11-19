"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  companyIconUrl: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  matchedKeywords: string[];
}

interface JobMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: JobMatch[];
  loading?: boolean;
}

export default function JobMatchModal({
  open,
  onOpenChange,
  jobs,
  loading = false,
}: JobMatchModalProps) {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const toggleExpanded = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-[#636AE8]";
    if (score >= 50) return "text-blue-500";
    return "text-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[200vw] max-w-[900px] max-h-[80vh] p-0 gap-0 flex flex-col"
        showCloseButton={false}
      >
        {/* Fixed Header */}
        <DialogHeader className="px-7 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              Job Match Results
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-[#636AE8] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Finding matching jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-600 text-lg">No matching jobs found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try uploading a different resume
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left Section - Job Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleExpanded(job.id)}
                        className="mt-1 h-8 w-8 shrink-0 hover:bg-gray-100"
                      >
                        {expandedJobs.has(job.id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Company Logo */}
                        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
                          <Image
                            src={job.companyIconUrl}
                            alt={job.company}
                            width={56}
                            height={56}
                            className="object-contain p-2"
                            unoptimized
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `<span class="text-sm font-semibold text-gray-600">${job.company
                                  .slice(0, 2)
                                  .toUpperCase()}</span>`;
                              }
                            }}
                          />
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-2">
                            {job.title}
                          </h3>
                          <p className="text-base text-gray-600 font-medium">
                            {job.company}
                          </p>
                          {job.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              {job.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Score & Apply */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                      {/* Circular Progress */}
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#636AE8"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${
                              (job.matchScore / 100) * 251
                            } 251`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`text-2xl font-bold ${getScoreColor(
                              job.matchScore
                            )}`}
                          >
                            {job.matchScore}%
                          </span>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <Button
                        onClick={() => window.open(job.url, "_blank")}
                        className="bg-[#636AE8] hover:bg-[#4e57c1] text-white px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap"
                      >
                        Apply for this Job
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedJobs.has(job.id) && (
                    <div className="mt-5 pt-5 border-t space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Description */}
                      {job.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Job Description
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                      )}

                      {/* Matched Keywords */}
                      {job.matchedKeywords.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Matching Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.matchedKeywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-[#636AE8]/10 text-[#636AE8] rounded-full text-xs font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}