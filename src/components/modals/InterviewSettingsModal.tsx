"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface InterviewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: InterviewSettings) => void;
  companyName?: string;
  jobTitle?: string;
}

export interface InterviewSettings {
  difficulty: "easy" | "intermediate" | "hard";
  type: "technical" | "behavioral" | "mixed";
  questionCount: number;
}

const InterviewSettingsModal: React.FC<InterviewSettingsModalProps> = ({
  isOpen,
  onClose,
  onStart,
  companyName,
  jobTitle,
}) => {
  const [difficulty, setDifficulty] = useState<
    "easy" | "intermediate" | "hard" | ""
  >("");
  const [type, setType] = useState<"technical" | "behavioral" | "mixed" | "">(
    ""
  );
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [errors, setErrors] = useState<{
    difficulty?: string;
    type?: string;
  }>({});

  const handleStart = () => {
    // Validate form
    const newErrors: { difficulty?: string; type?: string } = {};

    if (!difficulty) {
      newErrors.difficulty = "Please select a difficulty level";
    }

    if (!type) {
      newErrors.type = "Please select an interview type";
    }

    setErrors(newErrors);

    // If there are errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // All validations passed
    const settings: InterviewSettings = {
      difficulty: difficulty as "easy" | "intermediate" | "hard",
      type: type as "technical" | "behavioral" | "mixed",
      questionCount,
    };

    console.log("Interview Settings:", settings);
    onStart(settings);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setDifficulty("");
    setType("");
    setQuestionCount(5);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] px-0">
        <DialogHeader className="px-6">
          <DialogTitle className="text-2xl">
            Configure Your Interview
          </DialogTitle>
          <DialogDescription className="text-base">
            {companyName && jobTitle ? (
              <>
                Customize your interview settings for{" "}
                <span className="font-semibold text-foreground/80">{jobTitle}</span>{" "}
                at{" "}
                <span className="font-semibold text-foreground/80">
                  {companyName}
                </span>
              </>
            ) : (
              "Customize your interview settings to match your preparation needs"
            )}
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="space-y-6 py-4 px-6">
          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-base font-medium">
              Difficulty Level
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={difficulty}
              onValueChange={(value) => {
                setDifficulty(value as "easy" | "intermediate" | "hard");
                setErrors((prev) => ({ ...prev, difficulty: undefined }));
              }}
            >
              <SelectTrigger
                id="difficulty"
                className={`w-full ${
                  errors.difficulty ? "border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select difficulty level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.difficulty}</span>
              </div>
            )}
          </div>

          {/* Interview Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-base font-medium">
              Interview Type
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as "technical" | "behavioral" | "mixed");
                setErrors((prev) => ({ ...prev, type: undefined }));
              }}
            >
              <SelectTrigger
                id="type"
                className={`w-full ${errors.type ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <div className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.type}</span>
              </div>
            )}
          </div>

          {/* Question Count Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="questionCount" className="text-base font-medium">
                Number of Questions
              </Label>
              <span className="text-lg font-semibold text-primary">
                {questionCount}
              </span>
            </div>
            <Slider
              id="questionCount"
              min={1}
              max={10}
              step={1}
              value={[questionCount]}
              onValueChange={(value: number[]) => setQuestionCount(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 question</span>
              <span>10 questions</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0 px-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto mx-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto mx-1 bg-primary hover:bg-primary-hover"
          >
            Start Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewSettingsModal;
