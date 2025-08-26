-- TYPE-SAFE RLS POLICIES
-- Fixed to handle UUID vs VARCHAR column types correctly

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
-- USERS TABLE POLICIES - Handle both UUID and VARCHAR ID types
-- ============================================================================

-- Check column type and create appropriate policy for users table
DO $$
DECLARE
    id_column_type text;
BEGIN
    -- Get the data type of the id column in users table
    SELECT data_type INTO id_column_type
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
    
    -- Create policies based on column type
    IF id_column_type = 'uuid' THEN
        -- UUID column type - no casting needed
        CREATE POLICY "users_own_profile_read" ON users
            FOR SELECT USING (id = auth.uid());
        CREATE POLICY "users_own_profile_write" ON users
            FOR UPDATE USING (id = auth.uid());
        CREATE POLICY "users_own_profile_create" ON users
            FOR INSERT WITH CHECK (id = auth.uid());
    ELSE
        -- VARCHAR or other text type - cast auth.uid() to text
        CREATE POLICY "users_own_profile_read" ON users
            FOR SELECT USING (id = auth.uid()::text);
        CREATE POLICY "users_own_profile_write" ON users
            FOR UPDATE USING (id = auth.uid()::text);
        CREATE POLICY "users_own_profile_create" ON users
            FOR INSERT WITH CHECK (id = auth.uid()::text);
    END IF;
    
    -- Admin access (works for both types)
    CREATE POLICY "admin_users_manage" ON users
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE (
                    CASE 
                        WHEN id_column_type = 'uuid' THEN id = auth.uid()
                        ELSE id = auth.uid()::text
                    END
                ) 
                AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
            )
        );
END $$;

-- ============================================================================
-- TASKS TABLE POLICIES - Handle both UUID and VARCHAR types
-- ============================================================================

DO $$
DECLARE
    created_by_column_type text;
BEGIN
    -- Get the data type of created_by column in tasks table
    SELECT data_type INTO created_by_column_type
    FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'created_by' AND table_schema = 'public';
    
    -- Create policies based on column type
    IF created_by_column_type = 'uuid' THEN
        -- UUID column type
        CREATE POLICY "tasks_public_marketplace" ON tasks
            FOR SELECT USING (
                auth.role() = 'authenticated' 
                AND (
                    approval_status = 'approved' 
                    OR created_by = auth.uid()
                )
            );
        CREATE POLICY "tasks_own_view" ON tasks
            FOR SELECT USING (created_by = auth.uid());
        CREATE POLICY "tasks_create_own" ON tasks
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' 
                AND (created_by = auth.uid() OR created_by IS NULL)
            );
        CREATE POLICY "tasks_update_own" ON tasks
            FOR UPDATE USING (
                created_by = auth.uid() 
                AND approval_status = 'pending'
            );
        CREATE POLICY "tasks_delete_own" ON tasks
            FOR DELETE USING (
                created_by = auth.uid() 
                AND approval_status = 'pending'
            );
    ELSE
        -- VARCHAR or text type
        CREATE POLICY "tasks_public_marketplace" ON tasks
            FOR SELECT USING (
                auth.role() = 'authenticated' 
                AND (
                    approval_status = 'approved' 
                    OR created_by = auth.uid()::text
                )
            );
        CREATE POLICY "tasks_own_view" ON tasks
            FOR SELECT USING (created_by = auth.uid()::text);
        CREATE POLICY "tasks_create_own" ON tasks
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' 
                AND (created_by = auth.uid()::text OR created_by IS NULL)
            );
        CREATE POLICY "tasks_update_own" ON tasks
            FOR UPDATE USING (
                created_by = auth.uid()::text 
                AND approval_status = 'pending'
            );
        CREATE POLICY "tasks_delete_own" ON tasks
            FOR DELETE USING (
                created_by = auth.uid()::text 
                AND approval_status = 'pending'
            );
    END IF;
    
    -- Admin can manage all tasks (works for both types)
    CREATE POLICY "admin_tasks_full_access" ON tasks
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE (
                    CASE 
                        WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') = 'uuid' 
                        THEN users.id = auth.uid()
                        ELSE users.id = auth.uid()::text
                    END
                ) 
                AND (email ILIKE '%admin%' OR email = 'admin@bittietasks.com')
            )
        );
END $$;

-- ============================================================================
-- TASK PARTICIPANTS TABLE POLICIES 
-- ============================================================================

