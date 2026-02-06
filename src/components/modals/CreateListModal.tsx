"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
];

interface CreateListModalProps {
  onSubmit: (listName: string, color?: string) => void;
}

export default function CreateListModal({ onSubmit }: CreateListModalProps) {
  const [listName, setListName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    undefined
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center bg-muted cursor-pointer rounded-lg p-2">
          <Plus className="h-5 w-5 text-muted-foreground" />
          <span className="ml-2 text-muted-foreground font-medium">
            Create New List
          </span>
        </div>
      </DialogTrigger>
      <DialogContent className="px-0">
        <DialogHeader className="px-4">
          <DialogTitle className="text-xl font-medium">
            Create a New List
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="px-4 space-y-4">
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
          <div>
            <Label className="pb-3">Color</Label>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-7 w-7 rounded-full border-2 transition-all cursor-pointer"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? "white" : "transparent",
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 2px ${color}`
                        : "none",
                  }}
                  onClick={() =>
                    setSelectedColor(
                      selectedColor === color ? undefined : color
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 flex justify-end gap-3">
          <DialogClose className="hover:bg-muted rounded-md px-3 border border-border">
            Cancel
          </DialogClose>
          <Button
            className={`bg-primary hover:bg-primary-hover focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 text-white ${
              isLoading ? "disabled" : ""
            }`}
            disabled={isLoading}
            type="submit"
            onClick={async () => {
              if (!listName.trim()) return;
              setLoading(true);
              try {
                await onSubmit(listName.trim(), selectedColor);
                setIsOpen(false);
                setListName("");
                setSelectedColor(undefined);
              } catch (err) {
                console.error("Failed to create list", err);
              } finally {
                setLoading(false);
              }
            }}
          >
            {isLoading ? (
              "Creating..."
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
