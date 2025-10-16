import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { File, MoreVertical, Trash2 } from "lucide-react";
import { DeleteDocModal } from "./modals/DeleteDocModal";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";

interface FileCardProps {
  file: DocumentBasicInfo;
  deletable?: boolean;
  onFileSelect: (file: DocumentBasicInfo) => void;
  handleDeleteFile: (fileId: string, filePath: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  onFileSelect,
  handleDeleteFile,
  deletable = true,
}) => {
  const supabase = createClient();
  return (
    <Card
      key={file.id}
      className="group pb-2 pt-0 max-w-[170px] shadow-lg overflow-clip cursor-pointer hover:shadow-xl transition-shadow"
      onClick={async () => {
        onFileSelect(file);
      }}
    >
      <CardContent className="!p-0 ">
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
            {deletable && (
            <DeleteDocModal
              fileName={file.file_name}
              onDelete={() => handleDeleteFile(file.id, file.file_path)}
            >
              <button className="flex-shrink-0">
                <Trash2 className="w-5 h-5 mt-2 text-gray-500 hover:text-red-600 cursor-pointer transition-colors" />
              </button>
            </DeleteDocModal>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCard;
