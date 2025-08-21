-- Minimal Database Setup - Run this step by step
-- Copy each section separately into Supabase SQL Editor

-- STEP 1: Drop existing tables if they have issues
DROP TABLE IF EXISTS task_submissions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS task_applications CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- STEP 2: Create Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  profile_image_url TEXT,
  location VARCHAR(255),
  zip_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(50),
  coordinates POINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create Tasks table with all required columns
CREATE TABLE tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  payout DECIMAL(10,2) NOT NULL,
  location VARCHAR(255),
  zip_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(50),
  coordinates POINT,
  radius_miles INTEGER DEFAULT 5,
  deadline TIMESTAMP WITH TIME ZONE,
  max_applications INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Verify the tasks table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 5: Insert platform tasks
INSERT INTO tasks (id, title, description, category, payout, location, created_at) VALUES
('platform-001', 'Organize and fold laundry', 'Sort, fold, and organize clean laundry neatly', 'solo', 12.00, 'Nationwide', NOW()),
('platform-002', 'Wash and organize dishes', 'Clean dishes, utensils, and organize kitchen', 'solo', 8.00, 'Nationwide', NOW()),
('platform-003', 'Complete 30-minute workout', 'Exercise routine: yoga, walking, or gym workout', 'solo', 15.00, 'Nationwide', NOW()),
('platform-004', 'Grocery shopping trip', 'Complete grocery shopping with receipt verification', 'solo', 15.00, 'Nationwide', NOW()),
('platform-005', 'Organize living space', 'Declutter and organize room or living area', 'solo', 10.00, 'Nationwide', NOW());

-- STEP 6: Verify tasks were inserted
SELECT id, title, category, payout FROM tasks;

-- Continue with remaining tables after this works...