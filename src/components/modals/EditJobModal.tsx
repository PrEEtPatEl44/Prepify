"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { type DocumentBasicInfo } from "@/types/docs";
import { Job } from "@/types/jobs";
import Image from "next/image";
import { X } from "lucide-react";

interface EditJobModalProps {
  job: Job;
  children: React.ReactNode;
}

const EditJobModal = ({ children, job }: EditJobModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumes, setResumes] = useState<DocumentBasicInfo[]>([]);
  const [coverLetters, setCoverLetters] = useState<DocumentBasicInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"documents" | "edit">("edit");

  // Form state initialized with job data
  const [companyName, setCompanyName] = useState(job.companyName);
  const [jobTitle, setJobTitle] = useState(job.title);
  const [jobDescription, setJobDescription] = useState(job.description);
  const [selectedResume, setSelectedResume] = useState(job.resumeId || "");
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(
    job.coverLetterId || ""
  );
  const [applicationLink, setApplicationLink] = useState(job.applicationLink);

  // Fetch dropdown options when the modal opens. This prevents multiple
  // CreateJobModal instances mounted across the UI from all fetching on mount.
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        // Fetch resumes
        const resumesRes = await fetch("/api/docs?type=resumes");
        if (!resumesRes.ok) {
          console.error("Failed to fetch resumes:", resumesRes.statusText);
        } else {
          const resumesJson = await resumesRes.json();
          if (resumesJson && resumesJson.success) {
            setResumes(resumesJson.data || []);
          } else {
            console.error("Error in resumes response:", resumesJson);
          }
        }

        // Fetch cover letters
        const coverLettersRes = await fetch("/api/docs?type=coverLetters");
        if (!coverLettersRes.ok) {
          console.error(
            "Failed to fetch cover letters:",
            coverLettersRes.statusText
          );
        } else {
          const coverLettersJson = await coverLettersRes.json();
          if (coverLettersJson && coverLettersJson.success) {
            setCoverLetters(coverLettersJson.data || []);
          } else {
            console.error("Error in cover letters response:", coverLettersJson);
          }
        }
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      }
    };
    //we can late implement caching with swr to prevent refetching every time
    if (isOpen && resumes.length === 0 && coverLetters.length === 0) {
      fetchDropdownOptions();
    }
  }, [isOpen, resumes.length, coverLetters.length]);

  // Update form values when job prop changes or when dialog opens
  useEffect(() => {
    console.log("Job prop or isOpen changed:", job);
    if (isOpen) {
      console.log("Updating form with job data:", {
        resumeId: job.resumeId,
        coverLetterId: job.coverLetterId,
        availableResumes: resumes.map((r) => r.id),
        availableCoverLetters: coverLetters.map((c) => c.id),
      });
      setCompanyName(job.companyName);
      setJobTitle(job.title);
      setJobDescription(job.description);
      setSelectedResume(job.resumeId || "");
      setSelectedCoverLetter(job.coverLetterId || "");
      setApplicationLink(job.applicationLink);
    }
  }, [job, isOpen, resumes, coverLetters]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Header */}
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => {
            // Prevent the dropdown from closing
            e.preventDefault();
          }}
        >
          {children}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="px-0 min-w-xl  pt-2 " showCloseButton={false}>
        <DialogHeader className="flex size-full items-start justify-between px-4">
          <DialogTitle className="text-xl font-semibold w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <div className="text-[2rem] font-normal">{job.title}</div>
                <div className="flex gap-2 items-center">
                  <Image
                    src={job.companyIconUrl}
                    alt={job.title}
                    width={36}
                    height={36}
                    unoptimized
                    className="rounded-md"
                  />
                  <div className="text-sm text-gray-500">{job.companyName}</div>
                </div>
              </div>
              <div className="cursor-pointer">
                <X
                  size={42}
                  className="cursor-pointer text-gray-700 hover:text-gray-900 transition-colors duration-200 p-1 "
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabbed Menu */}
        <div className="w-full border-y   border-gray-300">
          <div className="flex w-full ">
            <div
              className={`flex flex-1  justify-center py-3 cursor-pointer transition-colors ${
                activeTab === "documents"
                  ? "border-b-3 border-[#636AE8] underline-offset-20"
                  : "text-gray-500 hover:text-gray-700 "
              }`}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </div>
            <div
              className={`flex flex-1 justify-center  py-3 cursor-pointer transition-colors ${
                activeTab === "edit"
                  ? "border-b-3 border-[#636AE8] underline-offset-20"
                  : "text-gray-500 hover:text-gray-700 "
              }`}
              onClick={() => setActiveTab("edit")}
            >
              Edit
            </div>
          </div>
        </div>

        <form className="px-4 flex flex-col gap-2 ">
          <>
            {/* Company Field with Search Dropdown */}
            <div className="relative">
              <Label className="text-md font-medium ">Company</Label>
              <div className="relative">
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    placeholder="Company"
                    className={`bg-gray-100 `}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Job Title Field */}
            <div className="">
              <Label className="text-md font-medium ">Job Title</Label>

              <Input
                type="text"
                placeholder="Job Title"
                className="bg-gray-100"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            {/* Job Description Field */}
            <div className="pb-8 max-h-[10rem]">
              <Label className="text-md font-medium ">Job Description</Label>

              <Textarea
                rows={8}
                placeholder="Job Description"
                className="bg-gray-100 !resize-none [field-sizing-content] h-full"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            {/* Select Resume Field */}
            <div className="flex justify-between items-center gap-4">
              <div className="w-full">
                <Label htmlFor="resume" className="text-md font-medium">
                  Select Resume
                </Label>

                <Select
                  name="resume"
                  value={selectedResume}
                  onValueChange={setSelectedResume}
                  required
                >
                  <SelectTrigger className="w-full h-full bg-gray-100 ">
                    <SelectValue placeholder="Select a Resume" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[2000]">
                    <SelectGroup>
                      <SelectLabel>Resume</SelectLabel>
                      {resumes.length === 0 && (
                        <SelectItem
                          value="NotAvailable"
                          className="p-3 text-sm text-gray-500"
                        >
                          No resumes available
                        </SelectItem>
                      )}
                      {resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.file_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Select Cover Letter Field */}
              <div className="w-full">
                <Label htmlFor="coverletter" className="text-md font-medium">
                  Select Cover letter
                </Label>

                <Select
                  name="coverletter"
                  value={selectedCoverLetter}
                  onValueChange={setSelectedCoverLetter}
                  required
                >
                  <SelectTrigger className="w-full h-full bg-gray-100 ">
                    <SelectValue placeholder="Select a Coverletter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cover letters</SelectLabel>
                      {coverLetters.length === 0 && (
                        <SelectItem
                          value="NotAvailable"
                          className="p-3 text-sm text-gray-500"
                        >
                          No cover letters available
                        </SelectItem>
                      )}
                      {coverLetters.map((coverLetter) => (
                        <SelectItem key={coverLetter.id} value={coverLetter.id}>
                          {coverLetter.file_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Link Field */}
            <div className="">
              <Label className="text-md font-medium ">Link</Label>
              <Input
                type="url"
                placeholder="Link"
                className="bg-gray-100"
                value={applicationLink}
                onChange={(e) => setApplicationLink(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="mt-4 gap-2">
              {/* Cancel Button */}
              <DialogClose
                type="button"
                className="hover:bg-gray-200 rounded-md border border-gray-200 px-2"
              >
                Cancel
              </DialogClose>

              {/* Save Button */}
              <Button type="submit" className="bg-[#636AE8] hover:bg-[#4e57c1]">
                Save
              </Button>
            </DialogFooter>
          </>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;
