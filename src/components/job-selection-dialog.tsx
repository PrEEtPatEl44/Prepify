"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Building2, ExternalLink, CheckCircle2 } from "lucide-react";
import { Job } from "@/types/jobs";

interface JobSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onCancel?: () => void;
}

export default function JobSelectionDialog({
  open,
  onOpenChange,
  jobs,
  onSelectJob,
  onCancel,
}: JobSelectionDialogProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleSelectJob = (job: Job) => {
    setSelectedJobId(job.id);
  };

  const handleConfirm = () => {
    const selectedJob = jobs.find((job) => job.id === selectedJobId);
    if (selectedJob) {
      onSelectJob(selectedJob);
    }
  };

  const handleCancel = () => {
    setSelectedJobId(null);
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#636AE8]" />
            Select Job for Analysis
          </DialogTitle>
          <DialogDescription>
            Multiple jobs found for this resume. Please select one job to
            analyze against.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;

              return (
                <Card
                  key={job.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-[#636AE8] border-2 bg-[#636AE8]/5"
                      : "border-gray-200 hover:border-[#636AE8]/50 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelectJob(job)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {job.companyIconUrl ? (
                            <Image
                              src={job.companyIconUrl}
                              alt={job.companyName}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#636AE8]/10 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-[#636AE8]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {job.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.companyName}
                            </p>
                            {job.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {job.description}
                              </p>
                            )}
                            {job.applicationLink && (
                              <a
                                href={job.applicationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#636AE8] hover:underline mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Job Posting
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-6 w-6 text-[#636AE8] flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedJobId
              ? "Click 'Analyze' to proceed"
              : "Select a job to continue"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedJobId}
              className="bg-[#636AE8] hover:bg-[#4f56d4]"
            >
              Analyze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
