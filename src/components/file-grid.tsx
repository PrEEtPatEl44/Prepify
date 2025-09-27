import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  MoreVertical,
  Plus,
} from "lucide-react";

const FileGrid = () => {
  const files = [
    {
      id: 1,
      name: "Project Presentation.pptx",
      type: "presentation",
      size: "2.4 MB",
      modified: "2 days ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 2,
      name: "Budget Report Q4.xlsx",
      type: "spreadsheet",
      size: "856 KB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 3,
      name: "Team Photo.jpg",
      type: "image",
      size: "3.2 MB",
      modified: "3 days ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 4,
      name: "Marketing Video.mp4",
      type: "video",
      size: "45.6 MB",
      modified: "1 day ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 5,
      name: "Meeting Notes.docx",
      type: "document",
      size: "124 KB",
      modified: "5 hours ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 6,
      name: "Background Music.mp3",
      type: "audio",
      size: "5.8 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 7,
      name: "Archive Files.zip",
      type: "archive",
      size: "12.3 MB",
      modified: "2 weeks ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 8,
      name: "Database Backup.sql",
      type: "database",
      size: "89.4 MB",
      modified: "4 days ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 9,
      name: "Design Mockups.fig",
      type: "design",
      size: "7.2 MB",
      modified: "6 hours ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 10,
      name: "Client Contract.pdf",
      type: "pdf",
      size: "445 KB",
      modified: "3 days ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 11,
      name: "Code Repository.git",
      type: "code",
      size: "156 MB",
      modified: "2 hours ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 12,
      name: "Annual Report.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 13,
      name: "Annual Report.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 14,
      name: "Annual Report.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 15,
      name: "Annual Report.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 16,
      name: "Annual Report.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
    {
      id: 17,
      name: "Annual Report.docx",
      type: "document",
      size: "2.1 MB",
      modified: "1 week ago",
      thumbnail: "/api/placeholder/150/100",
    },
  ];

  const getFileIcon = (type: string) => {
    const iconClass = "w-6 h-6 text-blue-600";
    switch (type) {
      case "image":
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className={iconClass} />;
      case "video":
        return <Video className={iconClass} />;
      case "audio":
        return <Music className={iconClass} />;
      case "archive":
        return <Archive className={iconClass} />;
      case "document":
      case "presentation":
      case "spreadsheet":
      case "pdf":
        return <FileText className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-green-50 border-green-200";
      case "video":
        return "bg-red-50 border-red-200";
      case "audio":
        return "bg-purple-50 border-purple-200";
      case "document":
        return "bg-blue-50 border-blue-200";
      case "presentation":
        return "bg-orange-50 border-orange-200";
      case "spreadsheet":
        return "bg-green-50 border-green-200";
      case "archive":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-6  min-h-screen">
      <div className="grid mt-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50/30">
          <CardContent className="p-0">
            {/* Upload Area */}
            <div className="relative h-24 rounded-t-lg flex items-center justify-center bg-blue-50/50 group-hover:bg-blue-100/50 transition-colors">
              <div className="flex flex-col items-center">
                <div className="p-2 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Upload Info */}
            <div className="p-3 text-center">
              <h3 className="text-sm font-medium text-blue-700 mb-1">
                Upload Files
              </h3>
              <p className="text-xs text-blue-500">Click to add new files</p>
            </div>
          </CardContent>
        </Card>
        {files.map((file) => (
          <Card
            key={file.id}
            className="group hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white border border-gray-200 hover:border-gray-300"
          >
            <CardContent className="p-0">
              {/* Thumbnail Area */}
              <div
                className={`relative h-24 rounded-t-lg flex items-center justify-center ${getTypeColor(
                  file.type
                )}`}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {getFileIcon(file.type)}
              </div>

              {/* File Info */}
              <div className="p-3">
                <h3
                  className="text-sm font-medium text-gray-900 truncate mb-1"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{file.size}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{file.modified}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FileGrid;
