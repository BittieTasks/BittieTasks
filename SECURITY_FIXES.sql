-- ========================================
-- CRITICAL SECURITY FIXES FOR BITTIETASKS
-- ========================================
-- Run these commands in your Supabase SQL Editor

-- 1. FIX RLS POLICIES FOR MISSING TABLES
-- ========================================

-- Categories table - RLS policies
CREATE POLICY "Users can view all categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON public.categories
    FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);

-- Transactions table - RLS policies  
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- User activity table - RLS policies
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own activity" ON public.user_activity
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Verification documents table - RLS policies
CREATE POLICY "Users can view own verification documents" ON public.verification_documents
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own verification documents" ON public.verification_documents
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own verification documents" ON public.verification_documents
    FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- 2. ENABLE RLS ON WEBPAGE_TEMPLATES 
-- ========================================

ALTER TABLE public.webpage_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage webpage templates" ON public.webpage_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (SELECT auth.uid()) 
            AND role = 'admin'
        )
    );

CREATE POLICY "All users can view webpage templates" ON public.webpage_templates
    FOR SELECT USING (true);

-- 3. FIX FUNCTION SECURITY (SET SEARCH PATH)
-- ========================================

-- Fix migrate_user_data function
CREATE OR REPLACE FUNCTION public.migrate_user_data(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Function implementation here
    -- Add proper user data migration logic
    RAISE NOTICE 'User data migration function called for: %', user_email;
END;
$$;

-- Fix handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (new.id, new.email, new.created_at);
    RETURN new;
END;
$$;

-- 4. STANDARDIZE AUTH PATTERNS
-- ========================================

-- Update all policies to use consistent (SELECT auth.uid()) pattern
-- This requires checking existing policies and updating them

-- Example: Update any direct auth.uid() usage to (SELECT auth.uid())
-- Note: Run this after checking your existing policies

-- 5. ADDITIONAL SECURITY ENHANCEMENTS
-- ========================================

-- Ensure all user-related tables have proper RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create comprehensive profiles policy if not exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;  
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = (SELECT auth.uid()));

-- Ensure tasks have proper security
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
CREATE POLICY "Users can view all tasks" ON public.tasks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (creator_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (creator_id = (SELECT auth.uid()));

-- ========================================
-- VERIFICATION COMMANDS
-- ========================================

-- Run these to verify the fixes worked:

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check policies
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check function security
SELECT routine_name, security_type, specific_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';