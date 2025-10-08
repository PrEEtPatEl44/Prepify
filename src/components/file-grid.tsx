import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { File, MoreVertical, Plus, Trash2, FileX } from "lucide-react";
import { CreateFileModal } from "./modals/CreateFileModal";
import { DeleteDocModal } from "./modals/DeleteDocModal";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  getAllDocuments,
  deleteDocument,
  type GetAllDocumentsResult,
} from "@/app/docs/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";

interface FileGridProps {
  documentType: "resumes" | "coverLetters";
  onFileSelect: (fileUrl: string, fileName: string) => void;
  selectedFile?: { url: string; name: string } | null;
}

interface DocumentFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

const FileGrid = ({
  documentType,
  onFileSelect,
  selectedFile,
}: FileGridProps) => {
  const [files, setFiles] = useState<DocumentFile[]>();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch documents from the server
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result: GetAllDocumentsResult = await getAllDocuments(documentType);

      if (result.success && result.data) {
        setFiles(result.data);
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

  return (
    <div
      className={`${selectedFile ? "p-2" : "p-6"}  min-h-screen `}
      style={{ scrollbarWidth: "thin", msScrollbarTrackColor: "transparent" }}
    >
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
                  <h3 className="text-sm font-medium mb-1">
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
          files.map((file) => (
            <Card
              key={file.id}
              className="group pb-2 pt-0 max-w-[170px] shadow-lg overflow-clip cursor-pointer hover:shadow-xl transition-shadow"
              onClick={async () => {
                const { data, error } = await supabase.storage
                  .from("documents")
                  .createSignedUrl(file.file_path, 60 * 60);

                if (error || !data) {
                  console.error(
                    "Failed to create signed URL for file:",
                    file,
                    error
                  );
                  return;
                }

                onFileSelect(data.signedUrl, file.file_name);
              }}
            >
              <CardContent className="!p-0">
                {/* Thumbnail Area */}
                <div className="relative min-h-36 rounded-t-lg flex items-center justify-center bg-gray-50 ">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded-full hover:bg-white/20">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <File className="w-6 h-6 text-blue-500" />
                </div>

                {/* File Info */}
                <div className="p-3 flex justify-between items-center">
                  <h3
                    className="text-sm w-full font-medium text-gray-900 truncate "
                    title={file.file_name}
                  >
                    {file.file_name}
                  </h3>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DeleteDocModal
                      fileName={file.file_name}
                      onDelete={() => handleDeleteFile(file.id, file.file_path)}
                    >
                      <button className="flex-shrink-0">
                        <Trash2 className="w-5 h-5 mt-2 text-gray-500 hover:text-red-600 cursor-pointer transition-colors" />
                      </button>
                    </DeleteDocModal>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FileGrid;
