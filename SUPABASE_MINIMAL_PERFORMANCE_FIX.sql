-- MINIMAL SUPABASE PERFORMANCE FIX
-- Only removes unused indexes - the main performance issue

-- ========================================
-- REMOVE UNUSED INDEXES (PRIMARY PERFORMANCE BOOST)
-- ========================================

-- Remove unused indexes causing write performance overhead
-- These were identified by Supabase Advisor as never being used

DROP INDEX IF EXISTS idx_session_expire;
DROP INDEX IF EXISTS idx_task_participants_user_id;
DROP INDEX IF EXISTS idx_task_participants_task_id;
DROP INDEX IF EXISTS idx_transactions_task_id;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_messages_conversation;
DROP INDEX IF EXISTS idx_messages_from_user_id;
DROP INDEX IF EXISTS idx_messages_to_user_id;
DROP INDEX IF EXISTS idx_task_completions_user_status;
DROP INDEX IF EXISTS idx_task_completions_task_id;
DROP INDEX IF EXISTS idx_task_completions_user_id;
DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_user_challenges_user_id;
DROP INDEX IF EXISTS idx_payments_payee_id;
DROP INDEX IF EXISTS idx_payments_payer_id;
DROP INDEX IF EXISTS idx_tasks_category_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_creator_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_partner_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_completion_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_id;
DROP INDEX IF EXISTS idx_barter_transactions_accepter_id;
DROP INDEX IF EXISTS idx_barter_transactions_offerer_id;
DROP INDEX IF EXISTS idx_barter_transactions_task_completion_id;
DROP INDEX IF EXISTS idx_barter_transactions_task_id;
DROP INDEX IF EXISTS idx_escrow_transactions_buyer_id;
DROP INDEX IF EXISTS idx_escrow_transactions_seller_id;
DROP INDEX IF EXISTS idx_escrow_transactions_task_completion_id;

-- Enable RLS on sessions table if it exists (for security)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;