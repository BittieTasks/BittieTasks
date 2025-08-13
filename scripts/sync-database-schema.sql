-- Sync database schema to match Drizzle definitions
-- This will add missing columns to the tasks table

-- Add missing columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS earning_potential DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS duration VARCHAR,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS host_id VARCHAR;

-- Update existing tasks that might have null values
UPDATE tasks 
SET 
  earning_potential = 25.00 WHERE earning_potential IS NULL,
  current_participants = 0 WHERE current_participants IS NULL,
  approval_status = 'pending' WHERE approval_status IS NULL,
  host_id = 'legacy' WHERE host_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_earning_potential ON tasks(earning_potential);
CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON tasks(approval_status);
CREATE INDEX IF NOT EXISTS idx_tasks_host_id ON tasks(host_id);

-- Verify schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;