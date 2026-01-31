"use client";

import React, { useState, useEffect, useRef } from "react";
import { CreateJob } from "@/types/jobs";
import {
  useCompanySearch,
  type CompanySearchResult,
} from "@/hooks/useCompanySearch";
import Image from "next/image";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { DocumentBasicInfo } from "@/types/docs";
interface CreateJobModalProps {
  onSubmit: (jobData: CreateJob) => void;
  targetColumn: string;
  isHeader?: boolean;
}

interface FormData {
  company: string;
  jobTitle: string;
  jobDescription: string;
  selectResume: string;
  selectCoverletter: string;
  link: string;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({
  onSubmit,
  targetColumn,
  isHeader = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    company: "",
    jobTitle: "",
    jobDescription: "",
    selectResume: "",
    selectCoverletter: "",
    link: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanySearchResult | null>(null);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companyInputFocused, setCompanyInputFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [resumes, setResumes] = useState<DocumentBasicInfo[]>([]);
  const [coverLetters, setCoverLetters] = useState<DocumentBasicInfo[]>([]);

  const companyInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    results,
    loading: searchLoading,
    searchCompanies,
    clearResults,
  } = useCompanySearch();

  // Debounced company search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        formData.company &&
        formData.company.length >= 2 &&
        companyInputFocused
      ) {
        searchCompanies(formData.company);
        setShowCompanyDropdown(true);
      } else {
        clearResults();
        setShowCompanyDropdown(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData.company, companyInputFocused, searchCompanies, clearResults]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCompanyDropdown(false);
        setCompanyInputFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        company: "",
        jobTitle: "",
        jobDescription: "",
        selectResume: "",
        selectCoverletter: "",
        link: "",
      });
      setSelectedCompany(null);
      setShowCompanyDropdown(false);
      setCompanyInputFocused(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear selected company if user manually types in company field
    if (field === "company" && selectedCompany) {
      setSelectedCompany(null);
    }
  };

  const handleCompanySelect = (company: CompanySearchResult) => {
    setFormData((prev) => ({ ...prev, company: company.name }));
    setSelectedCompany(company);
    setShowCompanyDropdown(false);
    setCompanyInputFocused(false);
    companyInputRef.current?.blur();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company.trim() || !formData.jobTitle.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const jobData: CreateJob = {
        title: formData.jobTitle,
        companyName: formData.company,
        columnId: targetColumn,
        description: formData.jobDescription,
        applicationLink: formData.link,
        resumeId: formData.selectResume,
        coverLetterId: formData.selectCoverletter,
        companyDomain: selectedCompany?.domain,
      };

      await onSubmit(jobData);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create job application:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            coverLettersRes.statusText,
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Header */}
      <DialogTrigger asChild>
        {isHeader ? (
          <Button className="bg-primary hover:bg-primary-hover !h-8">
            <Plus />
            <span className="text-sm font-inter hidden sm:inline">
              Create Application
            </span>
            <span className="text-sm font-inter sm:hidden">Create</span>
          </Button>
        ) : (
          <div
            className={`cursor-pointer hover:text-accent-foreground rounded-full p-2 transition-colors bg-primary hover:bg-primary-hover`}
          >
            <Plus strokeWidth={5} className="h-3 w-3 text-white" />
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="px-0 min-w-xl ">
        <DialogHeader className="flex size-full items-start justify-between px-4">
          <DialogTitle className="text-xl font-semibold">
            Add Job Application
          </DialogTitle>
        </DialogHeader>

        <Separator />
        <form className="px-4 flex flex-col gap-2 " onSubmit={handleSubmit}>
          {/* Company Field with Search Dropdown */}
          <div className="relative">
            <Label className="text-md font-medium ">Company</Label>
            <div className="relative">
              <div className="relative flex items-center">
                <Input
                  ref={companyInputRef}
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  onFocus={() => {
                    setCompanyInputFocused(true);
                    if (formData.company.length >= 2) {
                      setShowCompanyDropdown(true);
                    }
                  }}
                  placeholder="Company"
                  className={`bg-muted ${selectedCompany ? "pr-10" : ""}`}
                  required
                />
                {searchLoading && !selectedCompany && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-border border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
                {selectedCompany && selectedCompany.icon && (
                  <div className="absolute right-2 w-7 h-7 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <Image
                      src={selectedCompany.icon}
                      alt={selectedCompany.name}
                      className="w-full h-full object-contain"
                      width={24}
                      height={24}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-xs font-semibold text-muted-foreground">${selectedCompany.name
                            .slice(0, 2)
                            .toUpperCase()}</span>`;
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {showCompanyDropdown && results.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute w-full mt-1 bg-card border border-border rounded-md shadow-lg z-[2000] max-h-64 overflow-y-auto"
                >
                  {results.map((company) => (
                    <div
                      key={`${company.brandId}`}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleCompanySelect(company)}
                    >
                      <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Image
                          src={company.icon}
                          alt={`${company.name}`}
                          className="w-full h-full object-contain"
                          width={32}
                          height={32}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                            const parent = img.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-xs font-semibold text-muted-foreground">${company.name
                                .slice(0, 2)
                                .toUpperCase()}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {company.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {company.domain}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Job Title Field */}
          <div className="">
            <Label className="text-md font-medium ">Job Title</Label>

            <Input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              placeholder="Job Title"
              className="bg-muted"
              required
            />
          </div>

          {/* Job Description Field */}
          <div className="pb-8 max-h-[10rem]">
            <Label className="text-md font-medium ">Job Description</Label>

            <Textarea
              value={formData.jobDescription}
              onChange={(e) =>
                handleInputChange("jobDescription", e.target.value)
              }
              rows={8}
              placeholder="Job Description"
              className="bg-muted !resize-none [field-sizing-content] h-full"
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
                value={formData.selectResume}
                onValueChange={(value) =>
                  handleInputChange("selectResume", value)
                }
                required
              >
                <SelectTrigger className="w-full h-full bg-muted ">
                  <SelectValue placeholder="Select a Resume" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[2000]">
                  <SelectGroup>
                    <SelectLabel>Resume</SelectLabel>
                    {resumes.length === 0 && (
                      <SelectItem
                        value="NotAvailable"
                        className="p-3 text-sm text-muted-foreground"
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
                value={formData.selectCoverletter}
                onValueChange={(value) => {
                  console.log(value);
                  handleInputChange("selectCoverletter", value);
                }}
                required
              >
                <SelectTrigger className="w-full h-full bg-muted ">
                  <SelectValue placeholder="Select a Coverletter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cover letters</SelectLabel>
                    {coverLetters.length === 0 && (
                      <SelectItem
                        value="NotAvailable"
                        className="p-3 text-sm text-muted-foreground"
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
              value={formData.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
              placeholder="Link"
              className="bg-muted"
              required
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            {/* Cancel Button */}
            <DialogClose
              type="button"
              disabled={isLoading}
              className="hover:bg-muted rounded-md border border-border px-2"
            >
              Cancel
            </DialogClose>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={
                isLoading
                // ||
                // !formData.company.trim() ||
                // !formData.jobTitle.trim()
              }
              className="bg-primary hover:bg-primary-hover"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;
