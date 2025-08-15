-- Minimal setup to ensure authentication works
-- Only add what's absolutely needed for auth to function

-- Ensure Row Level Security is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies if they don't exist
DO $$ 
BEGIN 
  -- Allow users to view their own profile (using proper UUID casting)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id::uuid);
  END IF;
  
  -- Allow users to update their own profile  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id::uuid);
  END IF;
  
  -- Allow authenticated users to insert their profile
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can create profile') THEN
    CREATE POLICY "Users can create profile" ON users
      FOR INSERT WITH CHECK (auth.uid() = id::uuid);
  END IF;
  
  -- Tasks viewable by everyone
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Tasks viewable by everyone') THEN
    CREATE POLICY "Tasks viewable by everyone" ON tasks
      FOR SELECT USING (true);
  END IF;
  
  -- Users can create tasks (host_id should match auth.uid)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can create tasks') THEN
    CREATE POLICY "Users can create tasks" ON tasks
      FOR INSERT WITH CHECK (auth.uid()::text = host_id);
  END IF;
  
  -- Users can update their own tasks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can update own tasks') THEN
    CREATE POLICY "Users can update own tasks" ON tasks
      FOR UPDATE USING (auth.uid()::text = host_id);
  END IF;
END $$;

-- Ensure essential indexes exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tasks_host_id ON tasks(host_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);