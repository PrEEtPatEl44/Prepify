"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export default function FileUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const { user } = useUser();

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadResult(null); // Reset previous results
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setUploadResult({
        success: false,
        error: "Please select a file first",
      });
      return;
    }

    if (!user?.id) {
      setUploadResult({
        success: false,
        error: "User not authenticated",
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `${user?.id}/${timestamp}_${file.name}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from("documents") // Change bucket name as needed
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from("documents")
        .createSignedUrl(data.path, 60);

      //console.log("url:", urlData);
      if (urlData) {
        setUploadResult({
          success: true,
          url: urlData.signedUrl,
        });
      } else {
        setUploadResult({
          success: false,
          error: "Failed to get public URL",
        });
      }

      // Reset file input
      setFile(null);
      const fileInput = document.getElementById(
        "file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: unknown) {
      console.error("Upload error:", error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          File Upload Test
        </h1>
        <p className="text-gray-600">Upload files to Supabase Storage</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="file-input"
            className="block text-sm font-medium text-gray-700"
          >
            Choose File
          </label>
          <Input
            id="file-input"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            className="w-full"
            disabled={uploading}
          />
        </div>

        {file && (
          <div className="p-3 bg-gray-50 rounded-md border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {file.type}
                </p>
              </div>
              <Button
                onClick={() => {
                  setFile(null);
                  const fileInput = document.getElementById(
                    "file-input"
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                variant="ghost"
                size="sm"
                disabled={uploading}
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        <Button
          onClick={uploadFile}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            "Upload File"
          )}
        </Button>
      </Card>

      {uploadResult && (
        <Card
          className={`p-4 ${
            uploadResult.success
              ? "border-green-200 bg-green-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          {uploadResult.success ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-2 h-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-800">
                  File uploaded successfully!
                </p>
              </div>
              {uploadResult.url && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-green-700">Public URL:</p>
                    <a
                      href={uploadResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {uploadResult.url}
                    </a>
                  </div>

                  {/* File Preview */}
                  <div className="space-y-2">
                    <p className="text-xs text-green-700">File Preview:</p>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <iframe
                        src={uploadResult.url}
                        className="w-full h-96"
                        title="Uploaded file preview"
                        style={{
                          border: "none",
                          minHeight: "400px",
                        }}
                        onError={(e) => {
                          console.error("Iframe loading error:", e);
                          e.currentTarget.style.display = "none";
                          const errorDiv = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = "block";
                        }}
                      />
                      <div
                        className="hidden p-4 text-center text-sm text-gray-500 bg-gray-50"
                        style={{ display: "none" }}
                      >
                        <p>🚫 Cannot preview this file type in browser</p>
                        <p className="text-xs mt-1">
                          Click the URL above to download or view in a new tab
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <svg
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-red-800">
                Upload failed: {uploadResult.error}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Debug Information */}
      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-800">🔍 Debug Info:</h3>
          <div className="text-xs text-gray-700 space-y-1">
            <p>
              <strong>User ID:</strong> {user?.id || "Not authenticated"}
            </p>
            <p>
              <strong>User Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Auth Status:</strong>{" "}
              {user ? "✅ Authenticated" : "❌ Not authenticated"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-red-50 border-red-200">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-red-800">
            🚨 RLS Policy Error Solution:
          </h3>
          <div className="text-xs text-red-700 space-y-1">
            <p>
              If you get &quot;new row violates row-level security policy&quot;
              error:
            </p>
          </div>
          <div className="mt-2 p-3 bg-gray-900 rounded text-xs text-green-400 overflow-x-auto">
            <pre>{`-- Run this SQL in Supabase SQL Editor:

-- Create storage policies for 'documents' bucket
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users view own files" ON storage.objects  
FOR SELECT TO authenticated USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);`}</pre>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-blue-800">📝 Notes:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • Files are uploaded to the &apos;documents&apos; bucket in
              Supabase Storage
            </li>
            <li>
              • Supported formats: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF
            </li>
            <li>• Files are organized by user ID in folders</li>
            <li>
              • Make sure your Supabase Storage bucket &apos;documents&apos;
              exists
            </li>
            <li>• Ensure proper RLS policies are set for the bucket</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
