-- Step-by-Step Database Setup for Supabase
-- Copy and run each step separately

-- STEP 1: Clean slate - Drop existing tables
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

-- STEP 3: Create Tasks table
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

-- STEP 4: Verify tasks table has category column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 5: Insert test tasks
INSERT INTO tasks (id, title, description, category, payout, location, created_at) VALUES
('platform-001', 'Organize and fold laundry', 'Sort, fold, and organize clean laundry neatly', 'solo', 12.00, 'Nationwide', NOW()),
('platform-002', 'Wash and organize dishes', 'Clean dishes, utensils, and organize kitchen', 'solo', 8.00, 'Nationwide', NOW()),
('platform-003', 'Complete 30-minute workout', 'Exercise routine: yoga, walking, or gym workout', 'solo', 15.00, 'Nationwide', NOW()),
('platform-004', 'Grocery shopping trip', 'Complete grocery shopping with receipt verification', 'solo', 15.00, 'Nationwide', NOW()),
('platform-005', 'Organize living space', 'Declutter and organize room or living area', 'solo', 10.00, 'Nationwide', NOW());

-- STEP 6: Verify data was inserted
SELECT id, title, category, payout FROM tasks;

-- STEP 7: Create Task Applications table
CREATE TABLE task_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(50),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message TEXT,
  verification_photo TEXT,
  verification_status VARCHAR(50),
  verification_notes TEXT,
  ai_confidence INTEGER,
  payout_amount DECIMAL(10,2),
  payout_status VARCHAR(50),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- STEP 8: Add foreign key constraint
ALTER TABLE task_applications 
ADD CONSTRAINT task_applications_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES tasks(id);

-- STEP 9: Create remaining tables
CREATE TABLE task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES task_applications(id),
  submission_type VARCHAR(50) DEFAULT 'photo',
  content TEXT NOT NULL,
  ai_analysis JSONB,
  verification_status VARCHAR(50) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES task_applications(id),
  user_id UUID REFERENCES users(id),
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 10: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Success! All tables created with proper structure.