-- ESSENTIAL RLS POLICIES - ONLY FOR EXISTING TABLES
-- Covers core functionality without referencing non-existent tables

-- Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename;
    END LOOP;
END $$;

-- Enable RLS on core tables that exist
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS task_participants ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- USERS POLICIES - Essential user security
-- ==============================================================================

-- Users can view their own profile
CREATE POLICY "users_own_select" ON users
    FOR SELECT USING (id = auth.uid()::text);

-- Users can update their own profile  
CREATE POLICY "users_own_update" ON users
    FOR UPDATE USING (id = auth.uid()::text);

-- Users can insert their own profile (during registration)
CREATE POLICY "users_own_insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Admin access (if admin user exists)
CREATE POLICY "admin_users_full" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND email ILIKE '%admin%'
        )
    );

-- ==============================================================================
-- TASKS POLICIES - Core task marketplace functionality
-- ==============================================================================

-- All authenticated users can view approved/open tasks
CREATE POLICY "tasks_public_read" ON tasks
    FOR SELECT USING (
        auth.role() = 'authenticated'
        AND (
            approval_status = 'approved' 
            OR created_by = auth.uid()::text
        )
    );

-- Users can create tasks
CREATE POLICY "tasks_create" ON tasks
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
        AND (created_by = auth.uid()::text OR created_by IS NULL)
    );

-- Users can update their own tasks
CREATE POLICY "tasks_own_update" ON tasks
    FOR UPDATE USING (created_by = auth.uid()::text);

-- Users can delete their own tasks
CREATE POLICY "tasks_own_delete" ON tasks
    FOR DELETE USING (created_by = auth.uid()::text);

-- ==============================================================================
-- TASK PARTICIPANTS POLICIES (if table exists)
-- ==============================================================================

-- Users can view participants for their tasks
CREATE POLICY "participants_creator_view" ON task_participants
    FOR SELECT USING (
        user_id = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_participants.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- Users can join tasks
CREATE POLICY "participants_join" ON task_participants
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own participations
CREATE POLICY "participants_own_update" ON task_participants
    FOR UPDATE USING (user_id = auth.uid()::text);

-- ==============================================================================
-- GRANT BASIC PERMISSIONS
-- ==============================================================================

-- Grant necessary permissions for API access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON tasks TO authenticated;
GRANT ALL ON users TO authenticated;

-- Grant permissions for task participation (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        GRANT ALL ON task_participants TO authenticated;
    END IF;
END $$;