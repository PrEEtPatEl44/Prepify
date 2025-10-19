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
  documentType?: "resumes" | "coverLetters";
}

interface GetDocumentInfoResult {
  success: boolean;
  data?: DocumentBasicInfo[];
  error?: string;
}

interface UploadDocumentResult {
  success: boolean;
  data?: {
    id: string;
    url: string;
    filePath: string;
  };
  error?: string;
  message?: string;
}

export type {
  GetAllDocumentsResult,
  DeleteDocumentResult,
  GetDocumentInfoResult,
  DocumentBasicInfo,
  UploadDocumentResult,
};
