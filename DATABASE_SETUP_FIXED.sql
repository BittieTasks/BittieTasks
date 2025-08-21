-- BittieTasks Database Setup SQL (FIXED VERSION)
-- Run these commands in Supabase SQL Editor

-- 1. Create Users table
CREATE TABLE IF NOT EXISTS users (
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

-- 2. Create Tasks table
CREATE TABLE IF NOT EXISTS tasks (
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

-- 3. Create Task Applications table (without foreign key initially)
CREATE TABLE IF NOT EXISTS task_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(50), -- Will add foreign key after tasks table exists
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

-- 4. Create Task Submissions table (for verification)
CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES task_applications(id),
  submission_type VARCHAR(50) DEFAULT 'photo',
  content TEXT NOT NULL,
  ai_analysis JSONB,
  verification_status VARCHAR(50) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Transactions table (for payments)
CREATE TABLE IF NOT EXISTS transactions (
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

-- 6. Insert everyday tasks BEFORE adding foreign key constraint
INSERT INTO tasks (id, title, description, category, payout, location, created_at) VALUES
('platform-001', 'Organize and fold laundry', 'Sort, fold, and organize clean laundry neatly', 'solo', 12.00, 'Nationwide', NOW()),
('platform-002', 'Wash and organize dishes', 'Clean dishes, utensils, and organize kitchen', 'solo', 8.00, 'Nationwide', NOW()),
('platform-003', 'Complete 30-minute workout', 'Exercise routine: yoga, walking, or gym workout', 'solo', 15.00, 'Nationwide', NOW()),
('platform-004', 'Grocery shopping trip', 'Complete grocery shopping with receipt verification', 'solo', 15.00, 'Nationwide', NOW()),
('platform-005', 'Organize living space', 'Declutter and organize room or living area', 'solo', 10.00, 'Nationwide', NOW())
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- 7. NOW add the foreign key constraint after tasks exist
ALTER TABLE task_applications 
ADD CONSTRAINT task_applications_task_id_fkey 
FOREIGN KEY (task_id) REFERENCES tasks(id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks are viewable by everyone, but only creators can modify
CREATE POLICY "Tasks are viewable by everyone" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = created_by);

-- Task applications - users can view their own applications
CREATE POLICY "Users can view own applications" ON task_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON task_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON task_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Task submissions - users can view and create their own submissions
CREATE POLICY "Users can view own submissions" ON task_submissions
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM task_applications WHERE id = application_id)
  );

CREATE POLICY "Users can create submissions" ON task_submissions
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM task_applications WHERE id = application_id)
  );

-- Transactions - users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- 10. Create Storage Bucket for task photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Create Storage Policy for task photos
CREATE POLICY "Anyone can view task photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-photos');

CREATE POLICY "Authenticated users can upload task photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-photos' AND
    auth.role() = 'authenticated'
  );

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(zip_code, city, state);
CREATE INDEX IF NOT EXISTS idx_task_applications_user ON task_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_applications_task ON task_applications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_applications_status ON task_applications(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- 13. Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_applications_updated_at BEFORE UPDATE ON task_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ✅ Database setup complete!
-- Your BittieTasks database is now ready with:
-- - User profiles and authentication
-- - Task management system
-- - Application and submission tracking
-- - Payment transaction records
-- - Row Level Security enabled
-- - Storage bucket for photos
-- - Performance indexes
-- - Everyday platform tasks loaded
-- - FIXED: No more foreign key type mismatch errors!