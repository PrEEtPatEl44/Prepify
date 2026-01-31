"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Sparkles,
  Search,
  GitCompare,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const analysisSteps: Step[] = [
  {
    id: "extracting",
    label: "Extracting resume text...",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "fetching",
    label: "Fetching job descriptions...",
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: "keywords",
    label: "Extracting keywords...",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "comparing",
    label: "Comparing resume and job description...",
    icon: <GitCompare className="h-5 w-5" />,
  },
  {
    id: "analyzing",
    label: "Running holistic analysis...",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "finalizing",
    label: "Finalizing results...",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
];

interface ResumeAnalysisLoadingProps {
  currentStep?: number;
  customSteps?: Step[];
}

export default function ResumeAnalysisLoading({
  currentStep = 0,
  customSteps,
}: ResumeAnalysisLoadingProps) {
  const [activeStep, setActiveStep] = useState(currentStep);
  const steps = customSteps || analysisSteps;

  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold mt-4">Analyzing Resume</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Please wait while we process your resume
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isCompleted = index < activeStep;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-primary/10 border border-primary/30"
                      : isCompleted
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-muted/50 border border-border"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      isActive
                        ? "text-primary animate-pulse"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground/70"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-green-700 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>
                {activeStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((activeStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
