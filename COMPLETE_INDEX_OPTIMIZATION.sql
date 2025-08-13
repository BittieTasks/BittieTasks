-- Complete Foreign Key Index Optimization for BittieTasks
-- This addresses all unindexed foreign key performance recommendations

-- Core task system indexes (already added)
CREATE INDEX IF NOT EXISTS idx_task_participants_user_id ON public.task_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_task_participants_task_id ON public.task_participants(task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_task_id ON public.transactions(task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Additional missing foreign key indexes
-- Accountability partnerships
CREATE INDEX IF NOT EXISTS idx_accountability_partnerships_creator_id ON public.accountability_partnerships(creator_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partnerships_partner_id ON public.accountability_partnerships(partner_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partnerships_task_completion_id ON public.accountability_partnerships(task_completion_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partnerships_task_id ON public.accountability_partnerships(task_id);

-- Barter transactions
CREATE INDEX IF NOT EXISTS idx_barter_transactions_accepter_id ON public.barter_transactions(accepter_id);
CREATE INDEX IF NOT EXISTS idx_barter_transactions_offerer_id ON public.barter_transactions(offerer_id);
CREATE INDEX IF NOT EXISTS idx_barter_transactions_task_completion_id ON public.barter_transactions(task_completion_id);

-- Messages system
CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON public.messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON public.messages(to_user_id);

-- Payment system
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON public.payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON public.payments(payer_id);

-- Task completions
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON public.task_completions(task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON public.task_completions(user_id);

-- Tasks categorization
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON public.tasks(category_id);

-- User achievements and challenges
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON public.user_challenges(user_id);

-- Additional composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_task_participants_user_task ON public.task_participants(user_id, task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(from_user_id, to_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_status ON public.task_completions(user_id, status);

-- Performance optimization complete
-- ALL foreign keys now have covering indexes for optimal join performance