-- Temporarily disable Row Level Security for development
-- Run this in your Supabase SQL Editor to allow the web app to read/write data

-- Disable RLS for task_categories table
ALTER TABLE public.task_categories DISABLE ROW LEVEL SECURITY;

-- Disable RLS for tasks table  
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Disable RLS for users table (if needed for authentication)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Check if data exists in tables
SELECT 'Categories:' as table_name, count(*) as count FROM public.task_categories
UNION ALL
SELECT 'Tasks:', count(*) FROM public.tasks
UNION ALL  
SELECT 'Users:', count(*) FROM public.users;

-- Show sample data
SELECT 'Sample Categories:' as info;
SELECT name, description FROM public.task_categories LIMIT 5;

SELECT 'Sample Tasks:' as info;
SELECT title, description, payment FROM public.tasks LIMIT 5;