"use client";

import { useState, useEffect, useCallback } from "react";
import { File, Download, X, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface ViewerProps {
  selectedFile: DocumentBasicInfo | null;
  setSelectedFile: (file: DocumentBasicInfo | null) => void;
  documentType: "resumes" | "coverLetters";
}

const DocxViewer = ({
  selectedFile,
  setSelectedFile,
  documentType,
}: ViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [numPages, setNumPages] = useState<number>();
  const { setOpen } = useSidebar();

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
    </>
  );
};

export default DocxViewer;
