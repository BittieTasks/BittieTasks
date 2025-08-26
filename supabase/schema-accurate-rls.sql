-- SCHEMA-ACCURATE RLS POLICIES - Uses exact column names from shared/schema.ts
-- All comparisons cast both sides to text for universal compatibility

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
-- USERS TABLE POLICIES - Direct comparison with text casting
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
-- TASKS TABLE POLICIES - Column name: createdBy (camelCase in schema)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Try both createdBy (schema) and created_by (DB convention)
        CREATE POLICY "tasks_public_marketplace" ON tasks
            FOR SELECT USING (
                auth.role() = 'authenticated' 
                AND (
                    approval_status = 'approved' 
                    OR (
                        CASE 
                            WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by')
                            THEN created_by::text = auth.uid()::text
                            ELSE "createdBy"::text = auth.uid()::text
                        END
                    )
                )
            );
            
        CREATE POLICY "tasks_create_own" ON tasks
            FOR INSERT WITH CHECK (
                auth.role() = 'authenticated' 
                AND (
                    CASE 
                        WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by')
                        THEN (created_by::text = auth.uid()::text OR created_by IS NULL)
                        ELSE ("createdBy"::text = auth.uid()::text OR "createdBy" IS NULL)
                    END
                )
            );
            
        CREATE POLICY "tasks_update_own" ON tasks
            FOR UPDATE USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by')
                    THEN created_by::text = auth.uid()::text
                    ELSE "createdBy"::text = auth.uid()::text
                END
                AND (approval_status = 'pending' OR approval_status IS NULL)
            );
            
        CREATE POLICY "tasks_delete_own" ON tasks
            FOR DELETE USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by')
                    THEN created_by::text = auth.uid()::text
                    ELSE "createdBy"::text = auth.uid()::text
                END
                AND (approval_status = 'pending' OR approval_status IS NULL)
            );
    END IF;
END $$;

-- ============================================================================
-- TASK PARTICIPANTS - Column name: userId (schema shows camelCase)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_participants') THEN
        CREATE POLICY "participants_own_view" ON task_participants
            FOR SELECT USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'task_participants' AND column_name = 'user_id')
                    THEN user_id::text = auth.uid()::text
                    ELSE "userId"::text = auth.uid()::text
                END
            );
            
        CREATE POLICY "participants_join_tasks" ON task_participants
            FOR INSERT WITH CHECK (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'task_participants' AND column_name = 'user_id')
                    THEN user_id::text = auth.uid()::text
                    ELSE "userId"::text = auth.uid()::text
                END
            );
            
        CREATE POLICY "participants_update_own" ON task_participants
            FOR UPDATE USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'task_participants' AND column_name = 'user_id')
                    THEN user_id::text = auth.uid()::text
                    ELSE "userId"::text = auth.uid()::text
                END
            );
    END IF;
END $$;

-- ============================================================================
-- TASK MESSAGES - Column name: senderId (schema shows camelCase)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'task_messages') THEN
        CREATE POLICY "task_messages_own_view" ON task_messages
            FOR SELECT USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'task_messages' AND column_name = 'sender_id')
                    THEN sender_id::text = auth.uid()::text
                    ELSE "senderId"::text = auth.uid()::text
                END
            );
            
        CREATE POLICY "task_messages_send_own" ON task_messages
            FOR INSERT WITH CHECK (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'task_messages' AND column_name = 'sender_id')
                    THEN sender_id::text = auth.uid()::text
                    ELSE "senderId"::text = auth.uid()::text
                END
            );
            
        CREATE POLICY "task_messages_update_own" ON task_messages
            FOR UPDATE USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'task_messages' AND column_name = 'sender_id')
                    THEN sender_id::text = auth.uid()::text
                    ELSE "senderId"::text = auth.uid()::text
                END
            );
    END IF;
END $$;

-- ============================================================================
-- TASK VERIFICATIONS - Column name: userId (schema shows snake_case)
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
-- USER PRESENCE - Column name: userId (schema shows snake_case)
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
-- PAYMENTS - Column name: userId (schema shows snake_case)
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
-- USER EARNINGS - Column name: userId (schema shows snake_case)
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
-- MESSAGES - Column names: senderId, receiverId (schema shows camelCase)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        CREATE POLICY "messages_own_view" ON messages
            FOR SELECT USING (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id')
                    THEN (sender_id::text = auth.uid()::text OR receiver_id::text = auth.uid()::text)
                    ELSE ("senderId"::text = auth.uid()::text OR "receiverId"::text = auth.uid()::text)
                END
            );
            
        CREATE POLICY "messages_send_own" ON messages
            FOR INSERT WITH CHECK (
                CASE 
                    WHEN EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'sender_id')
                    THEN sender_id::text = auth.uid()::text
                    ELSE "senderId"::text = auth.uid()::text
                END
            );
    END IF;
END $$;

-- ============================================================================
-- USER ACHIEVEMENTS - Column name: userId (schema shows snake_case)
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
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_achievements') THEN
        GRANT SELECT ON user_achievements TO authenticated;
    END IF;
    
    -- Grant service role permissions for system operations
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
END $$;

-- Success message
SELECT 'Schema-accurate RLS policies applied successfully!' AS status;