interface Template {
  id: string;
  userId: string;
  name: string;
  type: string;
  content: string;
  filePath?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
