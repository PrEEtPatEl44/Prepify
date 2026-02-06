"use client";

import React, { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useSidebar } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface TemplatePdfViewerProps {
  content: string;
}

export default function TemplatePdfViewer({ content }: TemplatePdfViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setOpen } = useSidebar();
  const pdfUrlRef = useRef<string>("");

  useEffect(() => {
    const compilePdf = async () => {
      setIsLoading(true);
      setError(null);

      // Clean up previous URL
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }

      try {
        const response = await fetch("/api/templates/compile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to compile template");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        pdfUrlRef.current = url;
        setPdfUrl(url);
      } catch (err) {
        console.error("Error compiling template:", err);
        setError(err instanceof Error ? err.message : "Failed to compile template");
      } finally {
        setIsLoading(false);
      }
    };

    if (content) {
      compilePdf();
    }

    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, [content]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setOpen(false);
    setNumPages(numPages);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Compiling template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 p-4">
        <p className="text-sm text-destructive font-medium">Compilation Error</p>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#171A1F66] shadow-2xl">
      <div>
        <Document
          file={pdfUrl}
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
      </div>
      {numPages && <p className="text-center pb-4">{numPages} pages</p>}
    </div>
  );
}
