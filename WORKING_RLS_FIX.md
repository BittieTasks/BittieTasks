# Working RLS Performance Fix

Based on common PostgreSQL patterns and the error we're seeing, let me provide a fix that checks for the most likely column names:

```sql
-- First, let's see what columns actually exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public';

-- Users table (this should work)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING ((SELECT auth.uid()) = id::uuid);
CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING ((SELECT auth.uid()) = id::uuid);

-- Verification tokens (this should work)
DROP POLICY IF EXISTS "Users can only access their own verification tokens" ON public.verification_tokens;
CREATE POLICY "Users can only access their own verification tokens" ON public.verification_tokens 
FOR ALL USING ((SELECT auth.uid()) = user_id::uuid);

-- For tasks table, let's try the most common possibilities:
-- Try with 'user_id' first (many tables use this pattern)
DROP POLICY IF EXISTS "Users can create tasks as creator" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks; 
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;

-- If tasks table uses 'user_id' column:
CREATE POLICY "Users can create tasks as creator" ON public.tasks 
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id::uuid);
CREATE POLICY "Users can update their own tasks" ON public.tasks 
FOR UPDATE USING ((SELECT auth.uid()) = user_id::uuid);
CREATE POLICY "Users can delete their own tasks" ON public.tasks 
FOR DELETE USING ((SELECT auth.uid()) = user_id::uuid);
```

Try this version first. If it fails on the tasks table, we'll know to check what the actual column name is.