-- Simple test to check what's wrong with the tasks table

-- First, let's see if the table exists and what columns it has
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public';

-- If the table exists but is missing columns, let's see its current structure
\d tasks

-- Check if there are any existing tasks
SELECT COUNT(*) FROM tasks;