DO $$
DECLARE
    user_id_column_type text;
BEGIN
    -- Get the data type of user_id column in task_participants table
    SELECT data_type INTO user_id_column_type
    FROM information_schema.columns 
    WHERE table_name = 'task_participants' AND column_name = 'user_id' AND table_schema = 'public';
    
    -- Create policies based on column type
    IF user_id_column_type = 'uuid' THEN
        -- UUID column type
        CREATE POLICY "participants_relevant_view" ON task_participants
            FOR SELECT USING (
                user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_participants.task_id 
                    AND (
                        CASE 
                            WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by') = 'uuid'
                            THEN tasks.created_by = auth.uid()
                            ELSE tasks.created_by = auth.uid()::text
                        END
                    )
                )
            );
        CREATE POLICY "participants_join_tasks" ON task_participants
            FOR INSERT WITH CHECK (user_id = auth.uid());
        CREATE POLICY "participants_update_own" ON task_participants
            FOR UPDATE USING (user_id = auth.uid());
    ELSE
        -- VARCHAR or text type
        CREATE POLICY "participants_relevant_view" ON task_participants
            FOR SELECT USING (
                user_id = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM tasks 
                    WHERE tasks.id = task_participants.task_id 
                    AND (
                        CASE 
                            WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by') = 'uuid'
                            THEN tasks.created_by = auth.uid()
                            ELSE tasks.created_by = auth.uid()::text
                        END
                    )
                )
            );
        CREATE POLICY "participants_join_tasks" ON task_participants
            FOR INSERT WITH CHECK (user_id = auth.uid()::text);
        CREATE POLICY "participants_update_own" ON task_participants
            FOR UPDATE USING (user_id = auth.uid()::text);
    END IF;
END $$;

-- ============================================================================
-- SIMPLIFIED POLICIES FOR OTHER TABLES (handle both types dynamically)
-- ============================================================================

-- Task messages
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        CREATE POLICY "messages_involved_view" ON task_messages
            FOR SELECT USING (
                (
                    CASE 
                        WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'task_messages' AND column_name = 'sender_id') = 'uuid'
                        THEN sender_id = auth.uid()::uuid
                        ELSE sender_id = auth.uid()::text
                    END
                )
                OR auth.role() = 'service_role'
            );
        CREATE POLICY "messages_send_involved" ON task_messages
            FOR INSERT WITH CHECK (
                CASE 
                    WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'task_messages' AND column_name = 'sender_id') = 'uuid'
                    THEN sender_id = auth.uid()::uuid
                    ELSE sender_id = auth.uid()::text
                END
            );
    END IF;
END $$;

-- User presence
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_presence') THEN
        CREATE POLICY "presence_view_all" ON user_presence
            FOR SELECT USING (auth.role() = 'authenticated');
        CREATE POLICY "presence_manage_own" ON user_presence
            FOR ALL USING (
                CASE 
                    WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'user_presence' AND column_name = 'user_id') = 'uuid'
                    THEN user_id = auth.uid()::uuid
                    ELSE user_id = auth.uid()::text
                END
            );
    END IF;
END $$;

-- Payments
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        CREATE POLICY "payments_own_view" ON payments
            FOR SELECT USING (
                CASE 
                    WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'user_id') = 'uuid'
                    THEN user_id = auth.uid()::uuid
                    ELSE user_id = auth.uid()::text
                END
            );
        CREATE POLICY "payments_system_create" ON payments
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- User earnings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_earnings') THEN
        CREATE POLICY "earnings_own_view" ON user_earnings
            FOR SELECT USING (
                CASE 
                    WHEN (SELECT data_type FROM information_schema.columns WHERE table_name = 'user_earnings' AND column_name = 'user_id') = 'uuid'
                    THEN user_id = auth.uid()::uuid
                    ELSE user_id = auth.uid()::text
                END
            );
        CREATE POLICY "earnings_system_create" ON user_earnings
            FOR INSERT WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;

-- ============================================================================
-- GRANT ESSENTIAL PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant basic table permissions
DO $$
BEGIN
    -- Grant permissions on core tables that exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        GRANT SELECT, INSERT, UPDATE ON task_participants TO authenticated;
    END IF;
    
    -- Grant service role permissions for system operations
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
END $$;

-- Success message
SELECT 'Type-safe RLS policies applied successfully!' AS status;