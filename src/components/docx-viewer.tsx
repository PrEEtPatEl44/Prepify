"use client";

import { useRef, useState, useEffect } from "react";
import { File, Download, X, Sparkles } from "lucide-react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { createClient } from "@/utils/supabase/client";
import { DocumentBasicInfo } from "@/types/docs";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

DocumentEditorContainerComponent.Inject(Toolbar);

import { registerLicense } from "@syncfusion/ej2-base";

if (process.env.NEXT_PUBLIC_SYNCFUSION_KEY) {
  registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_KEY);
} else {
  console.warn("Syncfusion license key is not set.");
}

interface ViewerProps {
  selectedFile: DocumentBasicInfo | null;
  setSelectedFile: (file: DocumentBasicInfo | null) => void;
}

const DocxViewer = ({ selectedFile, setSelectedFile }: ViewerProps) => {
  const editorRef = useRef<DocumentEditorContainerComponent>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setOpen } = useSidebar();

  // Handle document change event to apply fitPage and stop loading
  const onDocumentChange = () => {
    if (editorRef.current) {
      editorRef.current.documentEditor.fitPage("FitPageWidth");
      // Document is loaded and rendered, stop loading
      setIsLoading(false);
      setOpen(false);
    }
  };

  // Method 1: Load from Supabase Storage by file path
  const loadFromSupabase = async (bucketName: string, filePath: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Download the file from Supabase
      const { data, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (downloadError) throw downloadError;

      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(data);

      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];

        // Use Syncfusion's import method
        if (editorRef.current) {
          editorRef.current.documentEditor.open(base64Data);
          // Note: Loading state will be set to false in onDocumentChange event
        }
      };
    } catch (err) {
      console.error("Error loading document:", err);
      setIsLoading(false); // Stop loading on error
    }
  };

  function handleClose() {
    setOpen(true);
    setSelectedFile(null);
  }

  useEffect(() => {
    if (selectedFile) {
      loadFromSupabase("documents", selectedFile.file_path);
    }
  }, [selectedFile]);

  return (
    <div
      className="h-screen min-w-fit flex flex-col bg-[#171A1F66] shadow-2xl overflow-y-scroll scrollbar-hide"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="sticky top-0 z-10 p-3 bg-gray-100 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="p-2">
            <File className="h-6 w-6 text-[#636AE8]" />
          </div>
          <span className="text-lg">{selectedFile?.file_name}</span>
        </div>
        <div className="flex gap-2 items-center">
          <a className="p-1 rounded-full hover:bg-white/20">
            <Download className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer" />
          </a>
          <X
            className="h-6 w-6 text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={() => handleClose()}
          />
        </div>
      </div>

      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#636AE8] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading document...</p>
            </div>
          </div>
        )}

          {/* Get Score Button Overlay */}
          {!isLoading && (
            <div className="absolute bottom-12 bg-black/50 right-0 z-40 p-2 rounded-l-lg">
              <Button
                size="sm"
                className="bg-[#636AE8] hover:bg-[#4f56d4] text-white shadow-lg transition-all duration-200 mr-5"
                onClick={handleGetATSScore}
                disabled={isAnalyzing}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Get ATS Score
              </Button>
            </div>
          )}

        <DocumentEditorContainerComponent
          ref={editorRef}
          className="min-w-fit mx-auto gap-4 !max-w-2xl"
          id="container"
          enableToolbar={false}
          height="100%"
          showPropertiesPane={false}
          serviceUrl={process.env.NEXT_PUBLIC_SYNCFUSION_SERVICE_URL}
          readOnly={true}
          restrictEditing={true}
          documentChange={onDocumentChange}
        />
      </div>
    </div>
  );
};
export default DocxViewer;
