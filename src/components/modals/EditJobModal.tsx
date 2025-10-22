"use client";
import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
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
import FileCard from "@/components/file-card";
import { useRouter } from "next/navigation";
import { type DocumentBasicInfo } from "@/types/docs";
import { Job } from "@/types/jobs";
import Image from "next/image";
import { X, Sparkles, Loader2 } from "lucide-react";
import {
  useCompanySearch,
  type CompanySearchResult,
} from "@/hooks/useCompanySearch";
import { editJob } from "@/app/jobs/actions";
import { toast } from "sonner";

interface EditJobModalProps {
  job: Job;
  children: React.ReactNode;
  onJobUpdated?: (updatedJob: Job) => void;
}

type DocumentWithType = DocumentBasicInfo & {
  documentType: "resumes" | "coverLetters";
};

const EditJobModal = ({ children, job, onJobUpdated }: EditJobModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumes, setResumes] = useState<DocumentBasicInfo[]>([]);
  const [coverLetters, setCoverLetters] = useState<DocumentBasicInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"documents" | "edit">("edit");
  const [documents, setDocuments] = useState<DocumentWithType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state initialized with job data
  const [companyName, setCompanyName] = useState(job.companyName);
  const [jobTitle, setJobTitle] = useState(job.title);
  const [jobDescription, setJobDescription] = useState(job.description);
  const [selectedResume, setSelectedResume] = useState(job.resumeId || "");
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(
    job.coverLetterId || ""
  );

  // Company search state
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

  const router = useRouter();
  const handleFileSelect = (file: DocumentBasicInfo) => {
    if (file && file.documentType) {
      sessionStorage.setItem("selectedFile", JSON.stringify(file));
    }
    console.log(sessionStorage.getItem("selectedFile"));
    // Redirect to docs page
    router.push("/docs");
  };

  const [applicationLink, setApplicationLink] = useState(job.applicationLink);

  // Debounced company search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (companyName && companyName.length >= 2 && companyInputFocused) {
        searchCompanies(companyName);
        setShowCompanyDropdown(true);
      } else {
        clearResults();
        setShowCompanyDropdown(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [companyName, companyInputFocused, searchCompanies, clearResults]);

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

  const handleCompanySelect = (company: CompanySearchResult) => {
    setCompanyName(company.name);
    setSelectedCompany(company);
    setShowCompanyDropdown(false);
    setCompanyInputFocused(false);
    companyInputRef.current?.blur();
  };

  // Fetch dropdown options when the modal opens. This prevents multiple
  // EditJobModal instances mounted across the UI from all fetching on mount.
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    //we can late implement caching with swr to prevent refetching every time
    if (isOpen && resumes.length === 0 && coverLetters.length === 0) {
      fetchDropdownOptions();
    }
  }, [isOpen, resumes.length, coverLetters.length]);

  const getDocuments = useCallback(() => {
    const matchingDocuments: DocumentWithType[] = [];

    // Find the resume that matches job.resumeId
    if (job.resumeId) {
      const matchingResume = resumes.find(
        (resume) => resume.id === job.resumeId
      );
      if (matchingResume) {
        matchingDocuments.push({ ...matchingResume, documentType: "resumes" });
      }
    }

    // Find the cover letter that matches job.coverLetterId
    if (job.coverLetterId) {
      const matchingCoverLetter = coverLetters.find(
        (coverLetter) => coverLetter.id === job.coverLetterId
      );
      if (matchingCoverLetter) {
        matchingDocuments.push({
          ...matchingCoverLetter,
          documentType: "coverLetters",
        });
      }
    }

    setDocuments(matchingDocuments);
  }, [job.resumeId, job.coverLetterId, resumes, coverLetters]);

  useEffect(() => {
    if (resumes.length > 0 || coverLetters.length > 0) {
      getDocuments();
    }
  }, [resumes, coverLetters, getDocuments]);

  useEffect(() => {
    if (isOpen) {
      setCompanyName(job.companyName);
      setJobTitle(job.title);
      setJobDescription(job.description);
      setSelectedResume(job.resumeId || "");
      setSelectedCoverLetter(job.coverLetterId || "");
      setApplicationLink(job.applicationLink);
      setSelectedCompany(null);
      setShowCompanyDropdown(false);
      setCompanyInputFocused(false);
    }
  }, [isOpen, job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !jobTitle.trim()) {
      console.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await editJob(job.id, {
        title: jobTitle,
        companyName: companyName,
        description: jobDescription,
        applicationLink: applicationLink,
        resumeId: selectedResume,
        coverLetterId: selectedCoverLetter,
        companyDomain: selectedCompany?.domain || job.companyDomain,
        columnId: job.columnId, // Keep the same column
      });

      if (result.success && result.data) {
        console.log("Job application updated successfully");
        // Call the callback to update the parent state
        if (onJobUpdated) {
          onJobUpdated(result.data);
        }
        setIsOpen(false);
        toast.success("Job application updated successfully");
        // Refresh the page to show updated data
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update job application");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job application");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <DialogContent
        className="px-0 min-w-xl  pt-2"
        showCloseButton={false}
        onKeyDown={(e) => {
          // Prevent keyboard events from bubbling to kanban items below
          e.stopPropagation();
        }}
      >
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

        {loading ? (
          <div className="px-4 py-10 flex items-center justify-center">
            <Loader2
              className="h-6 w-6 animate-spin text-gray-500"
              aria-label="Loading"
            />
            <span className="sr-only">Loading</span>
          </div>
        ) : (
          <div key={activeTab} className="px-0 tab-transition">
            {activeTab === "edit" ? (
              <form
                className="px-4 flex flex-col gap-2"
                onSubmit={handleSubmit}
              >
                <>
                  {/* Company Field with Search Dropdown */}
                  <div className="relative">
                    <Label className="text-md font-medium ">Company</Label>
                    <div className="relative">
                      <div className="relative flex items-center">
                        <Input
                          ref={companyInputRef}
                          type="text"
                          placeholder="Company"
                          className={`bg-gray-100 ${
                            selectedCompany ? "pr-10" : ""
                          }`}
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            // Clear selected company if user manually types
                            if (selectedCompany) {
                              setSelectedCompany(null);
                            }
                          }}
                          onFocus={() => {
                            setCompanyInputFocused(true);
                            if (companyName.length >= 2) {
                              setShowCompanyDropdown(true);
                            }
                          }}
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
                      placeholder="Job Title"
                      className="bg-gray-100"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Job Description Field */}
                  <div className="pb-8 max-h-[10rem]">
                    <Label className="text-md font-medium ">
                      Job Description
                    </Label>

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
                      <Label
                        htmlFor="coverletter"
                        className="text-md font-medium"
                      >
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
                              <SelectItem
                                key={coverLetter.id}
                                value={coverLetter.id}
                              >
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
                      disabled={isSubmitting}
                      className="hover:bg-gray-200 rounded-md border border-gray-200 px-2"
                    >
                      Cancel
                    </DialogClose>

                    {/* Save Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#636AE8] hover:bg-[#4e57c1]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </DialogFooter>
                </>
              </form>
            ) : documents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No documents available for this job.
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  {documents.map((doc) => (
                    <FileCard
                      key={doc.id}
                      file={doc}
                      onFileSelect={handleFileSelect}
                      handleDeleteFile={() => {}}
                      deletable={false}
                    />
                  ))}
                </div>
                <DialogFooter className="mt-4 gap-2 p-2">
                  <DialogClose
                    type="button"
                    className="hover:bg-gray-200 rounded-md border border-gray-200 px-2"
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-[#636AE8] hover:bg-[#4e57c1]"
                  >
                    <Sparkles className="mr-2" />
                    Get Job Score
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;
