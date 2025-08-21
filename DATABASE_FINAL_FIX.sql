-- Final database fix - handles all column type issues
-- Run this to complete the database setup

-- Check what columns exist in tasks table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns to users table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
        ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_earnings') THEN
        ALTER TABLE users ADD COLUMN total_earnings DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tasks_completed') THEN
        ALTER TABLE users ADD COLUMN tasks_completed INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
        ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255);
    END IF;
END $$;

-- Add missing columns to tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'type') THEN
        ALTER TABLE tasks ADD COLUMN type VARCHAR(50) DEFAULT 'solo';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'open';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approval_status') THEN
        ALTER TABLE tasks ADD COLUMN approval_status VARCHAR(50) DEFAULT 'approved';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'current_participants') THEN
        ALTER TABLE tasks ADD COLUMN current_participants INTEGER DEFAULT 0;
    END IF;
END $$;

-- Rename columns that need renaming (check first)
DO $$
BEGIN
    -- Check if payout exists and earning_potential doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'payout') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'earning_potential') THEN
        ALTER TABLE tasks RENAME COLUMN payout TO earning_potential;
    END IF;
    
    -- Check if max_applications exists and max_participants doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'max_applications') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'max_participants') THEN
        ALTER TABLE tasks RENAME COLUMN max_applications TO max_participants;
    END IF;
END $$;

-- Update existing platform tasks to have proper status
UPDATE tasks SET 
  type = 'solo',
  status = 'open',
  approval_status = 'approved'
WHERE id LIKE 'platform-%';

-- Add category_id column if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id VARCHAR(50);

-- Update existing tasks to have category_id based on category column
UPDATE tasks SET category_id = category WHERE category_id IS NULL AND category IS NOT NULL;

SELECT 'Database schema updated successfully!' as result;