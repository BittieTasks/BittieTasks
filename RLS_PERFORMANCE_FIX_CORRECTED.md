# RLS Performance Optimization - CORRECTED VERSION

## Fixed SQL with Correct Column Names

Based on the actual database schema, here's the corrected SQL:

```sql
-- Optimize RLS policies by wrapping auth functions in SELECT subqueries
-- This prevents re-evaluation of auth functions for each row

-- Users table policies (optimized with proper type casting)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING ((SELECT auth.uid()) = id::uuid);
CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING ((SELECT auth.uid()) = id::uuid);

-- Tasks table policies (optimized and consolidated with correct column name: host_id)
DROP POLICY IF EXISTS "Users can create tasks as creator" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;

CREATE POLICY "Users can create tasks as creator" ON public.tasks 
FOR INSERT WITH CHECK ((SELECT auth.uid()) = host_id::uuid);
CREATE POLICY "Users can update their own tasks" ON public.tasks 
FOR UPDATE USING ((SELECT auth.uid()) = host_id::uuid);
CREATE POLICY "Users can delete their own tasks" ON public.tasks 
FOR DELETE USING ((SELECT auth.uid()) = host_id::uuid);

-- Task participants table policies (optimized with correct column names: user_id, task_id, host_id)
DROP POLICY IF EXISTS "Task participants viewable by task creator and participant" ON public.task_participants;
DROP POLICY IF EXISTS "Users can apply to tasks" ON public.task_participants;
DROP POLICY IF EXISTS "Task creators can update participants" ON public.task_participants;
DROP POLICY IF EXISTS "Task creators can remove participants" ON public.task_participants;

CREATE POLICY "Task participants viewable by task creator and participant" ON public.task_participants 
FOR SELECT USING (
  (SELECT auth.uid()) = user_id::uuid OR 
  (SELECT auth.uid()) IN (SELECT host_id::uuid FROM tasks WHERE id = task_id)
);
CREATE POLICY "Users can apply to tasks" ON public.task_participants 
FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id::uuid);
CREATE POLICY "Task creators can update participants" ON public.task_participants 
FOR UPDATE USING ((SELECT auth.uid()) IN (SELECT host_id::uuid FROM tasks WHERE id = task_id));
CREATE POLICY "Task creators can remove participants" ON public.task_participants 
FOR DELETE USING ((SELECT auth.uid()) IN (SELECT host_id::uuid FROM tasks WHERE id = task_id));

-- Verification tokens table policy (optimized)
DROP POLICY IF EXISTS "Users can only access their own verification tokens" ON public.verification_tokens;
CREATE POLICY "Users can only access their own verification tokens" ON public.verification_tokens 
FOR ALL USING ((SELECT auth.uid()) = user_id::uuid);
```

## Key Corrections Made:
- **Tasks table**: Changed `created_by` to `host_id` (correct column name)
- **Task participants**: Using `user_id` and `task_id` (correct column names)
- **Proper UUID casting**: All comparisons now use correct type casting
- **Performance optimization**: All auth functions wrapped in SELECT subqueries

This SQL should now execute without any column or type errors!