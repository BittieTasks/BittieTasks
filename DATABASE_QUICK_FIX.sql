-- Quick fix for existing database - add only missing columns
-- Run this instead of the full schema update

-- Add missing columns to users table (only if they don't exist)
DO $$
BEGIN
    -- Add phone_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_number') THEN
        ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
    END IF;
    
    -- Add other missing user columns
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
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'type') THEN
        ALTER TABLE tasks ADD COLUMN type VARCHAR(50) DEFAULT 'solo';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        ALTER TABLE tasks ADD COLUMN status VARCHAR(50) DEFAULT 'open';
    END IF;
    
    -- Add approval_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'approval_status') THEN
        ALTER TABLE tasks ADD COLUMN approval_status VARCHAR(50) DEFAULT 'approved';
    END IF;
    
    -- Add current_participants if max_participants was renamed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'current_participants') THEN
        ALTER TABLE tasks ADD COLUMN current_participants INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert categories
INSERT INTO categories (id, name, description, icon, color) VALUES
('solo', 'Solo Tasks', 'Individual tasks you can complete alone', '👤', '#3B82F6'),
('community', 'Community Tasks', 'Tasks that help your local community', '🏘️', '#10B981'),
('corporate', 'Corporate Tasks', 'Sponsored tasks from businesses', '🏢', '#8B5CF6'),
('barter', 'Barter Exchange', 'Trade skills and services', '🔄', '#F59E0B')
ON CONFLICT (id) DO NOTHING;

-- Update existing platform tasks
UPDATE tasks SET 
  type = 'solo',
  status = 'open',
  approval_status = 'approved'
WHERE id LIKE 'platform-%';

-- Add category reference to existing tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id VARCHAR(50);
UPDATE tasks SET category_id = 'solo' WHERE category = 'solo' AND category_id IS NULL;

SELECT 'Database updated successfully!' as result;