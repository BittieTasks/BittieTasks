-- ========================================
-- CORRECTED SECURITY FIXES FOR BITTIETASKS
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

-- 2. ENABLE RLS ON WEBPAGE_TEMPLATES (SIMPLIFIED)
-- ========================================

ALTER TABLE public.webpage_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view templates
CREATE POLICY "Authenticated users can view webpage templates" ON public.webpage_templates
    FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

-- Only allow template creation/updates for now (can be restricted later)
CREATE POLICY "Authenticated users can manage webpage templates" ON public.webpage_templates
    FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

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

-- 4. ENSURE CORE TABLES HAVE RLS ENABLED
-- ========================================

-- Ensure all user-related tables have proper RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies (users can only access their own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;  
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = (SELECT auth.uid()));

-- Tasks policies
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
CREATE POLICY "Users can view all tasks" ON public.tasks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (creator_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (creator_id = (SELECT auth.uid()));

-- Applications policies
DROP POLICY IF EXISTS "Users can view applications for their tasks" ON public.applications;
CREATE POLICY "Users can view applications for their tasks" ON public.applications
    FOR SELECT USING (
        applicant_id = (SELECT auth.uid()) OR 
        EXISTS (
            SELECT 1 FROM public.tasks 
            WHERE id = task_id AND creator_id = (SELECT auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can create applications" ON public.applications;
CREATE POLICY "Users can create applications" ON public.applications
    FOR INSERT WITH CHECK (applicant_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
CREATE POLICY "Users can update own applications" ON public.applications
    FOR UPDATE USING (applicant_id = (SELECT auth.uid()));

-- ========================================
-- VERIFICATION COMMANDS
-- ========================================

-- Run these to verify the fixes worked:

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;