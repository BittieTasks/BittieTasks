-- WORKING RLS POLICIES - Fixed variable scope issues
-- Creates correct policies based on actual column types

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
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
    END IF;
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
-- USERS TABLE POLICIES - Try both UUID and text casting
-- ============================================================================

-- Check if users table exists and create policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Create policies that work for both UUID and VARCHAR columns
        -- Using a more flexible approach
        
        CREATE POLICY "users_own_profile_read" ON users
            FOR SELECT USING (
                id::text = auth.uid()::text
            );
            
        CREATE POLICY "users_own_profile_write" ON users
            FOR UPDATE USING (
                id::text = auth.uid()::text
            );
            
        CREATE POLICY "users_own_profile_create" ON users
            FOR INSERT WITH CHECK (
                id::text = auth.uid()::text
            );
            
        -- Admin access
        CREATE POLICY "admin_users_manage" ON users
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- TASKS TABLE POLICIES - Flexible type handling
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Public read access for approved tasks
        CREATE POLICY "tasks_public_marketplace" ON tasks
            FOR SELECT USING (
                auth.role() = 'authenticated' 
                AND (
                    approval_status = 'approved' 
                    OR created_by::text = auth.uid()::text
                )
            );
            
        -- Users can view their own tasks
        CREATE POLICY "tasks_own_view" ON tasks
            FOR SELECT USING (
                created_by::text = auth.uid()::text
            );
            
        -- Users can create new tasks
        CREATE POLICY "tasks_create_own" ON tasks
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' 
                AND (created_by::text = auth.uid()::text OR created_by IS NULL)
            );
            
        -- Users can update their own tasks
        CREATE POLICY "tasks_update_own" ON tasks
            FOR UPDATE USING (
                created_by::text = auth.uid()::text 
                AND (approval_status = 'pending' OR approval_status IS NULL)
            );
            
        -- Users can delete their own tasks
        CREATE POLICY "tasks_delete_own" ON tasks
            FOR DELETE USING (
                created_by::text = auth.uid()::text 
                AND (approval_status = 'pending' OR approval_status IS NULL)
            );
            
        -- Admin can manage all tasks
        CREATE POLICY "admin_tasks_full_access" ON tasks
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- TASK PARTICIPANTS TABLE POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        -- Users can view participants for tasks they created or joined
        CREATE POLICY "participants_relevant_view" ON task_participants
            FOR SELECT USING (
                user_id::text = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_participants.task_id 
                    AND tasks.created_by::text = auth.uid()::text
                )
            );
            
        -- Users can join tasks
        CREATE POLICY "participants_join_tasks" ON task_participants
            FOR INSERT WITH CHECK (
                user_id::text = auth.uid()::text
                AND EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_participants.task_id 
                    AND tasks.approval_status = 'approved'
                    AND tasks.status = 'open'
                )
            );
            
        -- Users can update their own participation
        CREATE POLICY "participants_update_own" ON task_participants
            FOR UPDATE USING (
                user_id::text = auth.uid()::text
            );
            
        -- Task creators can update participant status
        CREATE POLICY "participants_creator_manage" ON task_participants
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_participants.task_id 
                    AND tasks.created_by::text = auth.uid()::text
                )
            );
    END IF;
END $$;

-- ============================================================================
-- TASK MESSAGES TABLE POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        -- Users can view messages in tasks they're involved with
        CREATE POLICY "messages_involved_view" ON task_messages
            FOR SELECT USING (
                sender_id::text = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_messages.task_id 
                    AND tasks.created_by::text = auth.uid()::text
                )
                OR EXISTS (
                    SELECT 1 FROM task_participants 
                    WHERE task_participants.task_id = task_messages.task_id 
                    AND task_participants.user_id::text = auth.uid()::text
                )
            );
            
        -- Users can send messages in tasks they're involved with
        CREATE POLICY "messages_send_involved" ON task_messages
            FOR INSERT WITH CHECK (
                sender_id::text = auth.uid()::text
                AND (
                    EXISTS (
                        SELECT 1 FROM tasks 
                        WHERE tasks.id = task_messages.task_id 
                        AND tasks.created_by::text = auth.uid()::text
                    )
                    OR EXISTS (
                        SELECT 1 FROM task_participants 
                        WHERE task_participants.task_id = task_messages.task_id 
                        AND task_participants.user_id::text = auth.uid()::text
                    )
                )
            );
            
        -- Users can update their own messages
        CREATE POLICY "messages_update_own" ON task_messages
            FOR UPDATE USING (
                sender_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- TASK VERIFICATIONS TABLE POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_verifications') THEN
        -- Users can view verifications for their tasks or submissions
        CREATE POLICY "verifications_relevant_view" ON task_verifications
            FOR SELECT USING (
                user_id::text = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_verifications.task_id 
                    AND tasks.created_by::text = auth.uid()::text
                )
            );
            
        -- Users can create verifications for their participations
        CREATE POLICY "verifications_create_own" ON task_verifications
            FOR INSERT WITH CHECK (
                user_id::text = auth.uid()::text
                AND EXISTS (
                    SELECT 1 FROM task_participants 
                    WHERE task_participants.task_id = task_verifications.task_id 
                    AND task_participants.user_id::text = auth.uid()::text
                )
            );
            
        -- Users can update their own verification submissions
        CREATE POLICY "verifications_update_own" ON task_verifications
            FOR UPDATE USING (
                user_id::text = auth.uid()::text
            );
            
        -- Admin can manage all verifications
        CREATE POLICY "admin_verifications_manage" ON task_verifications
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- USER PRESENCE TABLE POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_presence') THEN
        -- Users can view all user presence (for online status)
        CREATE POLICY "presence_view_all" ON user_presence
            FOR SELECT USING (auth.role() = 'authenticated');
            
        -- Users can manage their own presence
        CREATE POLICY "presence_manage_own" ON user_presence
            FOR ALL USING (
                user_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        -- Users can view their own payments
        CREATE POLICY "payments_own_view" ON payments
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        -- Task creators can view payments for their tasks
        CREATE POLICY "payments_creator_view" ON payments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = payments.task_id 
                    AND tasks.created_by::text = auth.uid()::text
                )
            );
            
        -- System can create payments
        CREATE POLICY "payments_system_create" ON payments
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
            
        -- Admin can manage all payments
        CREATE POLICY "admin_payments_manage" ON payments
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- USER EARNINGS TABLE POLICIES
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_earnings') THEN
        -- Users can view their own earnings
        CREATE POLICY "earnings_own_view" ON user_earnings
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        -- System can create earnings records
        CREATE POLICY "earnings_system_create" ON user_earnings
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
            
        -- Admin can view all earnings
        CREATE POLICY "admin_earnings_view" ON user_earnings
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE id::text = auth.uid()::text 
                    AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
                )
            );
    END IF;
END $$;

-- ============================================================================
-- GRANT ESSENTIAL PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic table permissions for existing tables only
DO $$
BEGIN
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
SELECT 'Working RLS policies applied successfully!' AS status;