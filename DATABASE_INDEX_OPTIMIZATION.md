# Database Index Optimization

## Performance Recommendations Found:

### Critical: Missing Foreign Key Indexes
These will improve join performance significantly:

```sql
-- Add indexes for foreign keys that are frequently joined
CREATE INDEX IF NOT EXISTS idx_task_participants_user_id ON public.task_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_task_participants_task_id ON public.task_participants(task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_task_id ON public.transactions(task_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
```

### Optional: Remove Unused Indexes (Cleanup)
These indexes consume storage but aren't being used:

```sql
-- Remove unused indexes to free up storage and improve write performance
DROP INDEX IF EXISTS idx_user_challenges_user_id;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_referral_code;
DROP INDEX IF EXISTS idx_tasks_category_id;
DROP INDEX IF EXISTS idx_tasks_task_type;
DROP INDEX IF EXISTS idx_task_completions_user_id;
DROP INDEX IF EXISTS idx_task_completions_task_id;
DROP INDEX IF EXISTS idx_payments_payer_id;
DROP INDEX IF EXISTS idx_payments_payee_id;
DROP INDEX IF EXISTS idx_messages_from_user_id;
DROP INDEX IF EXISTS idx_messages_to_user_id;
DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_creator_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_partner_id;
DROP INDEX IF EXISTS idx_accountability_partnerships_task_completion_id;
```

## Recommendation:
- **Apply the foreign key indexes** immediately - these will improve query performance
- **Skip the unused index cleanup** for now - these are informational and don't hurt performance

The foreign key indexes will significantly improve performance when users:
- View their task participation
- Check transaction history
- Join tasks with participants data