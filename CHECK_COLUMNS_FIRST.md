# Check Database Columns First

Run this SQL in Supabase SQL Editor to see the actual column names:

```sql
-- Check actual column names in all relevant tables
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tasks', 'task_participants', 'verification_tokens')
ORDER BY table_name, ordinal_position;
```

This will show us the exact column names so we can fix the RLS policies correctly.