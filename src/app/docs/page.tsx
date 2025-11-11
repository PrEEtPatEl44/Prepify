/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import DocsHeader from "@/components/documents-header";
import FileGrid from "@/components/file-grid";
import { DocumentBasicInfo } from "@/types/docs";
import DocxViewer from "@/components/docx-viewer";
import ResumeAnalysisResults from "@/components/resume-analysis-results";

interface AnalysisResult {
  total_score: number;
  score_breakdown: {
    keyword_match_score: number;
    holistic_score: number;
  };
  description: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  detailed_analysis: {
    keyword_analysis: {
      insights: string;
    };
    experience_match: {
      score: number;
      analysis: string;
    };
    qualification_match: {
      score: number;
      analysis: string;
    };
    cultural_fit: {
      score: number;
      analysis: string;
    };
    career_trajectory: {
      score: number;
      analysis: string;
    };
  };
}

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
              error
            );
          }
        }
      }
      return "resumes";
    }
  );
  const [selectedFile, setSelectedFile] = useState<DocumentBasicInfo | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  useEffect(() => {
    setFileFromSession();
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
          error
        );
      }
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row flex-1 w-full">
      <div
        className={`flex flex-col ${
          selectedFile ? "w-1/2" : "w-full"
        } h-full transition-all duration-500 ease-in-out`}
      >
        <div className="flex-shrink-0 mt-6 px-1 max-w-[95%]">
          <DocsHeader
            documentType={documentType}
            setDocumentType={setDocumentType}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-1">
          {analysisResult ? (
            <div className="p-4">
              <div className="mb-4">
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="text-[#636AE8] hover:text-[#4f56d4] flex items-center gap-2 font-medium"
                >
                  Back to Documents
                </button>
              </div>
              <ResumeAnalysisResults result={analysisResult} />
            </div>
          ) : (
            <FileGrid
              documentType={documentType}
              onFileSelect={(file: DocumentBasicInfo) => setSelectedFile(file)}
              selectedFile={selectedFile}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>
      {selectedFile && (
        <div className="flex-1 flex-shrink-0 animate-in slide-in-from-right duration-300">
          {React.createElement(DocxViewer as any, {
            selectedFile: selectedFile,
            setSelectedFile: setSelectedFile,
            onAnalysisComplete: (result: AnalysisResult) => setAnalysisResult(result),
          })}
        </div>
      )}
    </div>
  );
};

export default Page;
