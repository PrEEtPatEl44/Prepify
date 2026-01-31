"use client";

import React, { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { File, X, Download } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ViewerProps {
  selectedFile: DocumentBasicInfo | null;
  setSelectedFile: (file: DocumentBasicInfo | null) => void;
}

const loadingComponent = (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin"></div>
    </div>
    <p className="text-white text-lg font-medium">Loading document...</p>
  </div>
);

export default function Viewer({ selectedFile, setSelectedFile }: ViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const { setOpen } = useSidebar();
  const [fileURl, setFileURL] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setOpen(false);
    setNumPages(numPages);
  }
  function handleClose() {
    setOpen(true);
    setSelectedFile(null);
  }

  const handleDownload = async () => {
    const supabase = createClient();
    if (!selectedFile) return;

    const { data, error } = await supabase.storage
      .from("documents")
      .download(selectedFile.file_path); // URL valid for 60 seconds

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }

    // Create a blob URL for the downloaded file
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
      createViewerUrl(selectedFile).then((url) => {
        setFileURL(url);
      });
    } else {
      setFileURL(null);
    }
  }, [selectedFile]);

  const createViewerUrl = async (file: DocumentBasicInfo) => {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(file.file_path, 60 * 60);
    if (error) {
      console.error("Error creating signed URL:", error);
      return "";
    }
    return data.signedUrl;
  };

  return (
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
          <a
            onClick={() => handleDownload()}
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
      <div>
        <Document
          file={fileURl}
          onLoadSuccess={onDocumentLoadSuccess}
          className={"m-4 min-w-fit mx-auto gap-4 max-w-xl "}
          loading={loadingComponent}
        >
          {numPages &&
            Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                className={"my-2"}
              />
            ))}
        </Document>
      </div>
      {/* {numPages && <p className="text-center pb-4">{numPages} pages</p>} */}
    </div>
  );
}
