-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."application_status" AS ENUM('WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE', 'FREELANCE');--> statement-breakpoint
CREATE TABLE "columns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid NOT NULL,
	"color" varchar(7) DEFAULT '#6B7280' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "columns" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "cover_letters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cover_letters" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"resume_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "resumes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"job_description" text,
	"job_url" text,
	"resume_id" uuid,
	"cover_letter_id" uuid,
	"ai_match_score" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"column_id" uuid,
	"company_domain" text,
	CONSTRAINT "job_applications_ai_match_score_check" CHECK ((ai_match_score >= (0)::numeric) AND (ai_match_score <= (100)::numeric)),
	CONSTRAINT "valid_ai_score" CHECK ((ai_match_score IS NULL) OR ((ai_match_score >= (0)::numeric) AND (ai_match_score <= (100)::numeric)))
);
--> statement-breakpoint
ALTER TABLE "job_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"file_path" varchar(500),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "templates_type_check" CHECK ((type)::text = ANY ((ARRAY['resume'::character varying, 'cover_letter'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "interview_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"general_comments" text,
	"questions_feedback" jsonb NOT NULL,
	"interview_duration" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"difficulty" text DEFAULT 'easy' NOT NULL,
	"type" text DEFAULT 'technical' NOT NULL,
	CONSTRAINT "interview_feedback_difficulty_check" CHECK (difficulty = ANY (ARRAY['easy'::text, 'intermediate'::text, 'hard'::text])),
	CONSTRAINT "interview_feedback_overall_score_check" CHECK ((overall_score >= 0) AND (overall_score <= 100)),
	CONSTRAINT "interview_feedback_type_check" CHECK (type = ANY (ARRAY['technical'::text, 'behavioral'::text, 'mixed'::text]))
);
--> statement-breakpoint
ALTER TABLE "interview_feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "columns" ADD CONSTRAINT "fk_columns_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "fk_job_applications_column" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "fk_job_applications_cover_letter" FOREIGN KEY ("cover_letter_id") REFERENCES "public"."cover_letters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "fk_job_applications_resume" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cover_letters_user_id" ON "cover_letters" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_resumes_user_id" ON "resumes" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_company" ON "job_applications" USING btree ("company_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_cover_letter_id" ON "job_applications" USING btree ("cover_letter_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_created_at" ON "job_applications" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_resume_id" ON "job_applications" USING btree ("resume_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_search" ON "job_applications" USING gin (to_tsvector('english'::regconfig, (((((company_name)::text || ' tsvector_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_user_id" ON "job_applications" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_templates_type" ON "templates" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_templates_user_id" ON "templates" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_interview_feedback_created_at" ON "interview_feedback" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_interview_feedback_job_id" ON "interview_feedback" USING btree ("job_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_interview_feedback_questions" ON "interview_feedback" USING gin ("questions_feedback" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_interview_feedback_user_id" ON "interview_feedback" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "User can do CRUD operations on columns table" ON "columns" AS PERMISSIVE FOR ALL TO public USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));--> statement-breakpoint
CREATE POLICY "User can peform CRUD Ops on cover_letters" ON "cover_letters" AS PERMISSIVE FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "User can peform CRUD Ops on resumes" ON "resumes" AS PERMISSIVE FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view their own job applications" ON "job_applications" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own job applications" ON "job_applications" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own job applications" ON "job_applications" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own job applications" ON "job_applications" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own interview feedback" ON "interview_feedback" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can insert their own interview feedback" ON "interview_feedback" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own interview feedback" ON "interview_feedback" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own interview feedback" ON "interview_feedback" AS PERMISSIVE FOR DELETE TO public;
*/