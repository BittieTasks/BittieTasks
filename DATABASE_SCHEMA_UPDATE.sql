-- Update database schema to match application requirements
-- Run this after the basic tables are created

-- First, let's update the existing tables to match app expectations

-- Update users table to match schema.ts
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_goal DECIMAL(10,2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS monthly_task_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS monthly_tasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_monthly_reset TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ad_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS premium_badge BOOLEAN DEFAULT false;

-- Update users table structure to match expectations
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Update tasks table to match schema.ts
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'solo',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS review_tier VARCHAR(50) DEFAULT 'standard_review',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS earning_potential DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS sponsor_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS sponsor_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS offering TEXT,
ADD COLUMN IF NOT EXISTS seeking TEXT,
ADD COLUMN IF NOT EXISTS trade_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Rename columns to match schema expectations
ALTER TABLE tasks RENAME COLUMN created_by TO old_created_by;
ALTER TABLE tasks RENAME COLUMN creator_id TO created_by;
ALTER TABLE tasks RENAME COLUMN payout TO earning_potential;
ALTER TABLE tasks RENAME COLUMN max_applications TO max_participants;

-- Drop the old column
ALTER TABLE tasks DROP COLUMN IF EXISTS old_created_by;

-- Create additional required tables

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (id, name, description, icon, color) VALUES
('cat-solo', 'Solo Tasks', 'Individual tasks you can complete alone', '👤', '#3B82F6'),
('cat-community', 'Community Tasks', 'Tasks that help your local community', '🏘️', '#10B981'),
('cat-corporate', 'Corporate Tasks', 'Sponsored tasks from businesses', '🏢', '#8B5CF6'),
('cat-barter', 'Barter Exchange', 'Trade skills and services', '🔄', '#F59E0B')
ON CONFLICT (id) DO NOTHING;

-- Task participants table
CREATE TABLE IF NOT EXISTS task_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(50) REFERENCES tasks(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'joined',
  earned_amount DECIMAL(8,2),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  deadline_extended BOOLEAN DEFAULT false,
  extension_requested_at TIMESTAMP WITH TIME ZONE
);

-- Update task_applications to match expectations
ALTER TABLE task_applications 
RENAME COLUMN verification_photo TO photo_urls;

ALTER TABLE task_applications 
ADD COLUMN IF NOT EXISTS video_urls TEXT,
ADD COLUMN IF NOT EXISTS photo_metadata JSONB,
ADD COLUMN IF NOT EXISTS video_metadata JSONB,
ADD COLUMN IF NOT EXISTS gps_coordinates TEXT,
ADD COLUMN IF NOT EXISTS location_history JSONB,
ADD COLUMN IF NOT EXISTS start_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS end_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_duration INTEGER,
ADD COLUMN IF NOT EXISTS time_tracking_data JSONB,
ADD COLUMN IF NOT EXISTS auto_verification_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_analysis_results JSONB,
ADD COLUMN IF NOT EXISTS fraud_detection_score INTEGER,
ADD COLUMN IF NOT EXISTS quality_score INTEGER,
ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_released BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_released_at TIMESTAMP WITH TIME ZONE;

-- Messages table for communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  task_id VARCHAR(50) REFERENCES tasks(id),
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements system
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  criteria JSONB,
  reward DECIMAL(8,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  progress INTEGER DEFAULT 0,
  max_progress INTEGER,
  earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing platform tasks to use new structure
UPDATE tasks SET 
  type = 'solo',
  status = 'open',
  approval_status = 'auto_approved',
  approved_at = NOW(),
  approved_by = 'system'
WHERE id LIKE 'platform-%';

-- Success message
SELECT 'Schema updated successfully! Database now matches application expectations.' as result;