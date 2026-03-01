CREATE TYPE "public"."application_source" AS ENUM('referral', 'recruiter_inbound', 'recruiter_outbound', 'linkedin', 'job_board', 'vc_talent_network', 'direct_application', 'networking', 'conference', 'other');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('researching', 'applied', 'recruiter_screen', 'phone_interview', 'onsite', 'final_round', 'offer', 'negotiating', 'accepted', 'rejected', 'withdrawn', 'ghosted', 'on_hold');--> statement-breakpoint
CREATE TYPE "public"."company_priority" AS ENUM('dream', 'strong', 'interested', 'exploring', 'backburner');--> statement-breakpoint
CREATE TYPE "public"."company_size" AS ENUM('1_10', '11_50', '51_100', '101_250', '251_500', '501_1000', '1001_5000', '5001_plus');--> statement-breakpoint
CREATE TYPE "public"."company_stage" AS ENUM('seed', 'series_a', 'series_b', 'series_c', 'series_d_plus', 'growth', 'public', 'bootstrapped', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."contact_relationship" AS ENUM('recruiter_internal', 'recruiter_external', 'hiring_manager', 'peer', 'executive', 'board_member', 'investor', 'former_colleague', 'friend', 'cold_contact', 'other');--> statement-breakpoint
CREATE TYPE "public"."contact_warmth" AS ENUM('hot', 'warm', 'lukewarm', 'cold');--> statement-breakpoint
CREATE TYPE "public"."excitement_level" AS ENUM('5_dream_role', '4_very_excited', '3_interested', '2_lukewarm', '1_not_interested');--> statement-breakpoint
CREATE TYPE "public"."interaction_sentiment" AS ENUM('very_positive', 'positive', 'neutral', 'negative', 'very_negative');--> statement-breakpoint
CREATE TYPE "public"."interaction_type" AS ENUM('email_sent', 'email_received', 'linkedin_message_sent', 'linkedin_message_received', 'phone_call', 'video_call', 'coffee_chat', 'interview', 'follow_up', 'thank_you', 'intro_requested', 'intro_made', 'referral_given', 'informational', 'other');--> statement-breakpoint
CREATE TYPE "public"."remote_policy" AS ENUM('remote', 'hybrid', 'onsite', 'flexible', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('urgent', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'waiting', 'done', 'cancelled');--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"linkedin_url" text,
	"industry" text,
	"description" text,
	"stage" "company_stage" DEFAULT 'unknown',
	"size" "company_size",
	"employee_count" integer,
	"location" text,
	"remote_policy" "remote_policy" DEFAULT 'unknown',
	"funding_info" jsonb,
	"priority" "company_priority" DEFAULT 'exploring',
	"tags" text[],
	"data_maturity" text,
	"ceo_background" text,
	"tech_leadership" jsonb,
	"research_notes" text,
	"status" text DEFAULT 'active',
	"passed_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"linkedin_url" text,
	"title" text,
	"current_company" text,
	"company_id" uuid,
	"relationship" "contact_relationship" DEFAULT 'other',
	"warmth" "contact_warmth" DEFAULT 'cold',
	"introduced_by" uuid,
	"notes" text,
	"tags" text[],
	"how_met" text,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"follow_up_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"role_title" text NOT NULL,
	"role_level_confirmed" text,
	"job_posting_url" text,
	"job_description" text,
	"department" text,
	"reports_to" text,
	"team_size" text,
	"status" "application_status" DEFAULT 'researching' NOT NULL,
	"status_changed_at" timestamp DEFAULT now(),
	"source" "application_source",
	"referred_by" uuid,
	"applied_date" timestamp,
	"first_response_date" timestamp,
	"last_activity_date" timestamp,
	"excitement_level" "excitement_level",
	"fit_score" integer,
	"fit_notes" text,
	"compensation_notes" text,
	"compensation_details" jsonb,
	"interview_panel" jsonb,
	"resume_version" text,
	"cover_letter_used" boolean DEFAULT false,
	"tailored_materials" text,
	"outcome_notes" text,
	"rejection_reason" text,
	"offer_details" jsonb,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid,
	"company_id" uuid,
	"application_id" uuid,
	"type" "interaction_type" NOT NULL,
	"direction" text,
	"subject" text,
	"content" text,
	"sentiment" "interaction_sentiment",
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"duration_minutes" integer,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"follow_up_completed" boolean DEFAULT false,
	"tags" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"company_id" uuid,
	"contact_id" uuid,
	"application_id" uuid,
	"due_date" timestamp,
	"completed_at" timestamp,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"company_id" uuid,
	"contact_id" uuid,
	"application_id" uuid,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pipeline_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"display_order" integer NOT NULL,
	"color" text NOT NULL,
	"is_terminal" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pipeline_stages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"company_id" uuid,
	"contact_id" uuid,
	"application_id" uuid,
	"interaction_id" uuid,
	"task_id" uuid,
	"note_id" uuid,
	"metadata" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"firm" text,
	"specialty" text,
	"region" text,
	"engagement_status" text,
	"last_submitted_to" text,
	"quality_rating" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_starting" timestamp NOT NULL,
	"applications_submitted" integer DEFAULT 0,
	"networking_conversations" integer DEFAULT 0,
	"interviews_completed" integer DEFAULT 0,
	"follow_ups_sent" integer DEFAULT 0,
	"new_companies_researched" integer DEFAULT 0,
	"new_contacts_added" integer DEFAULT 0,
	"active_applications" integer DEFAULT 0,
	"offers_received" integer DEFAULT 0,
	"rejections" integer DEFAULT 0,
	"energy_level" integer,
	"weekly_reflection" text,
	"jsc_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_referred_by_contacts_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_interaction_id_interactions_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."interactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "companies_priority_idx" ON "companies" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "companies_status_idx" ON "companies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "companies_tags_idx" ON "companies" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "contacts_company_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "contacts_warmth_idx" ON "contacts" USING btree ("warmth");--> statement-breakpoint
CREATE INDEX "contacts_next_follow_up_idx" ON "contacts" USING btree ("next_follow_up_date");--> statement-breakpoint
CREATE INDEX "contacts_tags_idx" ON "contacts" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "applications_company_idx" ON "applications" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_source_idx" ON "applications" USING btree ("source");--> statement-breakpoint
CREATE INDEX "applications_excitement_idx" ON "applications" USING btree ("excitement_level");--> statement-breakpoint
CREATE INDEX "interactions_contact_idx" ON "interactions" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "interactions_company_idx" ON "interactions" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "interactions_application_idx" ON "interactions" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "interactions_occurred_at_idx" ON "interactions" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_priority_status_idx" ON "tasks" USING btree ("priority","status");--> statement-breakpoint
CREATE INDEX "timeline_occurred_at_idx" ON "timeline_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "timeline_company_idx" ON "timeline_events" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "timeline_event_type_idx" ON "timeline_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "search_metrics_week_idx" ON "search_metrics" USING btree ("week_starting");