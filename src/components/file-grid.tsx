import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileX } from "lucide-react";
import { CreateFileModal } from "./modals/CreateFileModal";
import FileCard from "./file-card";
import { useEffect, useState, useMemo } from "react";
import { DocumentBasicInfo } from "@/types/docs";
import { deleteDocument } from "@/app/(protected)/docs/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import SearchResultsDock from "./search-results-dock";

interface FileGridProps {
  documentType: "resumes" | "coverLetters";
  onFileSelect: (file: DocumentBasicInfo) => void;
  selectedFile?: DocumentBasicInfo | null;
  searchTerm?: string;
  shouldShowUploadModal?: boolean;
  onModalClose?: () => void;
}

const FileGrid = ({
  documentType,
  onFileSelect,
  selectedFile,
  searchTerm,
  shouldShowUploadModal = false,
  onModalClose,
}: FileGridProps) => {
  const [files, setFiles] = useState<DocumentBasicInfo[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetch(`/api/docs?type=${documentType}`).then((res) =>
        res.json()
      );
      if (result && result.success) {
        setFiles(result.data || []);
      } else {
        console.error("Failed to fetch documents:", result.error);
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setFiles([]);
    } finally {
      setIsLoading(false);
      console.log("Fetch documents completed");
    }
  }, [documentType]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Trigger modal when shouldShowUploadModal is true
  useEffect(() => {
    if (shouldShowUploadModal && !isLoading && files) {
      setIsModalOpen(true);
    }
  }, [shouldShowUploadModal, isLoading, files]);

  const handleFileUpload = () => {
    fetchDocuments();
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    const result = await deleteDocument(fileId, filePath, documentType);

    if (result.success) {
      // Refresh the file list
      fetchDocuments();
    } else {
      console.error("Failed to delete document:", result.error);
      // You could add a toast notification here to show the error to the user
    }
  };

  const handleModalClose = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
    if (!isOpen && onModalClose) {
      onModalClose();
    }
  };

  const getUploadText = () => {
    return documentType === "resumes" ? "Resume" : "Cover Letter";
  };

  const filteredFiles = useMemo(() => {
    if (!files) return [];
    const q = (searchTerm || "").toLowerCase().trim();
    if (!q) return files;
    return files.filter((f) => f.file_name.toLowerCase().includes(q));
  }, [files, searchTerm]);

  return (
    <div
      className={`${selectedFile ? "p-2" : "p-6"}  min-h-screen relative`}
      style={{ scrollbarWidth: "thin", msScrollbarTrackColor: "transparent" }}
    >
      <SearchResultsDock
        searchTerm={searchTerm || ""}
        filteredCount={filteredFiles.length}
        totalCount={files?.length || 0}
        itemType="result"
      />

      <div
        className={`grid mt-6 ${
          selectedFile
            ? "grid-cols-3 "
            : "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
        } gap-6 p-1`}
      >
        {files && files.length > 0 && (
          <CreateFileModal
            documentType={documentType}
            onSubmit={handleFileUpload}
            open={isModalOpen}
            onOpenChange={handleModalClose}
          >
            <Card className="max-w-[170px] group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30">
              <CardContent className="p-0 size-full">
                <div className="p-3 min-h-42 size-full flex flex-col items-center justify-center hover:text-blue-500">
                  <h3 className="text-sm font-medium mb-1 text-center">
                    Upload New {getUploadText()}
                  </h3>
                  <Plus />
                </div>
              </CardContent>
            </Card>
          </CreateFileModal>
        )}

        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 20 }).map((_, index) => (
            <Card key={index} className="max-w-[170px] shadow-lg overflow-clip">
              <CardContent className="!p-0">
                <div className="min-h-32 rounded-t-lg bg-gray-50">
                  <Skeleton className="w-full h-32" />
                </div>
                <div className="p-3">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : !files || files.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <FileX className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {documentType === "resumes" ? "resumes" : "cover letters"} yet
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Get started by uploading your first{" "}
              {documentType === "resumes" ? "resume" : "cover letter"}. You can
              easily manage and organize all your documents in one place.
            </p>
            <CreateFileModal
              documentType={documentType}
              onSubmit={handleFileUpload}
              open={isModalOpen}
              onOpenChange={handleModalClose}
            >
              <Button className="flex items-center gap-2 px-6 py-3 bg-[#636AE8] hover:bg-[#4e57c1] text-white rounded-lg transition-colors font-medium">
                <Plus className="w-5 h-5" />
                Upload {documentType === "resumes" ? "Resume" : "Cover Letter"}
              </Button>
            </CreateFileModal>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onFileSelect={onFileSelect}
              handleDeleteFile={handleDeleteFile}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FileGrid;
