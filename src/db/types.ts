import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  columns,
  coverLetters,
  resumes,
  jobApplications,
  templates,
} from "./schema";

// Select types (what you get back from queries)
export type Column = InferSelectModel<typeof columns>;
export type CoverLetter = InferSelectModel<typeof coverLetters>;
export type Resume = InferSelectModel<typeof resumes>;
export type JobApplication = InferSelectModel<typeof jobApplications>;
export type Template = InferSelectModel<typeof templates>;

// Insert types (what you pass to insert)
export type NewColumn = InferInsertModel<typeof columns>;
export type NewCoverLetter = InferInsertModel<typeof coverLetters>;
export type NewResume = InferInsertModel<typeof resumes>;
export type NewJobApplication = InferInsertModel<typeof jobApplications>;
export type NewTemplate = InferInsertModel<typeof templates>;
