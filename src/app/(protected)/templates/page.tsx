"use client";

import React, { useEffect, useState } from "react";
import { Template } from "@/types/templates";
import { FileText, LetterText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getTemplateIcon = (type: string) => {
    if (type === "resume") {
      return <FileText className="h-5 w-5" />;
    }
    return <LetterText className="h-5 w-5" />;
  };

  return (
    <div className="h-screen flex flex-col flex-1 w-full">
      <div className="flex flex-col h-full">
        <div className="mt-6 px-1 max-w-[95%]">
          <h1 className="text-2xl font-semibold">Templates</h1>
        </div>

        <div className="flex-1 overflow-y-auto mt-6 px-1 max-w-[95%]">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
