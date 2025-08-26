-- SIMPLE SAFE RLS POLICIES - Direct comparisons only
-- No complex casting or COALESCE operations

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
END $$;

-- ============================================================================
-- USERS TABLE POLICIES - Try direct comparison first
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Direct comparison - let PostgreSQL handle the types
        CREATE POLICY "users_own_profile_read" ON users
            FOR SELECT USING (
                (id IS NOT NULL AND auth.uid() IS NOT NULL AND id = auth.uid())
                OR (id IS NULL AND auth.uid() IS NULL)
            );
            
        CREATE POLICY "users_own_profile_write" ON users
            FOR UPDATE USING (
                (id IS NOT NULL AND auth.uid() IS NOT NULL AND id = auth.uid())
                OR (id IS NULL AND auth.uid() IS NULL)
            );
            
        CREATE POLICY "users_own_profile_create" ON users
            FOR INSERT WITH CHECK (
                (id IS NOT NULL AND auth.uid() IS NOT NULL AND id = auth.uid())
                OR (id IS NULL AND auth.uid() IS NULL)
            );
    END IF;
END $$;

-- ============================================================================
-- TASKS TABLE POLICIES - Direct comparisons only
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
                    OR (created_by IS NOT NULL AND auth.uid() IS NOT NULL AND created_by = auth.uid())
                )
            );
            
        -- Users can create new tasks
        CREATE POLICY "tasks_create_own" ON tasks
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' 
                AND (
                    (created_by IS NOT NULL AND auth.uid() IS NOT NULL AND created_by = auth.uid())
                    OR created_by IS NULL
                )
            );
            
        -- Users can update their own tasks
        CREATE POLICY "tasks_update_own" ON tasks
            FOR UPDATE USING (
                (created_by IS NOT NULL AND auth.uid() IS NOT NULL AND created_by = auth.uid())
                AND (approval_status = 'pending' OR approval_status IS NULL)
            );
            
        -- Users can delete their own tasks
        CREATE POLICY "tasks_delete_own" ON tasks
            FOR DELETE USING (
                (created_by IS NOT NULL AND auth.uid() IS NOT NULL AND created_by = auth.uid())
                AND (approval_status = 'pending' OR approval_status IS NULL)
            );
    END IF;
END $$;

-- ============================================================================
-- TASK PARTICIPANTS - Direct comparisons only
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        -- Users can view their own participations
        CREATE POLICY "participants_own_view" ON task_participants
            FOR SELECT USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
            
        -- Users can join tasks
        CREATE POLICY "participants_join_tasks" ON task_participants
            FOR INSERT WITH CHECK (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
            
        -- Users can update their own participation
        CREATE POLICY "participants_update_own" ON task_participants
            FOR UPDATE USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
    END IF;
END $$;

-- ============================================================================
-- TASK MESSAGES - Direct comparisons only
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        -- Users can view messages they sent
        CREATE POLICY "messages_own_view" ON task_messages
            FOR SELECT USING (
                (sender_id IS NOT NULL AND auth.uid() IS NOT NULL AND sender_id = auth.uid())
            );
            
        -- Users can send messages
        CREATE POLICY "messages_send_own" ON task_messages
            FOR INSERT WITH CHECK (
                (sender_id IS NOT NULL AND auth.uid() IS NOT NULL AND sender_id = auth.uid())
            );
            
        -- Users can update their own messages
        CREATE POLICY "messages_update_own" ON task_messages
            FOR UPDATE USING (
                (sender_id IS NOT NULL AND auth.uid() IS NOT NULL AND sender_id = auth.uid())
            );
    END IF;
END $$;

-- ============================================================================
-- TASK VERIFICATIONS - Direct comparisons only
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_verifications') THEN
        -- Users can view their own verifications
        CREATE POLICY "verifications_own_view" ON task_verifications
            FOR SELECT USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
            
        -- Users can create their own verifications
        CREATE POLICY "verifications_create_own" ON task_verifications
            FOR INSERT WITH CHECK (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
            
        -- Users can update their own verifications
        CREATE POLICY "verifications_update_own" ON task_verifications
            FOR UPDATE USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
    END IF;
END $$;

-- ============================================================================
-- USER PRESENCE - Direct comparisons only
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_presence') THEN
        -- Everyone can view presence (for online status)
        CREATE POLICY "presence_view_all" ON user_presence
            FOR SELECT USING (auth.role() = 'authenticated');
            
        -- Users can manage their own presence
        CREATE POLICY "presence_manage_own" ON user_presence
            FOR ALL USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
    END IF;
END $$;

-- ============================================================================
-- PAYMENTS - Direct comparisons only
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        -- Users can view their own payments
        CREATE POLICY "payments_own_view" ON payments
            FOR SELECT USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
            
        -- System can create payments
        CREATE POLICY "payments_system_create" ON payments
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- USER EARNINGS - Direct comparisons only
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_earnings') THEN
        -- Users can view their own earnings
        CREATE POLICY "earnings_own_view" ON user_earnings
            FOR SELECT USING (
                (user_id IS NOT NULL AND auth.uid() IS NOT NULL AND user_id = auth.uid())
            );
            
        -- System can create earnings
        CREATE POLICY "earnings_system_create" ON user_earnings
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- MESSAGES - Direct comparisons only (if different from task_messages)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        -- Users can view their own messages
        CREATE POLICY "direct_messages_own_view" ON messages
            FOR SELECT USING (
                (sender_id IS NOT NULL AND auth.uid() IS NOT NULL AND sender_id = auth.uid())
                OR (receiver_id IS NOT NULL AND auth.uid() IS NOT NULL AND receiver_id = auth.uid())
            );
            
        -- Users can send messages
        CREATE POLICY "direct_messages_send_own" ON messages
            FOR INSERT WITH CHECK (
                (sender_id IS NOT NULL AND auth.uid() IS NOT NULL AND sender_id = auth.uid())
            );
    END IF;
END $$;

-- ============================================================================
-- GRANT ESSENTIAL PERMISSIONS - Only for existing tables
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
    
    -- Grant service role permissions for system operations
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
END $$;

-- Success message
SELECT 'Simple safe RLS policies applied successfully!' AS status;