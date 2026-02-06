"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  STARTER_TEMPLATES,
  escapeLatex,
  type StarterTemplate,
} from "@/lib/data/starter-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createTemplate } from "@/app/(protected)/templates/actions";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";

const TemplatePdfViewer = dynamic(
  () => import("@/components/template-pdf-viewer"),
  { ssr: false }
);

interface TemplateOnboardingProps {
  onTemplateCreated: () => void;
}

const PLACEHOLDER_KEYS = [
  "FULL_NAME",
  "EMAIL",
  "PHONE",
  "LOCATION",
  "SCHOOL",
  "DEGREE",
  "FIELD",
  "GRADUATION_DATE",
  "COMPANY",
  "TITLE",
  "START_DATE",
  "END_DATE",
  "DESCRIPTION",
  "SKILLS",
] as const;

type PlaceholderKey = (typeof PLACEHOLDER_KEYS)[number];

const FIELD_CONFIG: {
  key: PlaceholderKey;
  label: string;
  placeholder: string;
  section: "personal" | "education" | "experience" | "skills";
  type: "input" | "textarea";
}[] = [
  { key: "FULL_NAME", label: "Full Name", placeholder: "John Doe", section: "personal", type: "input" },
  { key: "EMAIL", label: "Email", placeholder: "john@example.com", section: "personal", type: "input" },
  { key: "PHONE", label: "Phone", placeholder: "(555) 123-4567", section: "personal", type: "input" },
  { key: "LOCATION", label: "Location", placeholder: "New York, NY", section: "personal", type: "input" },
  { key: "SCHOOL", label: "School", placeholder: "University of Technology", section: "education", type: "input" },
  { key: "DEGREE", label: "Degree", placeholder: "Bachelor of Science", section: "education", type: "input" },
  { key: "FIELD", label: "Field of Study", placeholder: "Computer Science", section: "education", type: "input" },
  { key: "GRADUATION_DATE", label: "Graduation Date", placeholder: "May 2024", section: "education", type: "input" },
  { key: "COMPANY", label: "Company", placeholder: "Acme Corp", section: "experience", type: "input" },
  { key: "TITLE", label: "Job Title", placeholder: "Software Engineer", section: "experience", type: "input" },
  { key: "START_DATE", label: "Start Date", placeholder: "Jun 2022", section: "experience", type: "input" },
  { key: "END_DATE", label: "End Date", placeholder: "Present", section: "experience", type: "input" },
  { key: "DESCRIPTION", label: "Description", placeholder: "Developed and maintained web applications using React and Node.js", section: "experience", type: "textarea" },
  { key: "SKILLS", label: "Skills", placeholder: "JavaScript, TypeScript, React, Node.js, Python, SQL", section: "skills", type: "textarea" },
];

const SECTIONS = [
  { id: "personal", label: "Personal Information" },
  { id: "education", label: "Education" },
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
] as const;

const STEPS = [
  { number: 1, label: "Select Template" },
  { number: 2, label: "Fill Details" },
  { number: 3, label: "Preview PDF" },
];

export default function TemplateOnboarding({ onTemplateCreated }: TemplateOnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<StarterTemplate | null>(null);
  const [formData, setFormData] = useState<Record<PlaceholderKey, string>>(
    () => Object.fromEntries(PLACEHOLDER_KEYS.map((k) => [k, ""])) as Record<PlaceholderKey, string>
  );
  const [isSaving, setIsSaving] = useState(false);

  const compiledContent = useMemo(() => {
    if (!selectedTemplate) return "";
    let result = selectedTemplate.content;
    for (const key of PLACEHOLDER_KEYS) {
      const value = formData[key] ? escapeLatex(formData[key]) : "";
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }, [selectedTemplate, formData]);

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      const result = await createTemplate(
        `${selectedTemplate.name} - ${formData.FULL_NAME || "Untitled"}`,
        "resume",
        compiledContent
      );
      if (result.success) {
        toast.success("Template saved successfully!");
        onTemplateCreated();
        // Reset wizard
        setStep(1);
        setSelectedTemplate(null);
        setFormData(
          Object.fromEntries(PLACEHOLDER_KEYS.map((k) => [k, ""])) as Record<PlaceholderKey, string>
        );
      } else {
        toast.error(result.error || "Failed to save template");
      }
    } catch {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: PlaceholderKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-4 px-4">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.number}>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium ${
                  step === s.number
                    ? "bg-primary text-primary-foreground"
                    : step > s.number
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.number ? <Check className="h-3.5 w-3.5" /> : s.number}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  step === s.number ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <Separator className="w-8 sm:w-12" />
            )}
          </React.Fragment>
        ))}
      </div>

      <Separator />

      {/* Step content */}
      <div className="flex-1 overflow-hidden">
        {step === 1 && (
          <div className="h-full flex flex-col">
            <div className="px-4 pt-4 pb-2">
              <h2 className="text-lg font-semibold">Choose a Starter Template</h2>
              <p className="text-sm text-muted-foreground">
                Pick a resume template to get started. You can customize it in the next step.
              </p>
            </div>
            <ScrollArea className="flex-1 px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {STARTER_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-5 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
                      selectedTemplate?.id === template.id
                        ? "ring-2 ring-primary border-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-muted-foreground">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end px-4 py-3 border-t">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedTemplate}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="max-w-2xl mx-auto space-y-6">
                {SECTIONS.map((section) => {
                  const fields = FIELD_CONFIG.filter((f) => f.section === section.id);
                  return (
                    <div key={section.id}>
                      <h3 className="text-base font-semibold mb-3">{section.label}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.map((field) => (
                          <div
                            key={field.key}
                            className={field.type === "textarea" ? "sm:col-span-2" : ""}
                          >
                            <Label htmlFor={field.key} className="mb-1.5">
                              {field.label}
                            </Label>
                            {field.type === "textarea" ? (
                              <Textarea
                                id={field.key}
                                placeholder={field.placeholder}
                                value={formData[field.key]}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                className="min-h-[80px] resize-none"
                              />
                            ) : (
                              <Input
                                id={field.key}
                                placeholder={field.placeholder}
                                value={formData[field.key]}
                                onChange={(e) => updateField(field.key, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {section.id !== "skills" && <Separator className="mt-6" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="flex justify-between px-4 py-3 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Preview
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <TemplatePdfViewer content={compiledContent} />
            </ScrollArea>
            <div className="flex justify-between px-4 py-3 border-t">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Template"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
