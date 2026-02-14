"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import DocsHeader from "@/components/documents-header";
import FileGrid from "@/components/file-grid";
import { DocumentBasicInfo } from "@/types/docs";
import dynamic from "next/dynamic";
const DocxViewer = dynamic(() => import("@/components/docx-viewer"), {
  ssr: false,
});

const Page = () => {
  const [documentType, setDocumentType] = useState<"resumes" | "coverLetters">(
    //because fetch in file grid uses useCallback
    //we need this to be stable across renders
    () => {
      if (typeof window !== "undefined") {
        const fileData = sessionStorage.getItem("selectedFile");
        if (fileData) {
          try {
            const file: DocumentBasicInfo = JSON.parse(fileData);
            return file.documentType || "resumes";
          } catch (error) {
            console.error(
              "Error parsing selected file from sessionStorage:",
              error,
            );
          }
        }
      }
      return "resumes";
    },
  );
  const [selectedFile, setSelectedFile] = useState<DocumentBasicInfo | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [shouldShowUploadModal, setShouldShowUploadModal] = useState(false);

  useEffect(() => {
    setFileFromSession();
    checkUploadModalFlag();
  }, []);

  const setFileFromSession = () => {
    const fileData = sessionStorage.getItem("selectedFile");
    if (fileData) {
      try {
        const file: DocumentBasicInfo = JSON.parse(fileData);
        setSelectedFile(file);
        setDocumentType(file.documentType || "resumes");
        sessionStorage.removeItem("selectedFile"); // Clear after using
      } catch (error) {
        console.error(
          "Error parsing selected file from sessionStorage:",
          error,
        );
      }
    }
  };

  const checkUploadModalFlag = () => {
    const showModal = sessionStorage.getItem("showUploadModal");
    if (showModal === "true") {
      setShouldShowUploadModal(true);
      sessionStorage.removeItem("showUploadModal"); // Clear after reading
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row flex-1 w-full">
      <div
        className={`flex flex-col ${
          selectedFile ? "w-1/2" : "w-full"
        } h-full transition-all duration-500 ease-in-out`}
      >
        <div className="mt-4">
          <DocsHeader
            documentType={documentType}
            setDocumentType={setDocumentType}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          <FileGrid
            documentType={documentType}
            onFileSelect={(file: DocumentBasicInfo) => setSelectedFile(file)}
            selectedFile={selectedFile}
            searchTerm={searchTerm}
            shouldShowUploadModal={shouldShowUploadModal}
            onModalClose={() => setShouldShowUploadModal(false)}
          />
        </div>
      </div>
      {selectedFile && (
        <div className="flex-1 flex-shrink-0 animate-in slide-in-from-right duration-300">
          <DocxViewer
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            documentType={documentType}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
