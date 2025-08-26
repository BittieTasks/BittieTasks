-- BittieTasks Database Setup for Supabase
-- Run this script in your Supabase SQL Editor to create all required tables

-- Create enums
CREATE TYPE "task_status" AS ENUM('open', 'active', 'completed', 'cancelled');
CREATE TYPE "task_type" AS ENUM('shared', 'solo', 'sponsored', 'barter', 'platform_funded', 'corporate_sponsored', 'peer_to_peer');
CREATE TYPE "approval_status" AS ENUM('pending', 'auto_approved', 'manual_review', 'approved', 'rejected', 'flagged');
CREATE TYPE "review_tier" AS ENUM('auto_approve', 'standard_review', 'enhanced_review', 'corporate_review');
CREATE TYPE "transaction_type" AS ENUM('task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription_payment');
CREATE TYPE "transaction_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE "verification_method" AS ENUM('photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof');
CREATE TYPE "verification_status" AS ENUM('pending', 'auto_verified', 'manual_review', 'verified', 'rejected', 'requires_additional_proof');
CREATE TYPE "revenue_stream" AS ENUM('peer_to_peer', 'corporate_partnership', 'platform_funded');
CREATE TYPE "participant_status" AS ENUM('applied', 'accepted', 'completed', 'cancelled', 'expired', 'verified');

-- Users table
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"phone_number" varchar UNIQUE NOT NULL,
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
	"total_earnings" decimal(10,2) DEFAULT '0.00',
	"tasks_completed" integer DEFAULT 0,
	"active_referrals" integer DEFAULT 0,
	"monthly_goal" decimal(10,2) DEFAULT '500.00',
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
	"updated_at" timestamp DEFAULT now()
);

-- Phone verification codes table
CREATE TABLE "phone_verification_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"phone_number" varchar NOT NULL,
	"code" varchar(6) NOT NULL,
	"attempts" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Categories table
CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"color" varchar,
	"created_at" timestamp DEFAULT now()
);

-- Tasks table
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"category_id" varchar REFERENCES "categories"("id"),
	"created_by" varchar REFERENCES "users"("id"),
	"type" "task_type" DEFAULT 'shared',
	"status" "task_status" DEFAULT 'open',
	"approval_status" "approval_status" DEFAULT 'pending',
	"review_tier" "review_tier" DEFAULT 'standard_review',
	"approved_at" timestamp,
	"approved_by" varchar,
	"rejection_reason" text,
	"flagged_reason" text,
	"risk_score" integer DEFAULT 0,
	"earning_potential" decimal(8,2) NOT NULL,
	"max_participants" integer DEFAULT 1,
	"current_participants" integer DEFAULT 0,
	"duration" varchar,
	"location" varchar,
	"zip_code" varchar,
	"city" varchar,
	"state" varchar,
	"coordinates" varchar,
	"radius_miles" integer DEFAULT 25,
	"difficulty" varchar DEFAULT 'medium',
	"requirements" text,
	"sponsor_id" varchar,
	"sponsor_budget" decimal(10,2),
	"scheduled_date" timestamp,
	"completed_at" timestamp,
	"offering" text,
	"seeking" text,
	"trade_type" varchar,
	"tags" varchar[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "difficulty_check" CHECK ("difficulty" IN ('easy', 'medium', 'hard')),
	CONSTRAINT "trade_type_check" CHECK ("trade_type" IN ('service_for_service', 'item_for_service', 'service_for_item', 'item_for_item'))
);

-- Task participants table
CREATE TABLE "task_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"task_id" varchar NOT NULL REFERENCES "tasks"("id"),
	"user_id" varchar NOT NULL REFERENCES "users"("id"),
	"status" "participant_status" DEFAULT 'applied',
	"earned_amount" decimal(8,2),
	"joined_at" timestamp DEFAULT now(),
	"accepted_at" timestamp,
	"completed_at" timestamp,
	"application_responses" jsonb,
	"rejection_reason" text,
	"verification_photo" text,
	"completion_notes" text,
	"verified_at" timestamp,
	"deadline" timestamp,
	"reminder_sent" boolean DEFAULT false,
	"deadline_extended" boolean DEFAULT false,
	"extension_requested_at" timestamp
);

-- Task verification requirements table
CREATE TABLE "task_verification_requirements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"task_id" varchar NOT NULL REFERENCES "tasks"("id"),
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

-- Task completion submissions table
CREATE TABLE "task_completion_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"task_id" varchar NOT NULL REFERENCES "tasks"("id"),
	"user_id" varchar NOT NULL REFERENCES "users"("id"),
	"participant_id" varchar NOT NULL REFERENCES "task_participants"("id"),
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

-- Sessions table (for authentication)
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

-- Create index for sessions
CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");

-- Insert some default categories
INSERT INTO "categories" ("name", "description", "icon", "color") VALUES
('Transportation', 'Rides, deliveries, and transport services', '🚗', '#3B82F6'),
('Household', 'Cleaning, maintenance, and home services', '🏠', '#10B981'),
('Errands', 'Shopping, pickups, and quick tasks', '🛒', '#F59E0B'),
('Care Services', 'Pet care, child care, and assistance', '🐕', '#EF4444'),
('Outdoor Work', 'Gardening, landscaping, and outdoor tasks', '🌱', '#22C55E'),
('Technology', 'Computer help, device setup, and tech support', '💻', '#8B5CF6'),
('Events', 'Party help, event setup, and coordination', '🎉', '#EC4899'),
('Food', 'Meal prep, cooking, and food services', '🍽️', '#F97316');

-- You're all set! The database is now ready for BittieTasks.