"use client";

import { useState, useEffect, useCallback } from "react";
import { File, Download, X, Sparkles, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";
import { useSidebar } from "@/components/ui/sidebar";
import JobMatchModal from "@/components/job-match-modal";
import JobSearchModal from "@/components/modals/JobSearchModal";
import { Button } from "@/components/ui/button";
import ResumeAnalysisLoading from "@/components/resume-analysis-loading";
import JobSelectionDialog from "@/components/job-selection-dialog";
import { Job } from "@/types/jobs";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface AnalysisResult {
  total_score: number;
  score_breakdown: {
    keyword_match_score: number;
    holistic_score: number;
  };
  description: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  detailed_analysis: {
    keyword_analysis: {
      insights: string;
    };
    experience_match: {
      score: number;
      analysis: string;
    };
    qualification_match: {
      score: number;
      analysis: string;
    };
    cultural_fit: {
      score: number;
      analysis: string;
    };
    career_trajectory: {
      score: number;
      analysis: string;
    };
  };
}

interface ViewerProps {
  selectedFile: DocumentBasicInfo | null;
  setSelectedFile: (file: DocumentBasicInfo | null) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  documentType: "resumes" | "coverLetters";
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  companyIconUrl: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  matchedKeywords: string[];
}

const DocxViewer = ({
  selectedFile,
  setSelectedFile,
  onAnalysisComplete,
  documentType,
}: ViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>();
  const { setOpen } = useSidebar();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);

  // Job suggestions state
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showJobSearchModal, setShowJobSearchModal] = useState(false);

  // Template PDF state
  const [isTemplating, setIsTemplating] = useState(false);
  const [templatePdfUrl, setTemplatePdfUrl] = useState<string | null>(null);

  // Load from Supabase Storage by file path
  const loadFromSupabase = useCallback(
    async (bucketName: string, filePath: string) => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        const { data, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(filePath);

        if (downloadError) throw downloadError;

        const blobUrl = URL.createObjectURL(data);
        setFileUrl(blobUrl);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading document:", err);
        setIsLoading(false);
      }
    },
    [],
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setOpen(false);
    setNumPages(numPages);
  }

  function handleClose() {
    setOpen(true);
    setSelectedFile(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl("");
    }
    if (templatePdfUrl) {
      URL.revokeObjectURL(templatePdfUrl);
      setTemplatePdfUrl(null);
    }
  }

  const handleUseTemplate = async () => {
    if (!selectedFile) return;

    setIsTemplating(true);
    try {
      const response = await fetch("/api/docs/template-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedFile.id }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate template");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setTemplatePdfUrl(url);
      setNumPages(undefined);
      toast.success("Template generated!");
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Template generation failed", {
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsTemplating(false);
    }
  };

  const handleBackToOriginal = () => {
    if (templatePdfUrl) {
      URL.revokeObjectURL(templatePdfUrl);
      setTemplatePdfUrl(null);
      setNumPages(undefined);
    }
  };

  const handleGetATSScore = async () => {
    if (!selectedFile) return;

    try {
      setIsAnalyzing(true);
      setAnalysisStep(0);

      // Step 1: Extract resume text
      setAnalysisStep(0);
      const extractResponse = await fetch("/api/docs/extract-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_path: selectedFile.file_path,
          file_name: selectedFile.file_name,
        }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract resume text");
      }

      const { text: resumeText } = await extractResponse.json();

      // Step 2: Fetch jobs for this resume
      setAnalysisStep(1);
      const jobsResponse = await fetch(
        `/api/applications/by-resume?resume_id=${selectedFile.id}`
      );

      if (!jobsResponse.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const jobsData = await jobsResponse.json();
      const jobs: Job[] = jobsData.data.jobs;

      if (!jobs || jobs.length === 0) {
        toast.error("No jobs found for this resume", {
          description: "Please associate this resume with a job first.",
        });
        setIsAnalyzing(false);
        return;
      }

      // If multiple jobs, show selection dialog
      if (jobs.length > 1) {
        setAvailableJobs(jobs);
        setShowJobDialog(true);
        setIsAnalyzing(false);
        // Store resume text for later use
        sessionStorage.setItem("pendingResumeText", resumeText);
        return;
      }

      // Single job - proceed with analysis
      await analyzeWithJob(resumeText, jobs[0]);
    } catch (error) {
      console.error("Error getting ATS score:", error);
      toast.error("Analysis Failed", {
        description:
          error instanceof Error ? error.message : "Failed to analyze resume",
      });
      setIsAnalyzing(false);
    }
  };

  const analyzeWithJob = async (resumeText: string, job: Job) => {
    try {
      setIsAnalyzing(true);
      setShowJobDialog(false);

      // Step 3: Extract keywords
      setAnalysisStep(2);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 4: Compare resume and job
      setAnalysisStep(3);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 5: Run holistic analysis
      setAnalysisStep(4);
      const analysisResponse = await fetch("/api/resume-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: job.description,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze resume");
      }

      const result: AnalysisResult = await analysisResponse.json();

      // Step 6: Finalize
      setAnalysisStep(5);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Complete
      setIsAnalyzing(false);
      onAnalysisComplete(result);
      toast.success("Analysis Complete!", {
        description: `Your resume scored ${result.total_score}/100`,
      });
    } catch (error) {
      console.error("Error analyzing with job:", error);
      toast.error("Analysis Failed", {
        description:
          error instanceof Error ? error.message : "Failed to analyze resume",
      });
      setIsAnalyzing(false);
    }
  };

  const handleJobSelection = async (job: Job) => {
    const resumeText = sessionStorage.getItem("pendingResumeText");
    if (!resumeText) {
      toast.error("Resume text not found. Please try again.");
      return;
    }
    sessionStorage.removeItem("pendingResumeText");
    await analyzeWithJob(resumeText, job);
  };

  const handleJobDialogCancel = () => {
    setShowJobDialog(false);
    sessionStorage.removeItem("pendingResumeText");
  };

  const handleDownload = async () => {
    const supabase = createClient();
    if (!selectedFile) return;

    const { data, error } = await supabase.storage
      .from("documents")
      .download(selectedFile.file_path);

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }

    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = selectedFile.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  // Handle Get Job Suggestions
  const handleGetJobSuggestions = async () => {
    // Open the Job Search modal so user can pick filters first
    setShowJobSearchModal(true);
  };

  const fetchJobSuggestionsFromModal = async (opts: {
    country: string;
    workTypes: string[];
  }) => {
    if (!selectedFile) {
      toast.error("No resume selected");
      return;
    }

    // Only work for resumes, not cover letters
    if (!selectedFile.file_path.includes("resumes")) {
      toast.error("Job suggestions only available for resumes");
      return;
    }

    setLoadingJobs(true);
    setShowJobModal(true);

    try {
      const formData = new FormData();
      formData.append("resumeId", selectedFile.id);
      formData.append("limit", "3");

      const employment_types = opts.workTypes.join(",");
      const country = opts.country.toLowerCase();

      const qs = `?employment_types=${encodeURIComponent(
        employment_types
      )}&country=${encodeURIComponent(country)}`;

      const response = await fetch(`/api/jobs/suggest${qs}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get job suggestions");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to get job suggestions");
      }

      // Transform jobs to include company icons
      const jobsWithIcons = data.data.jobs.map((job: JobMatch) => ({
        ...job,
        companyIconUrl: job.company
          ? `https://cdn.brandfetch.io/${job.company
              .toLowerCase()
              .replace(/\s+/g, "")}.com?c=${
              process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID || ""
            }`
          : "/logo.svg",
      }));

      setJobMatches(jobsWithIcons);
      toast.success(`Found ${jobsWithIcons.length} matching jobs!`);
    } catch (error) {
      console.error("Error getting job suggestions:", error);
      toast.error("Failed to get job suggestions");
      setJobMatches([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      loadFromSupabase("documents", selectedFile.file_path);
    }
  }, [selectedFile, loadFromSupabase]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      if (templatePdfUrl) {
        URL.revokeObjectURL(templatePdfUrl);
      }
    };
  }, [fileUrl, templatePdfUrl]);

  return (
    <>
      {/* Analysis Loading Overlay */}
      {isAnalyzing && <ResumeAnalysisLoading currentStep={analysisStep} />}

      {/* Job Selection Dialog */}
      <JobSelectionDialog
        open={showJobDialog}
        onOpenChange={setShowJobDialog}
        jobs={availableJobs}
        onSelectJob={handleJobSelection}
        onCancel={handleJobDialogCancel}
      />
      <div
        className="h-screen min-w-fit flex flex-col bg-[#171A1F66] shadow-2xl overflow-y-scroll scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="sticky top-0 z-10 p-3 bg-muted flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="p-2">
              <File className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg">{selectedFile?.file_name}</span>
          </div>
          <div className="flex gap-2 items-center">
            {templatePdfUrl && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleBackToOriginal}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Original
              </Button>
            )}
            <a
              onClick={handleDownload}
              className="p-1 rounded-full hover:bg-background/20"
            >
              <Download className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer" />
            </a>
            <X
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
        </div>

        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-card/90">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading document...</p>
              </div>
            </div>
          )}

          {/* Action Buttons Overlay */}
          {!isLoading && documentType === "resumes" && (
            <div className="absolute bottom-12 bg-black/50 right-0 z-40 p-2 rounded-l-lg flex gap-2">
              <Button
                size="sm"
                onClick={handleUseTemplate}
                className="bg-primary hover:bg-primary-hover text-white gap-2"
                disabled={isTemplating}
              >
                {isTemplating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Use Template
              </Button>
              <Button
                size="sm"
                onClick={handleGetJobSuggestions}
                className="bg-primary hover:bg-primary-hover text-white gap-2"
                disabled={loadingJobs}
              >
                <Sparkles className="h-4 w-4" />
                Get Job Suggestions
              </Button>
              <Button
                size="sm"
                className="bg-primary-lighter hover:bg-primary-light text-primary shadow-lg transition-all duration-200 mr-5"
                onClick={handleGetATSScore}
                disabled={isAnalyzing}
              >
                <File className="h-4 w-4" />
                Get ATS Score
              </Button>
            </div>
          )}

          {(templatePdfUrl || fileUrl) && (
            <Document
              file={templatePdfUrl || fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="m-4 flex flex-col items-center gap-4"
            >
              {numPages &&
                Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    className="shadow-lg"
                  />
                ))}
            </Document>
          )}
        </div>
      </div>

      {/* Job Match Modal */}
      <JobMatchModal
        open={showJobModal}
        onOpenChange={setShowJobModal}
        jobs={jobMatches}
        loading={loadingJobs}
        selectedFile={selectedFile}
      />
      <JobSearchModal
        open={showJobSearchModal}
        onOpenChange={setShowJobSearchModal}
        onSearch={fetchJobSuggestionsFromModal}
      />
    </>
  );
};

export default DocxViewer;
