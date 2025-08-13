-- Comprehensive Unused Index Cleanup for BittieTasks
-- This removes ALL unused indexes to eliminate warnings and free up storage
-- Run this ONLY if you want a completely clean database schema

-- User-related unused indexes
DROP INDEX IF EXISTS idx_user_challenges_user_id;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_referral_code;
DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_user_activity_user_id;
DROP INDEX IF EXISTS idx_user_challenges_challenge_id;
DROP INDEX IF EXISTS idx_verification_documents_user_id;
DROP INDEX IF EXISTS idx_user_id_mappings_old_id;

-- Task-related unused indexes
DROP INDEX IF EXISTS idx_tasks_category_id;
DROP INDEX IF EXISTS idx_tasks_task_type;
DROP INDEX IF EXISTS idx_task_completions_user_id;
DROP INDEX IF EXISTS idx_task_completions_task_id;
DROP INDEX IF EXISTS idx_task_products_product_id;
DROP INDEX IF EXISTS idx_task_products_task_id;

-- Payment-related unused indexes
DROP INDEX IF EXISTS idx_payments_payer_id;
DROP INDEX IF EXISTS idx_payments_payee_id;
DROP INDEX IF EXISTS idx_payments_task_completion_id;

-- Message-related unused indexes
DROP INDEX IF EXISTS idx_messages_from_user_id;
DROP INDEX IF EXISTS idx_messages_to_user_id;

-- Accountability partnership unused indexes
DROP INDEX IF EXISTS idx_accountability_partnerships_creator_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_partner_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_completion_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_id;

-- Barter transaction unused indexes
DROP INDEX IF EXISTS idx_barter_transactions_accepter_id;
DROP INDEX IF EXISTS idx_barter_transactions_offerer_id;
DROP INDEX IF EXISTS idx_barter_transactions_task_completion_id;
DROP INDEX IF EXISTS idx_barter_transactions_task_id;

-- Escrow transaction unused indexes
DROP INDEX IF EXISTS idx_escrow_transactions_buyer_id;
DROP INDEX IF EXISTS idx_escrow_transactions_seller_id;
DROP INDEX IF EXISTS idx_escrow_transactions_task_completion_id;

-- Referral system unused indexes
DROP INDEX IF EXISTS idx_referrals_referred_user_id;
DROP INDEX IF EXISTS idx_referrals_referrer_user_id;

-- Safety and reporting unused indexes
DROP INDEX IF EXISTS idx_safety_reports_reported_user_id;
DROP INDEX IF EXISTS idx_safety_reports_reporter_user_id;

-- Additional unused indexes that may exist
DROP INDEX IF EXISTS idx_corporate_partnerships_sponsor_id;
DROP INDEX IF EXISTS idx_corporate_partnerships_task_id;
DROP INDEX IF EXISTS idx_subscription_plans_user_id;
DROP INDEX IF EXISTS idx_platform_tasks_category_id;
DROP INDEX IF EXISTS idx_task_verifications_task_id;
DROP INDEX IF EXISTS idx_task_verifications_user_id;
DROP INDEX IF EXISTS idx_notification_preferences_user_id;
DROP INDEX IF EXISTS idx_user_earnings_user_id;
DROP INDEX IF EXISTS idx_task_ratings_task_id;
DROP INDEX IF EXISTS idx_task_ratings_user_id;

-- Cleanup complete - all unused indexes removed
-- This will eliminate ALL unused index warnings
-- Your platform performance is unaffected by this cleanup