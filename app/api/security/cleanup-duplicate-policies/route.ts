import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Cleaning up duplicate RLS policies...')
    
    const cleanupSQL = `
-- Remove duplicate RLS policies that are causing performance warnings

-- Tasks table - remove duplicates
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Anyone can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view active tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;

-- Users table - remove duplicates
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Webpage templates - remove duplicates
DROP POLICY IF EXISTS "Authenticated users can manage webpage templates" ON public.webpage_templates;
DROP POLICY IF EXISTS "Authenticated users can view webpage templates" ON public.webpage_templates;

-- Ensure single optimized policies exist

-- Tasks - public viewing
CREATE POLICY "Tasks are publicly viewable" ON public.tasks 
FOR SELECT USING (true);

-- Tasks - creator management (already exists, but ensure it's there)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can create tasks as creator' 
        AND tablename = 'tasks'
    ) THEN
        CREATE POLICY "Users can create tasks as creator" ON public.tasks 
        FOR INSERT WITH CHECK ((SELECT auth.uid()) = creator_id::uuid);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update their own tasks' 
        AND tablename = 'tasks'
    ) THEN
        CREATE POLICY "Users can update their own tasks" ON public.tasks 
        FOR UPDATE USING ((SELECT auth.uid()) = creator_id::uuid);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can delete their own tasks' 
        AND tablename = 'tasks'
    ) THEN
        CREATE POLICY "Users can delete their own tasks" ON public.tasks 
        FOR DELETE USING ((SELECT auth.uid()) = creator_id::uuid);
    END IF;
END $$;
`
    
    return NextResponse.json({
      success: true,
      message: '🧹 Duplicate policy cleanup ready',
      sqlToRun: cleanupSQL,
      instructions: [
        'Go to Supabase Dashboard → SQL Editor',
        'Run the provided SQL commands',
        'This removes duplicate policies causing performance warnings'
      ],
      policiesRemoved: [
        'Duplicate UPDATE policies on tasks table',
        'Duplicate SELECT policies on tasks, users, webpage_templates tables',
        'Multiple permissive policies causing performance issues'
      ]
    })
    
  } catch (error) {
    console.error('Policy cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Policy cleanup preparation failed',
      details: error
    }, { status: 500 })
  }
}