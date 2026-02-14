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
import { useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

interface DeleteColumnModalProps {
  onConfirm: () => void;
  columnName: string;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export default function DeleteColumnModal({
  onConfirm,
  columnName,
  trigger,
  children,
}: DeleteColumnModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <button
            className={`p-1 rounded-md transition-all duration-200 hover:bg-destructive/10 text-muted-foreground hover:text-destructive ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isDeleting}
          >
            Delete
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader>
          <DialogTitle>
            <span className="px-4">Delete Column </span>
          </DialogTitle>
        </DialogHeader>
        <Separator className="bg-border" />
        <DialogDescription className="px-4">
          Are you sure you want to delete the column &quot;{columnName}&quot;? All jobs in
          this column will also be deleted. This cannot be undone.
        </DialogDescription>
        <DialogFooter className="px-4">
          <DialogClose className="border-border border px-3 rounded-md hover:bg-muted ">
            Cancel
          </DialogClose>
          <Button
            onClick={async () => {
              setIsDeleting(true);
              try {
                await onConfirm();
              } catch (error) {
                console.error("Failed to delete column:", error);
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
