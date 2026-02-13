import { relations } from "drizzle-orm/relations";
import {
  columns,
  coverLetters,
  resumes,
  jobApplications,
} from "./schema";

export const columnsRelations = relations(columns, ({ many }) => ({
  jobApplications: many(jobApplications),
}));

export const coverLettersRelations = relations(coverLetters, ({ many }) => ({
  jobApplications: many(jobApplications),
}));

export const resumesRelations = relations(resumes, ({ many }) => ({
  jobApplications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(
  jobApplications,
  ({ one }) => ({
    column: one(columns, {
      fields: [jobApplications.columnId],
      references: [columns.id],
    }),
    coverLetter: one(coverLetters, {
      fields: [jobApplications.coverLetterId],
      references: [coverLetters.id],
    }),
    resume: one(resumes, {
      fields: [jobApplications.resumeId],
      references: [resumes.id],
    }),
  })
);
