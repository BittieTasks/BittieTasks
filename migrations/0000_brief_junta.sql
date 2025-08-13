CREATE TYPE "public"."approval_status" AS ENUM('pending', 'auto_approved', 'manual_review', 'approved', 'rejected', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."revenue_stream" AS ENUM('peer_to_peer', 'corporate_partnership', 'platform_funded');--> statement-breakpoint
CREATE TYPE "public"."review_tier" AS ENUM('auto_approve', 'standard_review', 'enhanced_review', 'corporate_review');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('shared', 'solo', 'sponsored', 'barter', 'platform_funded', 'corporate_sponsored', 'peer_to_peer');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription_payment');--> statement-breakpoint
CREATE TYPE "public"."verification_method" AS ENUM('photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'auto_verified', 'manual_review', 'verified', 'rejected', 'requires_additional_proof');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"icon" varchar,
	"criteria" jsonb,
	"reward" numeric(8, 2),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"color" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "corporate_verification_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sponsor_id" varchar NOT NULL,
	"brand_compliance_required" boolean DEFAULT true,
	"content_quality_threshold" integer DEFAULT 80,
	"manual_review_required" boolean DEFAULT false,
	"auto_approval_enabled" boolean DEFAULT true,
	"max_auto_approval_amount" numeric(8, 2) DEFAULT '100.00',
	"required_verification_methods" "verification_method"[],
	"brand_guidelines_url" varchar,
	"approval_timeout_hours" integer DEFAULT 24,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar,
	"task_id" varchar,
	"content" text NOT NULL,
	"message_type" varchar DEFAULT 'text',
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "phone_verification_codes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"phone_number" varchar NOT NULL,
	"code" varchar(6) NOT NULL,
	"attempts" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prohibited_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword" varchar NOT NULL,
	"category" varchar NOT NULL,
	"severity" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "prohibited_content_keyword_unique" UNIQUE("keyword")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"logo" varchar,
	"description" text,
	"website" varchar,
	"contact_email" varchar,
	"ethics_score" integer,
	"approved" boolean DEFAULT false,
	"budget" numeric(12, 2),
	"tasks_sponsored" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_approval_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"previous_status" "approval_status",
	"new_status" "approval_status" NOT NULL,
	"reviewed_by" varchar,
	"review_notes" text,
	"risk_factors" text,
	"automated_checks" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_completion_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"participant_id" varchar NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending',
	"verification_methods" "verification_method"[] NOT NULL,
	"photo_urls" varchar[],
	"video_urls" varchar[],
	"photo_metadata" jsonb,
	"video_metadata" jsonb,
	"gps_coordinates" varchar[],
	"location_history" jsonb,
	"start_location" varchar,
	"end_location" varchar,
	"start_time" timestamp,
	"end_time" timestamp,
	"total_duration" integer,
	"time_tracking_data" jsonb,
	"community_verifications" jsonb,
	"business_verification" varchar,
	"receipt_urls" varchar[],
	"social_proof_urls" varchar[],
	"auto_verification_score" integer,
	"ai_analysis_results" jsonb,
	"fraud_detection_score" integer,
	"quality_score" integer,
	"reviewed_by" varchar,
	"review_notes" text,
	"rejection_reason" text,
	"approved_at" timestamp,
	"payment_released" boolean DEFAULT false,
	"payment_released_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar DEFAULT 'joined',
	"earned_amount" numeric(8, 2),
	"joined_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "task_verification_requirements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" varchar NOT NULL,
	"revenue_stream" "revenue_stream" NOT NULL,
	"required_methods" varchar[] NOT NULL,
	"photo_requirements" jsonb,
	"video_requirements" jsonb,
	"location_requirements" jsonb,
	"time_requirements" jsonb,
	"additional_requirements" text,
	"auto_approval_criteria" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"category_id" varchar,
	"host_id" varchar NOT NULL,
	"type" "task_type" DEFAULT 'shared',
	"status" "task_status" DEFAULT 'open',
	"approval_status" "approval_status" DEFAULT 'pending',
	"review_tier" "review_tier" DEFAULT 'standard_review',
	"approved_at" timestamp,
	"approved_by" varchar,
	"rejection_reason" text,
	"flagged_reason" text,
	"risk_score" integer DEFAULT 0,
	"earning_potential" numeric(8, 2) NOT NULL,
	"max_participants" integer DEFAULT 1,
	"current_participants" integer DEFAULT 0,
	"duration" varchar,
	"location" varchar,
	"difficulty" varchar DEFAULT 'medium',
	"requirements" text,
	"sponsor_id" varchar,
	"sponsor_budget" numeric(10, 2),
	"scheduled_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"task_id" varchar,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"status" "transaction_status" DEFAULT 'pending',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" varchar NOT NULL,
	"progress" integer DEFAULT 0,
	"max_progress" integer,
	"earned" boolean DEFAULT false,
	"earned_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_verification_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"submission_id" varchar NOT NULL,
	"verification_outcome" "verification_status" NOT NULL,
	"quality_score" integer,
	"fraud_score" integer,
	"timeliness" integer,
	"accuracy_score" integer,
	"impact_on_reputation" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone_number" varchar NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"location" varchar,
	"bio" text,
	"phone_verified" boolean DEFAULT false,
	"verified" boolean DEFAULT false,
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT true,
	"total_earnings" numeric(10, 2) DEFAULT '0.00',
	"tasks_completed" integer DEFAULT 0,
	"active_referrals" integer DEFAULT 0,
	"monthly_goal" numeric(10, 2) DEFAULT '500.00',
	"subscription_tier" varchar DEFAULT 'free',
	"subscription_status" varchar DEFAULT 'active',
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"monthly_task_limit" integer DEFAULT 5,
	"monthly_tasks_completed" integer DEFAULT 0,
	"last_monthly_reset" timestamp,
	"priority_support" boolean DEFAULT false,
	"ad_free" boolean DEFAULT false,
	"premium_badge" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "corporate_verification_settings" ADD CONSTRAINT "corporate_verification_settings_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_approval_logs" ADD CONSTRAINT "task_approval_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completion_submissions" ADD CONSTRAINT "task_completion_submissions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completion_submissions" ADD CONSTRAINT "task_completion_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_completion_submissions" ADD CONSTRAINT "task_completion_submissions_participant_id_task_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."task_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_participants" ADD CONSTRAINT "task_participants_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_participants" ADD CONSTRAINT "task_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_verification_requirements" ADD CONSTRAINT "task_verification_requirements_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verification_history" ADD CONSTRAINT "user_verification_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verification_history" ADD CONSTRAINT "user_verification_history_submission_id_task_completion_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."task_completion_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");