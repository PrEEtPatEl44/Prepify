"use client";

import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { File, X, Download } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ViewerProps {
  selectedFile: { url: string; name: string; filePath: string } | null;
  setSelectedFile: (
    file: { url: string; name: string; filePath: string } | null
  ) => void;
}

const loadingComponent = (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-[#636AE8] rounded-full animate-spin"></div>
    </div>
    <p className="text-white text-lg font-medium">Loading document...</p>
  </div>
);

export default function Viewer({ selectedFile, setSelectedFile }: ViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const { setOpen } = useSidebar();
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
      .download(selectedFile.filePath); // URL valid for 60 seconds

    if (error) {
      console.error("Error downloading file:", error);
      return;
    }

    // Create a blob URL for the downloaded file
    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div
      className="h-screen min-w-fit flex flex-col bg-[#171A1F66] shadow-2xl overflow-y-scroll scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="sticky top-0 z-10 p-3 bg-gray-100 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="p-2">
            <File className="h-6 w-6 text-[#636AE8]" />
          </div>
          <span className="text-lg">{selectedFile?.name}</span>
        </div>
        <div className="flex gap-2 items-center">
          <a
            onClick={() => handleDownload()}
            className="p-1 rounded-full hover:bg-white/20"
          >
            <Download className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
          </a>
          <X
            className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={() => handleClose()}
          />
        </div>
      </div>
      <div>
        <Document
          file={selectedFile?.url}
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
