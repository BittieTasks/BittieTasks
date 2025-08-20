-- SAFE SUPABASE PERFORMANCE OPTIMIZATION FIXES
-- This version checks for table/column existence before making changes

-- ========================================
-- 1. REMOVE UNUSED INDEXES SAFELY
-- ========================================

-- Only drop indexes if they exist
-- These were identified as unused and causing write performance overhead

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
-- 2. ADD ESSENTIAL INDEXES SAFELY
-- ========================================

-- Only add indexes for tables that exist with the correct columns

-- Essential index for user lookups (used in authentication)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
  END IF;
END $$;

-- Essential indexes for dashboard queries
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'task_participants') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_participants' AND column_name = 'user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_participants' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_task_participants_user_status ON public.task_participants(user_id, status);
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'processed_at') THEN
    CREATE INDEX IF NOT EXISTS idx_transactions_user_processed ON public.transactions(user_id, processed_at DESC);
  END IF;
END $$;

-- ========================================
-- 3. ENABLE RLS ON TABLES SAFELY
-- ========================================

-- Enable RLS only on tables that exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
    -- Sessions should only be accessible by service role
    CREATE POLICY "Service role can manage sessions" ON public.sessions
      FOR ALL
      TO service_role
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'phone_verification_codes') THEN
    ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;
    -- Simple policy for phone verification codes
    CREATE POLICY "Authenticated users can manage phone codes" ON public.phone_verification_codes
      FOR ALL
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ========================================
-- 4. FIX RLS PERFORMANCE ISSUE SAFELY
-- ========================================

-- Fix inefficient RLS policy on webpage_templates if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webpage_templates') THEN
    DROP POLICY IF EXISTS "Authenticated users can manage webpage templates" ON public.webpage_templates;
    -- Create more efficient RLS policy
    CREATE POLICY "Authenticated users can manage webpage templates" ON public.webpage_templates
      FOR ALL 
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ========================================
-- 5. ANALYZE TABLES FOR BETTER PERFORMANCE
-- ========================================

-- Update table statistics for better query planning
DO $$ 
DECLARE
  tbl record;
BEGIN
  FOR tbl IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'ANALYZE ' || quote_ident(tbl.schemaname) || '.' || quote_ident(tbl.tablename);
  END LOOP;
END $$;