"use client";

import { useRef, useState, useEffect } from "react";
import { File, Download, X, Sparkles, FileText } from "lucide-react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";
import { useSidebar } from "@/components/ui/sidebar";
import JobMatchModal from "@/components/job-match-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

DocumentEditorContainerComponent.Inject(Toolbar);

import { registerLicense } from "@syncfusion/ej2-base";

if (process.env.NEXT_PUBLIC_SYNCFUSION_KEY) {
  registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_KEY);
} else {
  console.warn("Syncfusion license key is not set.");
}

interface ViewerProps {
  selectedFile: DocumentBasicInfo | null;
  setSelectedFile: (file: DocumentBasicInfo | null) => void;
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

const DocxViewer = ({ selectedFile, setSelectedFile }: ViewerProps) => {
  const editorRef = useRef<DocumentEditorContainerComponent>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setOpen } = useSidebar();
  
  // Job suggestions state
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Handle document change event to apply fitPage and stop loading
  const onDocumentChange = () => {
    if (editorRef.current) {
      editorRef.current.documentEditor.fitPage("FitPageWidth");
      setIsLoading(false);
      setOpen(false);
    }
  };

  // Load from Supabase Storage by file path
  const loadFromSupabase = async (bucketName: string, filePath: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) throw downloadError;

      const reader = new FileReader();
      reader.readAsDataURL(data);

      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        if (editorRef.current) {
          editorRef.current.documentEditor.open(base64Data);
        }
      };
    } catch (err) {
      console.error("Error loading document:", err);
      setIsLoading(false);
    }
  };

  function handleClose() {
    setOpen(true);
    setSelectedFile(null);
  }

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

      const response = await fetch("/api/jobs/suggest", {
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
  }, [selectedFile]);
console.log("Selected File:", selectedFile);

  return (
    <>
      <div
        className="h-screen min-w-fit flex flex-col bg-[#171A1F66] shadow-2xl overflow-y-scroll scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="sticky top-0 z-10 p-3 bg-gray-100 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="p-2">
              <File className="h-6 w-6 text-[#636AE8]" />
            </div>
            <span className="text-lg">{selectedFile?.file_name}</span>
          </div>
          <div className="flex gap-2 items-center">
            <a onClick={handleDownload} className="p-1 rounded-full hover:bg-white/20">
              <Download className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
            </a>
            <X
              className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer"
              onClick={() => handleClose()}
            />
          </div>
        </div>

        <div className="relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#636AE8] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          )}
          <DocumentEditorContainerComponent
            ref={editorRef}
            className="min-w-fit mx-auto gap-4 !max-w-2xl"
            id="container"
            enableToolbar={false}
            height="100%"
            showPropertiesPane={false}
            serviceUrl={process.env.NEXT_PUBLIC_SYNCFUSION_SERVICE_URL}
            readOnly={true}
            restrictEditing={true}
            documentChange={onDocumentChange}
          />
        </div>

        {/* Action Buttons - Only show for resumes */}
        {selectedFile && selectedFile.file_path.includes("resumes") && (
          <div className="sticky bottom-0 z-50 p-4 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 flex gap-3 justify-end">
            <Button
              onClick={handleGetJobSuggestions}
              className="bg-[#636AE8] hover:bg-[#4e57c1] text-white gap-2"
              disabled={loadingJobs}
            >
              <Sparkles className="h-4 w-4" />
              Get Job Suggestions
            </Button>
            <Button
              className="bg-gray-600 hover:bg-gray-700 text-white gap-2"
              disabled
            >
              <FileText className="h-4 w-4" />
              Get ATS Score
            </Button>
          </div>
        )}

      </div>

      {/* Job Match Modal */}
      <JobMatchModal
        open={showJobModal}
        onOpenChange={setShowJobModal}
        jobs={jobMatches}
        loading={loadingJobs}
      />
    </>
  );
};

export default DocxViewer;