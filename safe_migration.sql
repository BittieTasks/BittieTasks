-- Safe migration script for existing Supabase database
-- Only creates new tables and columns, doesn't recreate existing ones

-- First, create new ENUMs that don't exist yet (skip if they exist)
DO $$ BEGIN
    CREATE TYPE "public"."approval_status" AS ENUM('pending', 'auto_approved', 'manual_review', 'approved', 'rejected', 'flagged');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."revenue_stream" AS ENUM('peer_to_peer', 'corporate_partnership', 'platform_funded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."review_tier" AS ENUM('auto_approve', 'standard_review', 'enhanced_review', 'corporate_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."task_status" AS ENUM('open', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."task_type" AS ENUM('shared', 'solo', 'sponsored', 'barter', 'platform_funded', 'corporate_sponsored', 'peer_to_peer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."transaction_type" AS ENUM('task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription_payment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."verification_method" AS ENUM('photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."verification_status" AS ENUM('pending', 'auto_verified', 'manual_review', 'verified', 'rejected', 'requires_additional_proof');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the phone verification codes table (this is new)
CREATE TABLE IF NOT EXISTS "phone_verification_codes" (
    "id" varchar PRIMARY KEY NOT NULL,
    "phone_number" varchar NOT NULL,
    "code" varchar(6) NOT NULL,
    "attempts" integer DEFAULT 0,
    "verified" boolean DEFAULT false,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create email verification tokens table (if not exists)
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" varchar PRIMARY KEY NOT NULL,
    "user_id" varchar NOT NULL,
    "email" text NOT NULL,
    "token" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);

-- Update users table to add phone verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications boolean DEFAULT true;

-- Add unique constraint on phone_number if it doesn't exist
DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT users_phone_number_unique UNIQUE(phone_number);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create sessions table if it doesn't exist (for authentication)
CREATE TABLE IF NOT EXISTS "sessions" (
    "sid" varchar PRIMARY KEY NOT NULL,
    "sess" jsonb NOT NULL,
    "expire" timestamp NOT NULL
);

-- Create index on sessions expire if it doesn't exist
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" USING btree ("expire");

-- Create other missing tables that are needed for the full platform
CREATE TABLE IF NOT EXISTS "achievements" (
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

CREATE TABLE IF NOT EXISTS "sponsors" (
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

CREATE TABLE IF NOT EXISTS "messages" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "sender_id" varchar NOT NULL,
    "receiver_id" varchar,
    "task_id" varchar,
    "content" text NOT NULL,
    "message_type" varchar DEFAULT 'text',
    "read" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "task_approval_logs" (
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

CREATE TABLE IF NOT EXISTS "task_verification_requirements" (
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

CREATE TABLE IF NOT EXISTS "task_completion_submissions" (
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

CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" varchar NOT NULL,
    "achievement_id" varchar NOT NULL,
    "progress" integer DEFAULT 0,
    "max_progress" integer,
    "earned" boolean DEFAULT false,
    "earned_at" timestamp,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_verification_history" (
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

-- Add missing columns to existing tables
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approval_status "approval_status" DEFAULT 'pending';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_tier "review_tier" DEFAULT 'standard_review';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approved_at timestamp;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS approved_by varchar;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS flagged_reason text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0;

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" 
    FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" 
    FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "task_approval_logs" ADD CONSTRAINT "task_approval_logs_task_id_tasks_id_fk" 
    FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;