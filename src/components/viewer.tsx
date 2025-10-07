"use client";

import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { File } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface ViewerProps {
  fileUrl: string;
  fileName?: string;
}

export default function Viewer({
  fileUrl,
  fileName = "Document",
}: ViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const { setOpen } = useSidebar();
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setOpen(false);
    setNumPages(numPages);
  }

  return (
    <div
      className="h-screen flex flex-col bg-[#171A1F66] shadow-2xl overflow-scroll scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="sticky top-0 z-10 p-3 bg-gray-100 flex items-center gap-3">
        <div className="p-2">
          <File className="h-6 w-6 text-[#636AE8]" />
        </div>
        <span className="text-lg">{fileName}</span>
      </div>
      <div className="h">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className={"m-4 flex flex-col gap-4 max-w-3xl "}
        >
          {numPages &&
            Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
        </Document>
      </div>
      {numPages && <p className="text-center pb-4">{numPages} pages</p>}
    </div>
  );
}
