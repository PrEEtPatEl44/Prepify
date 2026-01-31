"use client";

import { useState } from "react";
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
import { Building2, ExternalLink, CheckCircle2 } from "lucide-react";
import { Job } from "@/types/jobs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
      <DialogContent className="max-w-3xl max-h-[80vh] p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Select Job for Analysis
            </DialogTitle>
            <DialogDescription>
              Multiple jobs found for this resume. Please select one job to
              analyze against.
            </DialogDescription>
          </DialogHeader>
        </div>
        <Separator />
        <ScrollArea className="h-[400px] px-6 pr-4">
          <div className="space-y-3">
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.id;

              return (
                <Card
                  key={job.id}
                  className={`cursor-pointer transition-all duration-200 !py-0 ${
                    isSelected
                      ? "border-primary border-2 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onClick={() => handleSelectJob(job)}
                >
                  <CardContent className="p-4 ">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {job.companyIconUrl ? (
                            <Avatar className="w-16 h-16 flex-shrink-0">
                              <AvatarImage
                                src={job.companyIconUrl}
                                alt={job.companyName}
                                className="rounded-lg object-cover border border-black/5"
                              />
                            </Avatar>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-md mb-1">
                              {job.title}
                            </span>
                            <p className="text-sm text-muted-foreground mb-2">
                              {job.companyName}
                            </p>
                            {job.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {job.description}
                              </p>
                            )}
                            {job.applicationLink && (
                              <a
                                href={job.applicationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
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
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 px-6 pb-6 border-t">
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
              className="bg-primary hover:bg-primary-hover"
            >
              Analyze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
