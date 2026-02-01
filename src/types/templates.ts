interface Template {
  id: string;
  user_id: string;
  name: string;
  type: "resume" | "cover_letter";
  content: string;
  file_path?: string;
  created_at: string;
  updated_at: string;
}

interface GetAllTemplatesResult {
  success: boolean;
  data?: Template[];
  error?: string;
}

interface CreateTemplateResult {
  success: boolean;
  data?: Template;
  error?: string;
}

interface UpdateTemplateResult {
  success: boolean;
  data?: Template;
  error?: string;
}

interface DeleteTemplateResult {
  success: boolean;
  error?: string;
}

export type {
  Template,
  GetAllTemplatesResult,
  CreateTemplateResult,
  UpdateTemplateResult,
  DeleteTemplateResult,
};
