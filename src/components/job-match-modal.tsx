"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, ExternalLink, Check } from "lucide-react";
import Image from "next/image";
import { createJob } from "@/app/(protected)/jobs/actions";
import { toast } from "sonner";

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
  selectedFile?: { id: string } | null;
}

export default function JobMatchModal({
  open,
  onOpenChange,
  jobs,
  loading = false,
  selectedFile,
}: JobMatchModalProps) {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [addingJobs, setAddingJobs] = useState<Set<string>>(new Set());
  const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());

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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-400";
    return "text-red-600";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 80) return "#16a34a"; // green-600
    if (score >= 60) return "#f1ab13ff"; // yellow-400
    return "#dc2626"; // red-600
  };

  const handleAddJob = async (job: JobMatch) => {
    setAddingJobs((prev) => new Set(prev).add(job.id));

    try {
      // Extract company domain from the Brandfetch URL or use company name
      const companyDomain = job.companyIconUrl.includes("brandfetch.io")
        ? job.companyIconUrl.split("/")[3]?.split("?")[0]
        : undefined;

      const result = await createJob({
        title: job.title,
        companyName: job.company,
        description: job.description,
        applicationLink: job.url,
        companyDomain: companyDomain,
        resumeId: selectedFile?.id,
        // columnId is optional, will use first column as default
      });

      if (result.success) {
        setAddedJobs((prev) => new Set(prev).add(job.id));
        toast.success(`Added ${job.title} to your jobs!`);
      } else {
        toast.error(result.error || "Failed to add job");
      }
    } catch (error) {
      console.error("Error adding job:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setAddingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(job.id);
        return newSet;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[80vh] p-0 gap-0 flex flex-col min-w-fit rounded-xl"
        showCloseButton={true}
      >
        {/* Fixed Header */}
        <DialogHeader className="px-7 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              Job Match Results
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 hover:bg-muted rounded-full"
            >
              <X className="h-5 w-5" />
            </Button> */}
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Finding matching jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground text-lg">No matching jobs found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try uploading a different resume
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-xl p-6 hover:shadow-md transition-all duration-300 bg-card overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left Section - Job Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => toggleExpanded(job.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        {expandedJobs.has(job.id) ? (
                          <ChevronDown className="h-8 w-8 transition-transform duration-300" />
                        ) : (
                          <ChevronRight className="h-8 w-8 transition-transform duration-300" />
                        )}
                      </button>

                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Company Logo */}
                        <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center border">
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
                          <h3 className="text-xl font-semibold text-foreground mb-1 line-clamp-2">
                            {job.title}
                          </h3>
                          <p className="text-base text-muted-foreground font-medium">
                            {job.company}
                          </p>
                          {job.location && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {job.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Score & Apply */}
                    <div className="flex  items-center gap-4 shrink-0">
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
                            stroke={getScoreStrokeColor(job.matchScore)}
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
                      <div className="flex flex-col gap-2">
                        <Button
                          size="default"
                          variant="outline"
                          className={`text-md ${
                            addedJobs.has(job.id)
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                              : "bg-primary hover:bg-primary-hover hover:text-white text-white"
                          }`}
                          onClick={() => handleAddJob(job)}
                          disabled={
                            addingJobs.has(job.id) || addedJobs.has(job.id)
                          }
                        >
                          {addingJobs.has(job.id) ? (
                            <>
                              <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding...
                            </>
                          ) : addedJobs.has(job.id) ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Added to Prepify
                            </>
                          ) : (
                            "Add Job to Prepify"
                          )}
                        </Button>

                        <Button
                          onClick={() => window.open(job.url, "_blank")}
                          size="default"
                          variant="outline"
                          className="border-border hover:bg-muted/50 text-md"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          view posting
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedJobs.has(job.id)
                        ? "max-h-[1000px] opacity-100 mt-5 pt-5 border-t"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Description */}
                      {job.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">
                            Job Description
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                      )}

                      {/* Matched Keywords */}
                      {job.matchedKeywords.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">
                            Matching Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.matchedKeywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
