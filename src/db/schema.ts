import {
  pgTable,
  uuid,
  text,
  varchar,
  index,
  integer,
  timestamp,
  jsonb,
  check,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const applicationStatus = pgEnum("application_status", [
  "WISHLIST",
  "APPLIED",
  "PHONE_SCREEN",
  "TECHNICAL_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "REJECTED",
]);

export const employmentType = pgEnum("employment_type", [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "REMOTE",
  "FREELANCE",
]);

export const columns = pgTable(
  "columns",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: text().notNull(),
    userId: uuid("user_id").notNull(),
    color: varchar({ length: 7 }).default("#6B7280").notNull(),
  },
  (table) => [
    index("idx_columns_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
  ]
);

export const coverLetters = pgTable(
  "cover_letters",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_cover_letters_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
  ]
);

export const resumes = pgTable(
  "resumes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
    resumeData: jsonb("resume_data"),
  },
  (table) => [
    index("idx_resumes_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
  ]
);

export const jobApplications = pgTable(
  "job_applications",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    jobDescription: text("job_description"),
    jobUrl: text("job_url"),
    resumeId: uuid("resume_id").references(() => resumes.id, {
      onDelete: "set null",
    }),
    coverLetterId: uuid("cover_letter_id").references(() => coverLetters.id, {
      onDelete: "set null",
    }),
    aiMatchScore: numeric("ai_match_score", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    columnId: uuid("column_id").references(() => columns.id, {
      onDelete: "set null",
    }),
    companyDomain: text("company_domain"),
  },
  (table) => [
    index("idx_job_applications_company").using(
      "btree",
      table.companyName.asc().nullsLast().op("text_ops")
    ),
    index("idx_job_applications_cover_letter_id").using(
      "btree",
      table.coverLetterId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_job_applications_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("idx_job_applications_resume_id").using(
      "btree",
      table.resumeId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_job_applications_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    check(
      "job_applications_ai_match_score_check",
      sql`(ai_match_score >= (0)::numeric) AND (ai_match_score <= (100)::numeric)`
    ),
    check(
      "valid_ai_score",
      sql`(ai_match_score IS NULL) OR ((ai_match_score >= (0)::numeric) AND (ai_match_score <= (100)::numeric))`
    ),
  ]
);

export const templates = pgTable(
  "templates",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 50 }).notNull(),
    content: text().notNull(),
    filePath: varchar("file_path", { length: 500 }),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => [
    index("idx_templates_type").using(
      "btree",
      table.type.asc().nullsLast().op("text_ops")
    ),
    index("idx_templates_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    check(
      "templates_type_check",
      sql`(type)::text = ANY ((ARRAY['resume'::character varying, 'cover_letter'::character varying])::text[])`
    ),
  ]
);

export const interviewFeedback = pgTable(
  "interview_feedback",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobApplications.id, { onDelete: "cascade" }),
    overallScore: integer("overall_score").notNull(),
    generalComments: text("general_comments"),
    questionsFeedback: jsonb("questions_feedback").notNull(),
    interviewDuration: integer("interview_duration"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
    difficulty: text().default("easy").notNull(),
    type: text().default("technical").notNull(),
  },
  (table) => [
    index("idx_interview_feedback_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("idx_interview_feedback_job_id").using(
      "btree",
      table.jobId.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_interview_feedback_questions").using(
      "gin",
      table.questionsFeedback.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_interview_feedback_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    check(
      "interview_feedback_difficulty_check",
      sql`difficulty = ANY (ARRAY['easy'::text, 'intermediate'::text, 'hard'::text])`
    ),
    check(
      "interview_feedback_overall_score_check",
      sql`(overall_score >= 0) AND (overall_score <= 100)`
    ),
    check(
      "interview_feedback_type_check",
      sql`type = ANY (ARRAY['technical'::text, 'behavioral'::text, 'mixed'::text])`
    ),
  ]
);
