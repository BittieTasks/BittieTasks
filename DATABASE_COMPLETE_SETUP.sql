-- Complete the database setup with RLS policies and storage
-- Run this after the main tables are created

-- Add RLS Policies for secure data access

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

-- Create Storage Bucket for task photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-photos', 'task-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create Storage Policy for task photos
CREATE POLICY "Anyone can view task photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-photos');

CREATE POLICY "Authenticated users can upload task photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'task-photos' AND
    auth.role() = 'authenticated'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON tasks(zip_code, city, state);
CREATE INDEX IF NOT EXISTS idx_task_applications_user ON task_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_applications_task ON task_applications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_applications_status ON task_applications(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_applications_updated_at BEFORE UPDATE ON task_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify everything is working
SELECT 'Database setup complete!' as status;