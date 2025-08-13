# RLS Performance Fix - FINAL CORRECTED VERSION

Based on the Drizzle schema, the database uses snake_case column names. Here's the corrected SQL:

```sql
-- Optimize RLS policies with correct snake_case column names
-- Users table (id column)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING ((SELECT auth.uid()) = id::uuid);
CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING ((SELECT auth.uid()) = id::uuid);

-- Tasks table (uses host_id column from schema)
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

-- Task participants table (uses user_id and task_id columns)
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

-- Verification tokens table (uses user_id column from schema)
DROP POLICY IF EXISTS "Users can only access their own verification tokens" ON public.verification_tokens;
CREATE POLICY "Users can only access their own verification tokens" ON public.verification_tokens 
FOR ALL USING ((SELECT auth.uid()) = user_id::uuid);
```

## Schema Analysis:
From the Drizzle schema file:
- **tasks table**: `hostId: varchar("host_id")` - so database column is `host_id`
- **task_participants table**: `userId: varchar("user_id")` and `taskId: varchar("task_id")`
- **verification_tokens table**: `user_id: varchar('user_id')`

This should work with the actual database column names!