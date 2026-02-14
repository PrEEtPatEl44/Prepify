import { pgTable, index, pgPolicy, uuid, text, varchar, integer, timestamp, jsonb, check, foreignKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const applicationStatus = pgEnum("application_status", ['WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED'])
export const employmentType = pgEnum("employment_type", ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE', 'FREELANCE'])


export const columns = pgTable("columns", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	userId: uuid("user_id").notNull(),
	color: varchar({ length: 7 }).default('#6B7280').notNull(),
}, (table) => [
	index("idx_columns_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Enable insert for users based on user_id", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(( SELECT auth.uid() AS uid) = user_id)`  }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Enable users to view their own data only", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("Users can update their own columns", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
]);

export const resumes = pgTable("resumes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size"),
	mimeType: text("mime_type"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	resumeData: jsonb("resume_data"),
}, (table) => [
	index("idx_resumes_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Enable users to view their own data only", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Policy with table joins", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable insert for users based on user_id", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const coverLetters = pgTable("cover_letters", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size"),
	mimeType: text("mime_type"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_cover_letters_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Enable users to view their own data only", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(( SELECT auth.uid() AS uid) = user_id)` }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable insert for users based on user_id", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Users can update their own cover_letters", { as: "permissive", for: "update", to: ["public"] }),
]);

export const templates = pgTable("templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	content: text().notNull(),
	filePath: varchar("file_path", { length: 500 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_templates_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("idx_templates_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	pgPolicy("Users can delete own templates", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() = user_id)` }),
	pgPolicy("Users can read own templates", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("Users can insert own templates", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Users can update own templates", { as: "permissive", for: "update", to: ["authenticated"] }),
	check("templates_type_check", sql`(type)::text = ANY ((ARRAY['resume'::character varying, 'cover_letter'::character varying])::text[])`),
]);

export const jobApplications = pgTable("job_applications", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	companyName: varchar("company_name", { length: 255 }).notNull(),
	jobTitle: varchar("job_title", { length: 255 }).notNull(),
	jobDescription: text("job_description"),
	jobUrl: text("job_url"),
	resumeId: uuid("resume_id"),
	coverLetterId: uuid("cover_letter_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	columnId: uuid("column_id"),
	companyDomain: text("company_domain"),
}, (table) => [
	index("idx_job_applications_company").using("btree", table.companyName.asc().nullsLast().op("text_ops")),
	index("idx_job_applications_cover_letter_id").using("btree", table.coverLetterId.asc().nullsLast().op("uuid_ops")),
	index("idx_job_applications_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_job_applications_resume_id").using("btree", table.resumeId.asc().nullsLast().op("uuid_ops")),
	index("idx_job_applications_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.columnId],
			foreignColumns: [columns.id],
			name: "job_applications_column_id_columns_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.coverLetterId],
			foreignColumns: [coverLetters.id],
			name: "job_applications_cover_letter_id_cover_letters_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.resumeId],
			foreignColumns: [resumes.id],
			name: "job_applications_resume_id_resumes_id_fk"
		}).onDelete("set null"),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true`  }),
	pgPolicy("Enable insert for users based on user_id", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["public"] }),
	pgPolicy("Users can update their own job_applications", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Enable users to view their own data only", { as: "permissive", for: "select", to: ["authenticated"] }),
]);
