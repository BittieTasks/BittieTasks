-- SIMPLE DIRECT RLS POLICIES - Uses actual database column names
-- Based on error messages showing: created_by, user_id, sender_id, receiver_id

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
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================================================
-- USERS TABLE POLICIES - Direct ID comparison
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
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
    END IF;
END $$;

-- ============================================================================
-- TASKS TABLE POLICIES - Using created_by (actual column name)
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
            
        -- Users can create new tasks
        CREATE POLICY "tasks_create_own" ON tasks
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' 
                AND (
                    created_by::text = auth.uid()::text
                    OR created_by IS NULL
                )
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
    END IF;
END $$;

-- ============================================================================
-- TASK PARTICIPANTS - Using user_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        CREATE POLICY "participants_own_view" ON task_participants
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "participants_join_tasks" ON task_participants
            FOR INSERT WITH CHECK (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "participants_update_own" ON task_participants
            FOR UPDATE USING (
                user_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- TASK MESSAGES - Using sender_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        CREATE POLICY "task_messages_own_view" ON task_messages
            FOR SELECT USING (
                sender_id::text = auth.uid()::text
            );
            
        CREATE POLICY "task_messages_send_own" ON task_messages
            FOR INSERT WITH CHECK (
                sender_id::text = auth.uid()::text
            );
            
        CREATE POLICY "task_messages_update_own" ON task_messages
            FOR UPDATE USING (
                sender_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- TASK VERIFICATIONS - Using user_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_verifications') THEN
        CREATE POLICY "verifications_own_view" ON task_verifications
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "verifications_create_own" ON task_verifications
            FOR INSERT WITH CHECK (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "verifications_update_own" ON task_verifications
            FOR UPDATE USING (
                user_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- USER PRESENCE - Using user_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_presence') THEN
        CREATE POLICY "presence_view_all" ON user_presence
            FOR SELECT USING (auth.role() = 'authenticated');
            
        CREATE POLICY "presence_manage_own" ON user_presence
            FOR ALL USING (
                user_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- PAYMENTS - Using user_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE POLICY "payments_own_view" ON payments
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "payments_system_create" ON payments
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- USER EARNINGS - Using user_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_earnings') THEN
        CREATE POLICY "earnings_own_view" ON user_earnings
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "earnings_system_create" ON user_earnings
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- MESSAGES - Using sender_id, receiver_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        CREATE POLICY "messages_own_view" ON messages
            FOR SELECT USING (
                sender_id::text = auth.uid()::text
                OR receiver_id::text = auth.uid()::text
            );
            
        CREATE POLICY "messages_send_own" ON messages
            FOR INSERT WITH CHECK (
                sender_id::text = auth.uid()::text
            );
    END IF;
END $$;

-- ============================================================================
-- USER ACHIEVEMENTS - Using user_id (snake_case)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        CREATE POLICY "achievements_own_view" ON user_achievements
            FOR SELECT USING (
                user_id::text = auth.uid()::text
            );
            
        CREATE POLICY "achievements_system_create" ON user_achievements
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- GRANT ESSENTIAL PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions only on tables that exist
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
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_presence') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON user_presence TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        GRANT SELECT ON payments TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_earnings') THEN
        GRANT SELECT ON user_earnings TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        GRANT SELECT ON user_achievements TO authenticated;
    END IF;
    
    -- Grant service role permissions for system operations
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
END $$;

-- Success message
SELECT 'Simple direct RLS policies applied successfully!' AS status;