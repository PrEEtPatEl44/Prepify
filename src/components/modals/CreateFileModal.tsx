"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/dropzone";
import { Separator } from "../ui/separator";
import type { UploadDocumentResult } from "@/types/docs";

interface CreateFileModalProps {
  documentType: "resumes" | "coverLetters";
  children: React.ReactNode;
  onSubmit?: (data: { fileName: string; file: File; url?: string }) => void;
}

export function CreateFileModal({
  children,
  onSubmit,
  documentType,
}: CreateFileModalProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    resetForm();
  };

  const resetForm = () => {
    setFileName("");
    setSelectedFile(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle dropzone click
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);

      // Auto-populate filename if empty
      if (!fileName) {
        // Remove file extension for the name
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        setFileName(nameWithoutExtension);
      }
    }
  };

  // Handle form submission - upload via API route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName.trim()) {
      alert("Please enter a file name");
      return;
    }

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", fileName.trim());
      formData.append("documentType", documentType);

      // Send POST request to upload endpoint
      const response = await fetch("/api/docs", {
        method: "POST",
        body: formData,
      });

      const result: UploadDocumentResult = await response.json();

      if (!result.success) {
        throw new Error(result.message || result.error || "Upload failed");
      }

      console.log("File uploaded successfully:", result.data);

      // Call onSubmit callback if provided
      if (onSubmit && result.data) {
        onSubmit({
          fileName: fileName.trim(),
          file: selectedFile,
          url: result.data.url,
        });
      }

      // Close modal on success
      setOpen(false);
    } catch (error: unknown) {
      console.error("File upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md px-0">
        <DialogHeader className="px-6">
          <DialogTitle>Create New File</DialogTitle>
        </DialogHeader>
        <Separator />
        <form onSubmit={handleSubmit} className="space-y-4 px-6">
          {/* File Name Input */}
          <div className="space-y-2">
            <label htmlFor="fileName" className="text-sm font-medium">
              File Name
            </label>
            <Input
              id="fileName"
              type="text"
              placeholder="Enter file name..."
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload File</label>

            {!selectedFile ? (
              // Show dropzone when no file is selected
              <FileDropzone
                fileInputRef={fileInputRef}
                handleBoxClick={handleBoxClick}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleFileSelect={handleFileSelect}
              />
            ) : (
              // Show file preview when file is selected
              <div className="p-4 bg-muted rounded-md border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)} •{" "}
                      {selectedFile.type || "Unknown type"}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileName(""); // Clear the file name input
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!fileName.trim() || !selectedFile || isSubmitting}
              className="bg-[#636AE8] hover:bg-[#4e57c2] focus:ring-4 focus:ring-[#636AE8]/50 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFileModal;
