import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { File, MoreVertical, Plus, Trash2 } from "lucide-react";
import { CreateFileModal } from "./modals/CreateFileModal";
import { useEffect, useState } from "react";
import {
  getAllDocuments,
  type GetAllDocumentsResult,
} from "@/app/docs/actions";
import { Skeleton } from "@/components/ui/skeleton";

interface FileGridProps {
  documentType: "resumes" | "coverLetters";
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

const FileGrid = ({ documentType }: FileGridProps) => {
  const [files, setFiles] = useState<DocumentFile[]>();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch documents from the server

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

  const getUploadText = () => {
    return documentType === "resumes" ? "Resume" : "Cover Letter";
  };

  return (
    <div className="p-6  min-h-screen">
      <div className="grid mt-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 p-1">
        <CreateFileModal
          documentType={documentType}
          onSubmit={handleFileUpload}
        >
          <Card className="max-w-[200px] group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/30">
            <CardContent className="p-0 size-full">
              <div className="p-3 min-h-36 size-full flex flex-col items-center justify-center hover:text-blue-500">
                <h3 className="text-sm font-medium mb-1">
                  Upload New {getUploadText()}
                </h3>
                <Plus />
              </div>
            </CardContent>
          </Card>
        </CreateFileModal>

        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 20 }).map((_, index) => (
            <Card key={index} className="max-w-[200px] shadow-lg overflow-clip">
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
          <div>No files found.</div>
        ) : (
          files.map((file) => (
            <Card
              key={file.id}
              className="group pb-2 pt-0 max-w-[200px]  shadow-lg overflow-clip"
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
                  <Trash2 className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
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
