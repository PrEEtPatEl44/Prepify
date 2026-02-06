"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Template } from "@/types/templates";
import { FileText, LetterText, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createTemplate, deleteTemplate } from "./actions";

const TemplatePdfViewer = dynamic(
  () => import("@/components/template-pdf-viewer"),
  { ssr: false }
);

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "resume" as "resume" | "cover_letter",
    content: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/templates");
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!newTemplate.content.trim()) {
      toast.error("Please enter template content");
      return;
    }

    try {
      setIsCreating(true);
      const result = await createTemplate(
        newTemplate.name,
        newTemplate.type,
        newTemplate.content
      );

      if (result.success && result.data) {
        toast.success("Template created successfully");
        setTemplates((prev) => [result.data!, ...prev]);
        setIsDialogOpen(false);
        setNewTemplate({ name: "", type: "resume", content: "" });
      } else {
        toast.error(result.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();

    try {
      const result = await deleteTemplate(templateId);

      if (result.success) {
        toast.success("Template deleted successfully");
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
        }
      } else {
        toast.error(result.error || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const getTemplateIcon = (type: string) => {
    if (type === "resume") {
      return <FileText className="h-5 w-5" />;
    }
    return <LetterText className="h-5 w-5" />;
  };

  return (
    <div className="h-screen flex flex-row flex-1 min-w-0">
      <div
        className={`flex flex-col h-full ${
          selectedTemplate ? "w-1/2" : "w-full"
        } transition-all duration-500 ease-in-out`}
      >
        <div className="mt-6 px-1 pr-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Templates</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Add a new template for your resumes or cover letters.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter template name"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value: "resume" | "cover_letter") =>
                      setNewTemplate((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume">Resume</SelectItem>
                      <SelectItem value="cover_letter">Cover Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter template content..."
                    className="min-h-[200px] max-h-[300px] overflow-y-auto resize-none"
                    value={newTemplate.content}
                    onChange={(e) =>
                      setNewTemplate((prev) => ({ ...prev, content: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Template"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto mt-6 px-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create templates from your existing resumes and cover letters to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
                    selectedTemplate?.id === template.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      {getTemplateIcon(template.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {template.type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created: {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteTemplate(e, template.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTemplate && (
        <div className="flex-1 flex-shrink-0 animate-in slide-in-from-right duration-300">
          <div className="h-screen flex flex-col bg-background/95 border-l shadow-2xl">
            <div className="sticky top-0 z-10 p-3 bg-muted flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md bg-background">
                  {getTemplateIcon(selectedTemplate.type)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{selectedTemplate.name}</p>
                  <p className="text-sm text-muted-foreground capitalize truncate">
                    {selectedTemplate.type.replace("_", " ")}
                  </p>
                </div>
              </div>
              <X
                className="h-5 w-5 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setSelectedTemplate(null)}
              />
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <TemplatePdfViewer content={selectedTemplate.content} />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
