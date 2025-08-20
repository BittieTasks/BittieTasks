-- SUPABASE PERFORMANCE OPTIMIZATION FIXES
-- Addressing performance issues identified in Supabase Advisor

-- ========================================
-- 1. FIX RLS PERFORMANCE ISSUE
-- ========================================

-- Fix inefficient RLS policy on webpage_templates table
-- Replace current_setting() calls with more efficient patterns
DROP POLICY IF EXISTS "Authenticated users can manage webpage templates" ON public.webpage_templates;

-- Create more efficient RLS policy that doesn't re-evaluate auth functions per row
CREATE POLICY "Authenticated users can manage webpage templates" ON public.webpage_templates
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 2. REMOVE UNUSED INDEXES FOR PERFORMANCE
-- ========================================

-- Remove unused indexes that are causing overhead
-- These indexes were identified as never being used by query analysis

-- Sessions table
DROP INDEX IF EXISTS idx_session_expire;

-- Task participants table  
DROP INDEX IF EXISTS idx_task_participants_user_id;
DROP INDEX IF EXISTS idx_task_participants_task_id;

-- Transactions table
DROP INDEX IF EXISTS idx_transactions_task_id;
DROP INDEX IF EXISTS idx_transactions_user_id;

-- Messages table
DROP INDEX IF EXISTS idx_messages_conversation;
DROP INDEX IF EXISTS idx_messages_from_user_id;
DROP INDEX IF EXISTS idx_messages_to_user_id;

-- Task completions table
DROP INDEX IF EXISTS idx_task_completions_user_status;
DROP INDEX IF EXISTS idx_task_completions_task_id;
DROP INDEX IF EXISTS idx_task_completions_user_id;

-- User achievements table
DROP INDEX IF EXISTS idx_user_achievements_user_id;

-- User challenges table  
DROP INDEX IF EXISTS idx_user_challenges_user_id;

-- Payments table
DROP INDEX IF EXISTS idx_payments_payee_id;
DROP INDEX IF EXISTS idx_payments_payer_id;

-- Tasks table
DROP INDEX IF EXISTS idx_tasks_category_id;

-- Accountability partnerships table
DROP INDEX IF EXISTS idx_accountability_partnerships_creator_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_partner_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_completion_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_id;

-- Barter transactions table
DROP INDEX IF EXISTS idx_barter_transactions_accepter_id;
DROP INDEX IF EXISTS idx_barter_transactions_offerer_id;
DROP INDEX IF EXISTS idx_barter_transactions_task_completion_id;
DROP INDEX IF EXISTS idx_barter_transactions_task_id;

-- Escrow transactions table
DROP INDEX IF EXISTS idx_escrow_transactions_buyer_id;
DROP INDEX IF EXISTS idx_escrow_transactions_seller_id;
DROP INDEX IF EXISTS idx_escrow_transactions_task_completion_id;

-- ========================================
-- 3. ADD ESSENTIAL INDEXES FOR DASHBOARD QUERIES
-- ========================================

-- Add only the indexes we actually need for dashboard performance
-- These are based on the queries in our dashboard API

-- Essential index for user lookups (used in authentication)
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);

-- Essential indexes for dashboard queries if tables exist
CREATE INDEX IF NOT EXISTS idx_task_participants_user_status ON public.task_participants(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_processed ON public.transactions(user_id, processed_at DESC);

-- ========================================
-- 4. ENABLE RLS ON TABLES MISSING SECURITY  
-- ========================================

-- Enable RLS on tables that need it for security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for security
CREATE POLICY "Users can access own phone codes" ON public.phone_verification_codes
  FOR ALL
  TO authenticated  
  USING (auth.uid()::text = user_id);

-- Sessions table should only be accessible by service role
CREATE POLICY "Service role can manage sessions" ON public.sessions
  FOR ALL
  TO service_role
  USING (true);

-- ========================================
-- 5. PERFORMANCE MONITORING VIEWS
-- ========================================

-- Create a view to monitor slow queries (optional)
-- This helps identify future performance issues
CREATE OR REPLACE VIEW performance_monitor AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements 
WHERE calls > 10
ORDER BY mean_time DESC
LIMIT 20;