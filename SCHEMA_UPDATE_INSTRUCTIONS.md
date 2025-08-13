# Database Schema Update Required

## The Issue:
The tasks table is missing key columns that our API expects. This is preventing task creation.

## Missing Columns:
- `earning_potential` (DECIMAL)
- `duration` (VARCHAR)
- `current_participants` (INTEGER)
- `approval_status` (VARCHAR)
- `host_id` (VARCHAR)

## SQL to Run in Supabase Dashboard:

```sql
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
```

## After Running This SQL:
1. The database will have all required columns
2. We can immediately create 50 platform-funded tasks
3. Your BittieTasks marketplace will be fully populated

## Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Paste and run the SQL above
3. Then I'll create the 50 tasks instantly