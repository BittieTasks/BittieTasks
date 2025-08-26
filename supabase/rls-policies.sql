-- Drop all existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Anyone can view task categories" ON task_categories;
DROP POLICY IF EXISTS "Admin can manage task categories" ON task_categories;
DROP POLICY IF EXISTS "Anyone can view active tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Admin can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own completions" ON task_completions;
DROP POLICY IF EXISTS "Users can create own completions" ON task_completions;
DROP POLICY IF EXISTS "Users can update own completions" ON task_completions;
DROP POLICY IF EXISTS "Task creators can view completions" ON task_completions;
DROP POLICY IF EXISTS "Admin can view all completions" ON task_completions;
DROP POLICY IF EXISTS "Users can view received messages" ON messages;
DROP POLICY IF EXISTS "Users can view sent messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update sent messages" ON messages;
DROP POLICY IF EXISTS "Users can update received messages" ON messages;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Admin can manage achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Anyone can view achievement definitions" ON achievement_definitions;
DROP POLICY IF EXISTS "Admin can manage achievement definitions" ON achievement_definitions;
DROP POLICY IF EXISTS "Anyone can view daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Admin can manage daily challenges" ON daily_challenges;
DROP POLICY IF EXISTS "Users can view own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id::uuid);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id::uuid);

-- Allow user creation during signup (handled by Supabase Auth)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id::uuid);

-- Admin users can view all users (for admin dashboard)
CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::uuid = auth.uid() 
            AND email IN ('admin@bittietasks.com', 'admin@taskparent.com')
        )
    );

-- Task Categories policies
-- Task categories are public - all authenticated users can read them
CREATE POLICY "Anyone can view task categories" ON task_categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can create/update/delete task categories
CREATE POLICY "Admin can manage task categories" ON task_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::uuid = auth.uid() 
            AND email IN ('admin@bittietasks.com', 'admin@taskparent.com')
        )
    );

-- Tasks policies
-- All authenticated users can view active tasks
CREATE POLICY "Anyone can view active tasks" ON tasks
    FOR SELECT USING (auth.role() = 'authenticated' AND status IN ('open', 'in_progress'));

-- Users can create their own tasks
CREATE POLICY "Users can create own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by::uuid OR created_by IS NULL);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = created_by::uuid);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks
    FOR DELETE USING (auth.uid() = created_by::uuid);

-- Admin can manage all tasks
CREATE POLICY "Admin can manage all tasks" ON tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::uuid = auth.uid() 
            AND email IN ('admin@bittietasks.com', 'admin@taskparent.com')
        )
    );

-- Task Completions policies
-- Users can view their own task completions
CREATE POLICY "Users can view own completions" ON task_completions
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- Users can create their own task completions
CREATE POLICY "Users can create own completions" ON task_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

-- Users can update their own task completions
CREATE POLICY "Users can update own completions" ON task_completions
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Task creators can view completions for their tasks
CREATE POLICY "Task creators can view completions" ON task_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_completions.task_id 
            AND tasks.created_by::uuid = auth.uid()
        )
    );

-- Admin can view all task completions
CREATE POLICY "Admin can view all completions" ON task_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::uuid = auth.uid() 
            AND email IN ('admin@bittietasks.com', 'admin@taskparent.com')
        )
    );

-- Messages policies
-- Users can view messages sent to them
CREATE POLICY "Users can view received messages" ON messages
    FOR SELECT USING (auth.uid() = to_user_id::uuid);

-- Users can view messages they sent
CREATE POLICY "Users can view sent messages" ON messages
    FOR SELECT USING (auth.uid() = from_user_id::uuid);

-- Users can send messages
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = from_user_id::uuid);

-- Users can update their sent messages (for read status, etc.)
CREATE POLICY "Users can update sent messages" ON messages
    FOR UPDATE USING (auth.uid() = from_user_id::uuid);

-- Recipients can mark messages as read
CREATE POLICY "Recipients can mark messages read" ON messages
    FOR UPDATE USING (auth.uid() = to_user_id::uuid);

-- User Achievements policies
-- Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- System can create achievements for users (via backend)
CREATE POLICY "System can create achievements" ON user_achievements
    FOR INSERT WITH CHECK (true);

-- Users can update their achievement visibility
CREATE POLICY "Users can update own achievements" ON user_achievements
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Achievement Definitions policies
-- All authenticated users can view achievement definitions
CREATE POLICY "Anyone can view achievement definitions" ON achievement_definitions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage achievement definitions
CREATE POLICY "Admin can manage achievements" ON achievement_definitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::uuid = auth.uid() 
            AND email IN ('admin@bittietasks.com', 'admin@taskparent.com')
        )
    );

-- Daily Challenges policies
-- All authenticated users can view active daily challenges
CREATE POLICY "Anyone can view daily challenges" ON daily_challenges
    FOR SELECT USING (auth.role() = 'authenticated' AND active = true);

-- Only admins can manage daily challenges
CREATE POLICY "Admin can manage daily challenges" ON daily_challenges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::uuid = auth.uid() 
            AND email IN ('admin@bittietasks.com', 'admin@taskparent.com')
        )
    );

-- User Challenges policies
-- Users can view their own assigned challenges
CREATE POLICY "Users can view own challenges" ON user_challenges
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- System can assign challenges to users
CREATE POLICY "System can assign challenges" ON user_challenges
    FOR INSERT WITH CHECK (true);

-- Users can update their own challenges (completion, reflection)
CREATE POLICY "Users can update own challenges" ON user_challenges
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Sessions policies (for express-session if needed)
-- Users can only access their own sessions
CREATE POLICY "Users can access own sessions" ON sessions
    FOR ALL USING (true); -- Sessions are managed by the application

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
    RETURN user_email IN ('admin@bittietasks.com', 'admin@taskparent.com');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current user's email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS text AS $$
BEGIN
    RETURN (
        SELECT email 
        FROM users 
        WHERE id = auth.uid()::text
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin policies to use the helper function
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (is_admin(get_current_user_email()));

DROP POLICY IF EXISTS "Admin can manage task categories" ON task_categories;
CREATE POLICY "Admin can manage task categories" ON task_categories
    FOR ALL USING (is_admin(get_current_user_email()));

DROP POLICY IF EXISTS "Admin can manage all tasks" ON tasks;
CREATE POLICY "Admin can manage all tasks" ON tasks
    FOR ALL USING (is_admin(get_current_user_email()));

DROP POLICY IF EXISTS "Admin can view all completions" ON task_completions;
CREATE POLICY "Admin can view all completions" ON task_completions
    FOR SELECT USING (is_admin(get_current_user_email()));

DROP POLICY IF EXISTS "Admin can manage achievements" ON achievement_definitions;
CREATE POLICY "Admin can manage achievements" ON achievement_definitions
    FOR ALL USING (is_admin(get_current_user_email()));

DROP POLICY IF EXISTS "Admin can manage daily challenges" ON daily_challenges;
CREATE POLICY "Admin can manage daily challenges" ON daily_challenges
    FOR ALL USING (is_admin(get_current_user_email()));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure the auth schema is accessible
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;