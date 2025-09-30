"use client";
import React from "react";
import { useState } from "react";
import DocsHeader from "@/components/documents-header";

import FileGrid from "@/components/file-grid";

const Page = () => {
  const [documentType, setDocumentType] = useState<"resumes" | "coverLetters">(
    "resumes"
  );

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Fixed header that won't scroll */}
      <div className="flex-shrink-0 mt-6 px-1 max-w-[95%]">
        <DocsHeader
          documentType={documentType}
          setDocumentType={setDocumentType}
        />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto mt-1">
        <FileGrid documentType={documentType} />
      </div>
    </div>
  );
};

export default Page;
