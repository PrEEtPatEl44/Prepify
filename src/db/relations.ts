import { relations } from "drizzle-orm/relations";
import {
  columns,
  coverLetters,
  resumes,
  jobApplications,
  interviewFeedback,
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
  ({ one, many }) => ({
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
    interviewFeedbacks: many(interviewFeedback),
  })
);

export const interviewFeedbackRelations = relations(
  interviewFeedback,
  ({ one }) => ({
    jobApplication: one(jobApplications, {
      fields: [interviewFeedback.jobId],
      references: [jobApplications.id],
    }),
  })
);
