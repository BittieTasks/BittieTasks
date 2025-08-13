-- Remaining Unindexed Foreign Keys from CSV Analysis
-- These are the exact foreign keys still missing indexes

-- Barter transactions
CREATE INDEX IF NOT EXISTS idx_barter_transactions_task_id ON public.barter_transactions(task_id);

-- Escrow transactions
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_buyer_id ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_seller_id ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_task_completion_id ON public.escrow_transactions(task_completion_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_task_completion_id ON public.payments(task_completion_id);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user_id ON public.referrals(referrer_user_id);

-- Safety reports
CREATE INDEX IF NOT EXISTS idx_safety_reports_reported_user_id ON public.safety_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_reporter_user_id ON public.safety_reports(reporter_user_id);

-- Task products
CREATE INDEX IF NOT EXISTS idx_task_products_product_id ON public.task_products(product_id);
CREATE INDEX IF NOT EXISTS idx_task_products_task_id ON public.task_products(task_id);

-- User activity
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);

-- User challenges
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON public.user_challenges(challenge_id);

-- Verification documents
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON public.verification_documents(user_id);

-- This completes ALL missing foreign key indexes from the CSV report