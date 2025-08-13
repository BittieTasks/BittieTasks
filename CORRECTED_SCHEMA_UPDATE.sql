-- CORRECTED SQL - Fixed syntax error
-- Run this in Supabase Dashboard → SQL Editor

-- Add missing columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS earning_potential DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS duration VARCHAR,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS host_id VARCHAR;

-- Update existing tasks - separate UPDATE statements (fixed syntax)
UPDATE tasks SET earning_potential = 25.00 WHERE earning_potential IS NULL;
UPDATE tasks SET current_participants = 0 WHERE current_participants IS NULL;
UPDATE tasks SET approval_status = 'pending' WHERE approval_status IS NULL;
UPDATE tasks SET host_id = 'legacy' WHERE host_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_earning_potential ON tasks(earning_potential);
CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON tasks(approval_status);
CREATE INDEX IF NOT EXISTS idx_tasks_host_id ON tasks(host_id);