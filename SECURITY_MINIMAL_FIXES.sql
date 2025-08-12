-- ========================================
-- MINIMAL SECURITY FIXES - EXISTING TABLES ONLY
-- ========================================
-- This script only applies to tables that exist in your database

-- First, let's check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ========================================
-- APPLY RLS TO EXISTING TABLES ONLY
-- ========================================

-- Categories table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        -- Enable RLS
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view all categories" ON public.categories;
        DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
        DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
        
        -- Create new policies
        CREATE POLICY "Users can view all categories" ON public.categories
            FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert categories" ON public.categories
            FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
        CREATE POLICY "Users can update own categories" ON public.categories
            FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);
            
        RAISE NOTICE 'Applied RLS policies to categories table';
    ELSE
        RAISE NOTICE 'Categories table does not exist - skipping';
    END IF;
END
$$;

-- Transactions table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
        DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
        DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
        
        CREATE POLICY "Users can view own transactions" ON public.transactions
            FOR SELECT USING (user_id = (SELECT auth.uid()));
        CREATE POLICY "Users can insert own transactions" ON public.transactions
            FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
        CREATE POLICY "Users can update own transactions" ON public.transactions
            FOR UPDATE USING (user_id = (SELECT auth.uid()));
            
        RAISE NOTICE 'Applied RLS policies to transactions table';
    ELSE
        RAISE NOTICE 'Transactions table does not exist - skipping';
    END IF;
END
$$;

-- User activity table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_activity') THEN
        ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity;
        DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity;
        
        CREATE POLICY "Users can view own activity" ON public.user_activity
            FOR SELECT USING (user_id = (SELECT auth.uid()));
        CREATE POLICY "Users can insert own activity" ON public.user_activity
            FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
            
        RAISE NOTICE 'Applied RLS policies to user_activity table';
    ELSE
        RAISE NOTICE 'User_activity table does not exist - skipping';
    END IF;
END
$$;

-- Verification documents table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'verification_documents') THEN
        ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own verification documents" ON public.verification_documents;
        DROP POLICY IF EXISTS "Users can insert own verification documents" ON public.verification_documents;
        DROP POLICY IF EXISTS "Users can update own verification documents" ON public.verification_documents;
        
        CREATE POLICY "Users can view own verification documents" ON public.verification_documents
            FOR SELECT USING (user_id = (SELECT auth.uid()));
        CREATE POLICY "Users can insert own verification documents" ON public.verification_documents
            FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
        CREATE POLICY "Users can update own verification documents" ON public.verification_documents
            FOR UPDATE USING (user_id = (SELECT auth.uid()));
            
        RAISE NOTICE 'Applied RLS policies to verification_documents table';
    ELSE
        RAISE NOTICE 'Verification_documents table does not exist - skipping';
    END IF;
END
$$;

-- Webpage templates table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webpage_templates') THEN
        ALTER TABLE public.webpage_templates ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Authenticated users can view webpage templates" ON public.webpage_templates;
        DROP POLICY IF EXISTS "Authenticated users can manage webpage templates" ON public.webpage_templates;
        
        CREATE POLICY "Authenticated users can view webpage templates" ON public.webpage_templates
            FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);
        CREATE POLICY "Authenticated users can manage webpage templates" ON public.webpage_templates
            FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);
            
        RAISE NOTICE 'Applied RLS policies to webpage_templates table';
    ELSE
        RAISE NOTICE 'Webpage_templates table does not exist - skipping';
    END IF;
END
$$;

-- Core existing tables that should have RLS
-- Profiles table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (id = (SELECT auth.uid()));
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (id = (SELECT auth.uid()));
            
        RAISE NOTICE 'Applied RLS policies to profiles table';
    ELSE
        RAISE NOTICE 'Profiles table does not exist - skipping';
    END IF;
END
$$;

-- Tasks table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tasks') THEN
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
        DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
        DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
        
        CREATE POLICY "Users can view all tasks" ON public.tasks
            FOR SELECT USING (true);
        CREATE POLICY "Users can insert own tasks" ON public.tasks
            FOR INSERT WITH CHECK (creator_id = (SELECT auth.uid()));
        CREATE POLICY "Users can update own tasks" ON public.tasks
            FOR UPDATE USING (creator_id = (SELECT auth.uid()));
            
        RAISE NOTICE 'Applied RLS policies to tasks table';
    ELSE
        RAISE NOTICE 'Tasks table does not exist - skipping';
    END IF;
END
$$;

-- ========================================
-- VERIFICATION
-- ========================================

-- Show which tables now have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- Show applied policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;