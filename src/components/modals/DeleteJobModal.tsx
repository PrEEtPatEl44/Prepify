"use client";

import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface DeleteJobModalProps {
  children: React.ReactNode;
  onConfirm: () => void;
}

export default function DeleteJobModal({
  children,
  onConfirm,
}: DeleteJobModalProps) {
  console.log("delet cofirm" + children);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="px-0">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="px-4">Delete Job Application </span>
            <Separator className="bg-gray-300" />
          </AlertDialogTitle>
          <AlertDialogDescription className="px-4">
            Are you sure you want to delete this Application? This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-4">
          <AlertDialogCancel className="border-gray-200 border hover:bg-gray-300 ">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:bg-red-700"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
