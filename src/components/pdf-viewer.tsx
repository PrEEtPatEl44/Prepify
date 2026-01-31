"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useSidebar } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface ViewerProps {
  file: DocumentBasicInfo;
}

export default function Viewer({ file }: ViewerProps) {
  const [numPages, setNumPages] = useState<number>();
  const { setOpen } = useSidebar();
  const [fileUrl, setFileURL] = useState<string>("");

  const loadFromSupabase = useCallback(
    async (bucketName: string, filePath: string) => {
      //   setIsLoading(true);
      try {
        const supabase = createClient();

        const { data, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(filePath);

        if (downloadError) {
          console.error("Error downloading file:", downloadError.message);
          // setIsLoading(false);
          return;
        }

        // Create a blob URL for the downloaded file
        const blobUrl = URL.createObjectURL(data);
        setFileURL(blobUrl);
      } catch (err) {
        console.error("Error loading document:", err);
        // setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (file) {
      loadFromSupabase("documents", file.file_path);
    }
  }, [file, loadFromSupabase]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setOpen(false);
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col bg-[#171A1F66] shadow-2xl">
      <div className="">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className={"m-4 flex flex-col items-center gap-4"}
        >
          {numPages &&
            Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                className={"shadow-lg"}
              />
            ))}
        </Document>
      </div>
      {numPages && <p className="text-center pb-4">{numPages} pages</p>}
    </div>
  );
}
