import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileX } from "lucide-react";
import { CreateFileModal } from "./modals/CreateFileModal";
import FileCard from "./file-card";
import { useEffect, useState, useMemo } from "react";
import { DocumentBasicInfo } from "@/types/docs";
import { deleteDocument } from "@/app/docs/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";

interface FileGridProps {
  documentType: "resumes" | "coverLetters";
  onFileSelect: (fileUrl: string, fileName: string, filePath: string) => void;
  selectedFile?: { url: string; name: string; filePath: string } | null;
  searchTerm?: string;
}

const FileGrid = ({
  documentType,
  onFileSelect,
  selectedFile,
  searchTerm,
}: FileGridProps) => {
  const [files, setFiles] = useState<DocumentBasicInfo[]>();
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Floating Results Dock - Show when search is active */}
      {searchTerm && searchTerm.trim() && files && files.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-lg backdrop-blur-sm bg-opacity-95 animate-in slide-in-from-bottom duration-300">
          <p className="text-sm text-gray-700 whitespace-nowrap">
            {filteredFiles.length > 0 ? (
              <>
                Showing{" "}
                <span className="font-semibold text-blue-600">
                  {filteredFiles.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {files.length}
                </span>{" "}
                {files.length === 1 ? "result" : "results"}
                <span className="ml-1">
                  for &quot;
                  <span className="font-medium text-gray-900">
                    {searchTerm}
                  </span>
                  &quot;
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-orange-600">
                  No results found
                </span>{" "}
                for &quot;
                <span className="font-medium text-gray-900">{searchTerm}</span>
                &quot;
              </>
            )}
          </p>
        </div>
      )}

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
