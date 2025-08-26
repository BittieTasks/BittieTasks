-- CORRECTED RLS POLICIES - MATCHES ACTUAL DATABASE STRUCTURE
-- This addresses all type casting and column naming issues properly

-- Drop ALL existing policies to start fresh and avoid conflicts
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

-- Enable RLS on all relevant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_earnings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- USERS POLICIES - auth.uid() cast to TEXT to match VARCHAR columns
-- ==============================================================================

-- Users can view their own profile
CREATE POLICY "users_own_profile_select" ON users
    FOR SELECT USING (id = auth.uid()::text);

-- Users can update their own profile  
CREATE POLICY "users_own_profile_update" ON users
    FOR UPDATE USING (id = auth.uid()::text);

-- Users can insert their own profile (during registration)
CREATE POLICY "users_own_profile_insert" ON users
    FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Admin can view all users (admin@bittietasks.com)
CREATE POLICY "admin_users_select" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND email = 'admin@bittietasks.com'
        )
    );

-- ==============================================================================
-- TASKS POLICIES - Uses correct 'created_by' column name
-- ==============================================================================

-- All authenticated users can view approved tasks (public marketplace)
CREATE POLICY "tasks_public_read" ON tasks
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND approval_status = 'approved'
        AND status = 'open'
    );

-- Users can view their own tasks (any status)
CREATE POLICY "tasks_creator_select" ON tasks
    FOR SELECT USING (created_by = auth.uid()::text);

-- Users can create new tasks (will be pending approval)
CREATE POLICY "tasks_creator_insert" ON tasks
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND (created_by = auth.uid()::text OR created_by IS NULL)
    );

-- Users can update their own tasks (before approval)
CREATE POLICY "tasks_creator_update" ON tasks
    FOR UPDATE USING (
        created_by = auth.uid()::text 
        AND approval_status = 'pending'
    );

-- Users can delete their own tasks (before approval)
CREATE POLICY "tasks_creator_delete" ON tasks
    FOR DELETE USING (
        created_by = auth.uid()::text 
        AND approval_status = 'pending'
    );

-- Admin can manage all tasks
CREATE POLICY "admin_tasks_full" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND email = 'admin@bittietasks.com'
        )
    );

-- ==============================================================================
-- TASK PARTICIPANTS POLICIES
-- ==============================================================================

-- Users can view participants for tasks they created
CREATE POLICY "participants_creator_select" ON task_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_participants.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- Users can view their own participations
CREATE POLICY "participants_own_select" ON task_participants
    FOR SELECT USING (user_id = auth.uid()::text);

-- Users can join tasks (insert participation)
CREATE POLICY "participants_join_insert" ON task_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_participants.task_id 
            AND tasks.approval_status = 'approved'
            AND tasks.status = 'open'
        )
    );

-- Users can update their own participations
CREATE POLICY "participants_own_update" ON task_participants
    FOR UPDATE USING (user_id = auth.uid()::text);

-- ==============================================================================
-- MESSAGES POLICIES (if using task messaging)
-- ==============================================================================

-- Users can view messages in tasks they participate in
CREATE POLICY "messages_participant_select" ON messages
    FOR SELECT USING (
        -- Message sender can view
        from_user_id = auth.uid()::text
        OR
        -- Message recipient can view  
        to_user_id = auth.uid()::text
        OR
        -- Task creator can view task messages
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = messages.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- Users can send messages in tasks they participate in
CREATE POLICY "messages_participant_insert" ON messages
    FOR INSERT WITH CHECK (
        from_user_id = auth.uid()::text
        AND (
            -- Can message task creator
            EXISTS (
                SELECT 1 FROM tasks 
                WHERE tasks.id = messages.task_id 
                AND tasks.created_by = to_user_id
            )
            OR
            -- Task creator can message participants
            EXISTS (
                SELECT 1 FROM tasks 
                WHERE tasks.id = messages.task_id 
                AND tasks.created_by = auth.uid()::text
            )
        )
    );

-- ==============================================================================
-- GRANT PERMISSIONS FOR API ACCESS
-- ==============================================================================

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON tasks TO authenticated;
GRANT SELECT ON users TO authenticated;
GRANT INSERT ON task_participants TO authenticated;
GRANT UPDATE ON task_participants TO authenticated;

-- Grant admin permissions for service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;