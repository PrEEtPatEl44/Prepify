"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listName: string) => void;
}

export default function CreateListModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateListModalProps) {
  const [listName, setListName] = useState("");

  useEffect(() => {
    if (!isOpen) setListName("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create a New List
          </DialogTitle>
        </DialogHeader>
        <div>
          <Label htmlFor="list-name" className="pb-3">
            New List Name
          </Label>
          <Input
            name="list-name"
            id="list-name"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
            className="font-medium"
          />
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <Button variant={"outline"} onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#636AE8] hover:bg-[#4e57c9] focus:ring-2 focus:ring-[#4e57c9] focus:ring-offset-2 text-white"
            onClick={() => {
              if (!listName.trim()) return;
              onSubmit(listName.trim());
            }}
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
