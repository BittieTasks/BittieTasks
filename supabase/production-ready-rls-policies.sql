-- PRODUCTION-READY RLS POLICIES
-- Comprehensive security for ALL tables with correct column names and type casting
-- This matches the actual database structure exactly

-- Clean slate - drop all existing policies
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

-- Enable RLS on all tables (only if they exist)
DO $$
BEGIN
    -- Core tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Extended tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_verifications') THEN
        ALTER TABLE task_verifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_presence') THEN
        ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_earnings') THEN
        ALTER TABLE user_earnings ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "users_own_profile_read" ON users
    FOR SELECT USING (id = auth.uid()::text);

-- Users can update their own profile
CREATE POLICY "users_own_profile_write" ON users
    FOR UPDATE USING (id = auth.uid()::text);

-- Users can insert their own profile during registration
CREATE POLICY "users_own_profile_create" ON users
    FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Admin access for user management
CREATE POLICY "admin_users_manage" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
        )
    );

-- ============================================================================
-- TASKS TABLE POLICIES - Uses 'created_by' field name
-- ============================================================================

-- Public read access for approved tasks (marketplace view)
CREATE POLICY "tasks_public_marketplace" ON tasks
    FOR SELECT USING (
        auth.role() = 'authenticated' 
        AND approval_status = 'approved' 
        AND status IN ('open', 'active')
    );

-- Users can view their own tasks (any status)
CREATE POLICY "tasks_own_view" ON tasks
    FOR SELECT USING (created_by = auth.uid()::text);

-- Users can create new tasks
CREATE POLICY "tasks_create_own" ON tasks
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' 
        AND (created_by = auth.uid()::text OR created_by IS NULL)
    );

-- Users can update their own tasks (before approval)
CREATE POLICY "tasks_update_own" ON tasks
    FOR UPDATE USING (
        created_by = auth.uid()::text 
        AND approval_status = 'pending'
    );

-- Users can delete their own tasks (before approval)
CREATE POLICY "tasks_delete_own" ON tasks
    FOR DELETE USING (
        created_by = auth.uid()::text 
        AND approval_status = 'pending'
    );

-- Admin can manage all tasks
CREATE POLICY "admin_tasks_full_access" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
        )
    );

-- ============================================================================
-- TASK PARTICIPANTS TABLE POLICIES
-- ============================================================================

-- Users can view participants for tasks they created or joined
CREATE POLICY "participants_relevant_view" ON task_participants
    FOR SELECT USING (
        user_id = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_participants.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- Users can join tasks (create participation)
CREATE POLICY "participants_join_tasks" ON task_participants
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_participants.task_id 
            AND tasks.approval_status = 'approved'
            AND tasks.status = 'open'
        )
    );

-- Users can update their own participation status
CREATE POLICY "participants_update_own" ON task_participants
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Task creators can update participant status
CREATE POLICY "participants_creator_manage" ON task_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_participants.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- ============================================================================
-- TASK MESSAGES TABLE POLICIES (if exists)
-- ============================================================================

-- Users can view messages in tasks they're involved with
CREATE POLICY "messages_involved_view" ON task_messages
    FOR SELECT USING (
        -- Message sender can view
        sender_id = auth.uid()::text
        OR
        -- Task creator can view all task messages
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_messages.task_id 
            AND tasks.created_by = auth.uid()::text
        )
        OR
        -- Task participants can view task messages
        EXISTS (
            SELECT 1 FROM task_participants 
            WHERE task_participants.task_id = task_messages.task_id 
            AND task_participants.user_id = auth.uid()::text
        )
    );

-- Users can send messages in tasks they're involved with
CREATE POLICY "messages_send_involved" ON task_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()::text
        AND (
            -- Task creator can send messages
            EXISTS (
                SELECT 1 FROM tasks 
                WHERE tasks.id = task_messages.task_id 
                AND tasks.created_by = auth.uid()::text
            )
            OR
            -- Task participants can send messages
            EXISTS (
                SELECT 1 FROM task_participants 
                WHERE task_participants.task_id = task_messages.task_id 
                AND task_participants.user_id = auth.uid()::text
            )
        )
    );

-- Users can update their own messages (mark as read, etc.)
CREATE POLICY "messages_update_own" ON task_messages
    FOR UPDATE USING (sender_id = auth.uid()::text);

-- ============================================================================
-- TASK VERIFICATIONS TABLE POLICIES (if exists)
-- ============================================================================

-- Users can view verifications for their tasks or their own submissions
CREATE POLICY "verifications_relevant_view" ON task_verifications
    FOR SELECT USING (
        user_id = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_verifications.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- Users can create verifications for their own task participations
CREATE POLICY "verifications_create_own" ON task_verifications
    FOR INSERT WITH CHECK (
        user_id = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM task_participants 
            WHERE task_participants.task_id = task_verifications.task_id 
            AND task_participants.user_id = auth.uid()::text
        )
    );

-- Users can update their own verification submissions
CREATE POLICY "verifications_update_own" ON task_verifications
    FOR UPDATE USING (user_id = auth.uid()::text);

-- Admin can manage all verifications
CREATE POLICY "admin_verifications_manage" ON task_verifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
        )
    );

-- ============================================================================
-- USER PRESENCE TABLE POLICIES (if exists)
-- ============================================================================

-- Users can view all user presence (for online status)
CREATE POLICY "presence_view_all" ON user_presence
    FOR SELECT USING (auth.role() = 'authenticated');

-- Users can manage their own presence
CREATE POLICY "presence_manage_own" ON user_presence
    FOR ALL USING (user_id = auth.uid()::text);

-- ============================================================================
-- PAYMENTS TABLE POLICIES (if exists)
-- ============================================================================

-- Users can view their own payments
CREATE POLICY "payments_own_view" ON payments
    FOR SELECT USING (user_id = auth.uid()::text);

-- Task creators can view payments for their tasks
CREATE POLICY "payments_creator_view" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = payments.task_id 
            AND tasks.created_by = auth.uid()::text
        )
    );

-- System can create payments (service role)
CREATE POLICY "payments_system_create" ON payments
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admin can manage all payments
CREATE POLICY "admin_payments_manage" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
        )
    );

-- ============================================================================
-- USER EARNINGS TABLE POLICIES (if exists)
-- ============================================================================

-- Users can view their own earnings
CREATE POLICY "earnings_own_view" ON user_earnings
    FOR SELECT USING (user_id = auth.uid()::text);

-- System can create earnings records
CREATE POLICY "earnings_system_create" ON user_earnings
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Admin can view all earnings
CREATE POLICY "admin_earnings_view" ON user_earnings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
        )
    );

-- ============================================================================
-- GRANT ESSENTIAL PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic table permissions
DO $$
BEGIN
    -- Grant permissions on core tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        GRANT SELECT, INSERT, UPDATE ON task_participants TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        GRANT SELECT, INSERT, UPDATE ON task_messages TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_verifications') THEN
        GRANT SELECT, INSERT, UPDATE ON task_verifications TO authenticated;
    END IF;
    
    -- Grant service role permissions for system operations
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
END $$;

-- Success message
SELECT 'Production-ready RLS policies applied successfully!' AS status;