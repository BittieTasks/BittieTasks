# Clean Up Duplicate RLS Policies

## Problem Identified:
Multiple permissive policies exist for the same actions, causing performance warnings:

- **tasks table**: Duplicate UPDATE and SELECT policies
- **users table**: Duplicate SELECT and UPDATE policies  
- **webpage_templates table**: Duplicate SELECT policies

## Solution:
Remove all duplicate policies and keep only the optimized versions.

```sql
-- Clean up duplicate policies on tasks table
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view active tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;

-- Clean up duplicate policies on users table  
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Clean up duplicate policies on webpage_templates table
DROP POLICY IF EXISTS "Authenticated users can manage webpage templates" ON public.webpage_templates;
DROP POLICY IF EXISTS "Authenticated users can view webpage templates" ON public.webpage_templates;

-- Ensure we have only the optimized policies (these should already exist from our previous fix)
-- Re-create if needed:

-- Tasks table - simplified view policy
CREATE POLICY IF NOT EXISTS "Tasks are publicly viewable" ON public.tasks 
FOR SELECT USING (true);

-- Tasks table - creator can manage
CREATE POLICY IF NOT EXISTS "Users can update their own tasks" ON public.tasks 
FOR UPDATE USING ((SELECT auth.uid()) = creator_id::uuid);

-- Users table - keep our optimized policies
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users 
FOR SELECT USING ((SELECT auth.uid()) = id::uuid);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users 
FOR UPDATE USING ((SELECT auth.uid()) = id::uuid);
```

This will eliminate the duplicate policy warnings while maintaining security and performance.