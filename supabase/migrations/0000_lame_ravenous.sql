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
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"job_description" text,
	"job_url" text,
	"resume_id" uuid,
	"cover_letter_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"column_id" uuid,
	"company_domain" text
);
--> statement-breakpoint
ALTER TABLE "job_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_cover_letter_id_cover_letters_id_fk" FOREIGN KEY ("cover_letter_id") REFERENCES "public"."cover_letters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_columns_user_id" ON "columns" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_resumes_user_id" ON "resumes" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_cover_letters_user_id" ON "cover_letters" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_templates_type" ON "templates" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_templates_user_id" ON "templates" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_company" ON "job_applications" USING btree ("company_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_cover_letter_id" ON "job_applications" USING btree ("cover_letter_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_created_at" ON "job_applications" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_resume_id" ON "job_applications" USING btree ("resume_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_applications_user_id" ON "job_applications" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Enable insert for users based on user_id" ON "columns" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));--> statement-breakpoint
CREATE POLICY "Enable delete for users based on user_id" ON "columns" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Enable users to view their own data only" ON "columns" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update their own columns" ON "columns" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "columns" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Enable users to view their own data only" ON "resumes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id));--> statement-breakpoint
CREATE POLICY "Enable delete for users based on user_id" ON "resumes" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Policy with table joins" ON "resumes" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "resumes" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Enable insert for users based on user_id" ON "resumes" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable users to view their own data only" ON "cover_letters" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((( SELECT auth.uid() AS uid) = user_id));--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "cover_letters" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Enable insert for users based on user_id" ON "cover_letters" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable delete for users based on user_id" ON "cover_letters" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own cover_letters" ON "cover_letters" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can delete own templates" ON "templates" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can read own templates" ON "templates" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can insert own templates" ON "templates" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Users can update own templates" ON "templates" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "job_applications" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable insert for users based on user_id" ON "job_applications" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Enable delete for users based on user_id" ON "job_applications" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own job_applications" ON "job_applications" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Enable users to view their own data only" ON "job_applications" AS PERMISSIVE FOR SELECT TO "authenticated";
*/