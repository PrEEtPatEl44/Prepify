"use client";
import React from "react";
import { useState } from "react";
import DocsHeader from "@/components/documents-header";
import FileGrid from "@/components/file-grid";
import dynamic from "next/dynamic";
const Viewer = dynamic(() => import("@/components/viewer"), {
  ssr: false,
});

interface SelectedFile {
  url: string;
  name: string;
  filePath: string;
}

const Page = () => {
  const [documentType, setDocumentType] = useState<"resumes" | "coverLetters">(
    "resumes"
  );
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="h-screen flex flex-col lg:flex-row flex-1 w-full">
      <div
        className={`flex flex-col ${
          selectedFile ? "w-1/2" : "w-full"
        } h-full transition-all duration-300 ease-in-out`}
      >
        <div className="flex-shrink-0 mt-6 px-1 max-w-[95%]">
          <DocsHeader
            documentType={documentType}
            setDocumentType={setDocumentType}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-1">
          <FileGrid
            documentType={documentType}
            onFileSelect={(url: string, name: string, filePath: string) =>
              setSelectedFile({ url, name, filePath })
            }
            selectedFile={selectedFile}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      {selectedFile && (
        <div className="flex-1 flex-shring-0 animate-in slide-in-from-right duration-300">
          <Viewer
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
