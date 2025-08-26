-- MINIMAL RLS POLICIES - SIMPLIFIED VERSION TO AVOID TYPE CONFLICTS

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Enable RLS on essential tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- MINIMAL USER POLICIES (avoid complex comparisons)
-- Users can view their own profile using simple string comparison
CREATE POLICY "users_view_own" ON users 
  FOR SELECT USING (id = auth.uid()::text);

CREATE POLICY "users_update_own" ON users 
  FOR UPDATE USING (id = auth.uid()::text);

CREATE POLICY "users_insert_own" ON users 
  FOR INSERT WITH CHECK (id = auth.uid()::text);

-- MINIMAL TASK POLICIES  
-- All authenticated users can view approved tasks (public reading)
CREATE POLICY "tasks_public_read" ON tasks 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can manage their own tasks (basic ownership)
CREATE POLICY "tasks_owner_full" ON tasks 
  FOR ALL USING (created_by = auth.uid()::text OR created_by IS NULL);

-- ADMIN POLICIES (simple email check)
CREATE POLICY "admin_all_users" ON users 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND email = 'admin@bittietasks.com'
    )
  );

CREATE POLICY "admin_all_tasks" ON tasks 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::text 
      AND email = 'admin@bittietasks.com'
    )
  );

-- Grant basic permissions for public access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON tasks TO authenticated;
GRANT ALL ON users TO authenticated;