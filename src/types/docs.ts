interface InsertDocumentResult {
  success: boolean;
  data?: {
    id: string;
  };
  error?: string;
}

interface DocumentRecordData {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: "resumes" | "coverLetters";
}

interface GetAllDocumentsResult {
  success: boolean;
  data?: {
    id: string;
    user_id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: string;
    updated_at: string;
  }[];
  error?: string;
}

interface DeleteDocumentResult {
  success: boolean;
  error?: string;
}

interface DocumentBasicInfo {
  id: string;
  file_name: string;
  file_path: string;
}

interface GetDocumentInfoResult {
  success: boolean;
  data?: DocumentBasicInfo[];
  error?: string;
}

export type {
  InsertDocumentResult,
  DocumentRecordData,
  GetAllDocumentsResult,
  DeleteDocumentResult,
  GetDocumentInfoResult,
  DocumentBasicInfo,
};
