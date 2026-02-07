"use client";

import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Job } from "@/types/jobs";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface DeleteJobModalProps {
  onConfirm: (job: Job) => void;
  job: Job;
  trigger?: React.ReactNode;
}

export default function DeleteJobModal({
  onConfirm,
  job,
  trigger,
}: DeleteJobModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <DropdownMenuItem
            className={
              isDeleting
                ? "text-muted-foreground/70 cursor-not-allowed"
                : "text-red-600 hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
            }
            disabled={isDeleting}
            onSelect={(e) => {
              // Prevent the dropdown from closing
              e.preventDefault();
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        )}
      </DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader>
          <DialogTitle>
            <span className="px-4">Delete Job Application </span>
          </DialogTitle>
        </DialogHeader>
        <Separator className="bg-border" />
        <DialogDescription className="px-4">
          Are you sure you want to delete this Application with job title{" "}
          {job.title}? This cannot be undone.
        </DialogDescription>
        <DialogFooter className="px-4">
          <DialogClose className="border-border border px-3 rounded-md hover:bg-muted ">
            Cancel
          </DialogClose>
          <Button
            onClick={async () => {
              setIsDeleting(true);
              try {
                await onConfirm(job);
              } catch (error) {
                console.error("Failed to delete job:", error);
                alert(
                  `Failed to delete job: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`
                );
              } finally {
                setIsOpen(false);
                setIsDeleting(false);
              }
            }}
            className="bg-red-600 hover:bg-red-700 focus:bg-red-700"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
