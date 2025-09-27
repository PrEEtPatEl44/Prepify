"use client";
import React from "react";
import { useState } from "react";
import DocsHeader from "@/components/documents-header";
import { Button } from "@/components/ui/button";
const Page = () => {
  const [documentType, setDocumentType] = useState<"resumes" | "coverLetters">(
    "resumes"
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden  w-full max-w-[75%]">
      <div className="mt-6 px-1 ">
        <DocsHeader
          documentType={documentType}
          setDocumentType={setDocumentType}
        />
      </div>
      <div className="flex flex-1 overflow-hidden px-4 min-w-full">
        <div className="flex flex-col items-center justify-center flex-1">
          <h2 className="text-2xl font-semibold mb-2">No Documents Yet</h2>
          <p className="text-gray-600 mb-6 text-center">
            Start by creating a new resume or cover letter to manage your job
            applications more effectively.
          </p>
          <div className="flex gap-4">
            <Button className="bg-[#636AE8] hover:bg-[#4F46E5]">
              Create Resume
            </Button>
            <Button className="bg-[#636AE8] hover:bg-[#4F46E5]">
              Create Cover Letter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
