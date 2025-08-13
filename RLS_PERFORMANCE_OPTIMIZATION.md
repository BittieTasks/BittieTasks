# RLS Performance Optimization

## Performance Issues Detected
Supabase has flagged multiple RLS policies with performance warnings:

### Issues Found:
- **Auth RLS Initialization Plan**: 10+ policies re-evaluating `auth.*()` functions for each row
- **Multiple Permissive Policies**: Duplicate policies on tasks table causing unnecessary execution

### Performance Impact:
- Slow query performance at scale
- Unnecessary re-evaluation of authentication functions
- Suboptimal database resource usage

## Optimization Required

### Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard/project/ttgbotlcbzmmyqawnjpj
2. Navigate to: **SQL Editor**
3. Run this optimization SQL:

```sql
-- Optimize RLS policies by wrapping auth functions in SELECT subqueries
-- This prevents re-evaluation of auth functions for each row

-- Users table policies (optimized)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING ((SELECT auth.uid())::text = id);
CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING ((SELECT auth.uid())::text = id);

-- Tasks table policies (optimized and consolidated)
DROP POLICY IF EXISTS "Users can create tasks as creator" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;

CREATE POLICY "Users can create tasks as creator" ON public.tasks 
FOR INSERT WITH CHECK ((SELECT auth.uid())::text = created_by);
CREATE POLICY "Users can update their own tasks" ON public.tasks 
FOR UPDATE USING ((SELECT auth.uid())::text = created_by);
CREATE POLICY "Users can delete their own tasks" ON public.tasks 
FOR DELETE USING ((SELECT auth.uid())::text = created_by);

-- Task participants table policies (optimized)
DROP POLICY IF EXISTS "Task participants viewable by task creator and participant" ON public.task_participants;
DROP POLICY IF EXISTS "Users can apply to tasks" ON public.task_participants;
DROP POLICY IF EXISTS "Task creators can update participants" ON public.task_participants;
DROP POLICY IF EXISTS "Task creators can remove participants" ON public.task_participants;

CREATE POLICY "Task participants viewable by task creator and participant" ON public.task_participants 
FOR SELECT USING (
  (SELECT auth.uid())::text = user_id OR 
  (SELECT auth.uid())::text IN (SELECT created_by FROM tasks WHERE id = task_id)
);
CREATE POLICY "Users can apply to tasks" ON public.task_participants 
FOR INSERT WITH CHECK ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Task creators can update participants" ON public.task_participants 
FOR UPDATE USING ((SELECT auth.uid())::text IN (SELECT created_by FROM tasks WHERE id = task_id));
CREATE POLICY "Task creators can remove participants" ON public.task_participants 
FOR DELETE USING ((SELECT auth.uid())::text IN (SELECT created_by FROM tasks WHERE id = task_id));

-- Verification tokens table policy (optimized)
DROP POLICY IF EXISTS "Users can only access their own verification tokens" ON public.verification_tokens;
CREATE POLICY "Users can only access their own verification tokens" ON public.verification_tokens 
FOR ALL USING ((SELECT auth.uid())::text = user_id);
```

## What This Optimization Does:
- **Performance**: Wraps `auth.uid()` in `(SELECT auth.uid())` to prevent per-row evaluation
- **Consolidation**: Removes duplicate policies on tasks table
- **Security**: Maintains exact same security model
- **Scalability**: Dramatically improves performance at scale

## After Optimization:
- All performance warnings should disappear
- Query performance will improve significantly
- Database resource usage optimized
- Same security guarantees maintained