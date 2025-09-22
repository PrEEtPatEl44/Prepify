"use client";

import React, { useState, useEffect, useRef } from "react";
import { type Job } from "@/types/jobs";
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
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: Partial<Job>) => void;
  targetColumn?: string;
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
  isOpen,
  onClose,
  onSubmit,
  targetColumn = "col-1",
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
    }, 500);

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
      const jobData: Partial<Job> = {
        id: `task-${Date.now()}`,
        title: formData.jobTitle,
        companyName: formData.company,
        columnId: targetColumn,
        companyIconUrl: selectedCompany?.icon,
        description: formData.jobDescription,
        applicationLink: formData.link,
        resumeId: formData.selectResume,
        coverLetterId: formData.selectCoverletter,
        // Fallbacks in case company search did not yield a result
        // ||
        // selectedCompany?.logoUrl ||
        // `https://cdn.brandfetch.io/${formData.company
        //   .toLowerCase()
        //   .replace(/\s+/g, "")}.com?c=1idy7WQ5YtpRvbd1DQy`,
      };

      await onSubmit(jobData);
    } catch (error) {
      console.error("Failed to create job application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Header */}
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
                  className={`bg-gray-100 ${selectedCompany ? "pr-10" : ""}`}
                  required
                />
                {searchLoading && !selectedCompany && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                )}
                {selectedCompany && selectedCompany.icon && (
                  <div className="absolute right-2 w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
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
                          parent.innerHTML = `<span class="text-xs font-semibold text-gray-600">${selectedCompany.name
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
                  className="absolute w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[2000] max-h-64 overflow-y-auto"
                >
                  {results.map((company) => (
                    <div
                      key={`${company.brandId}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleCompanySelect(company)}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
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
                              parent.innerHTML = `<span class="text-xs font-semibold text-gray-600">${company.name
                                .slice(0, 2)
                                .toUpperCase()}</span>`;
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {company.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
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
              className="bg-gray-100"
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
              className="bg-gray-100 !resize-none [field-sizing-content] h-full"
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
              >
                <SelectTrigger className="w-full h-full bg-gray-100 ">
                  <SelectValue placeholder="Select a Resume" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[2000]">
                  <SelectGroup>
                    <SelectLabel>Resume</SelectLabel>
                    <SelectItem value="resume-1">
                      Software Developer Resume
                    </SelectItem>
                    <SelectItem value="resume-2">
                      Frontend Developer Resume
                    </SelectItem>
                    <SelectItem value="resume-3">Full Stack Resume</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Select Cover Letter Field */}
            <div className="w-full">
              <Label htmlFor="coverletter" className="text-md font-medium">
                Select Coverletter
              </Label>

              <Select
                name="coverletter"
                value={formData.selectCoverletter}
                onValueChange={(value) => {
                  console.log(value);
                  handleInputChange("selectCoverletter", value);
                }}
              >
                <SelectTrigger className="w-full h-full bg-gray-100 ">
                  <SelectValue placeholder="Select a Coverletter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Coverletter</SelectLabel>
                    <SelectItem value="cover-1">
                      Software Developer Coverletter
                    </SelectItem>
                    <SelectItem value="cover-2">
                      Frontend Developer Coverletter
                    </SelectItem>
                    <SelectItem value="cover-3">
                      Full Stack Coverletter
                    </SelectItem>
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
              className="bg-gray-100"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            {/* Cancel Button */}
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className=""
              variant={"outline"}
            >
              Cancel
            </Button>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={
                isLoading
                // ||
                // !formData.company.trim() ||
                // !formData.jobTitle.trim()
              }
              className="bg-[#636AE8] hover:bg-[#4e57c1]"
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
