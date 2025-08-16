-- Create messaging tables for Phase 4A real-time communication

-- Task Messages Table
CREATE TABLE IF NOT EXISTS task_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id VARCHAR NOT NULL,
  sender_id VARCHAR NOT NULL,
  message_type VARCHAR DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  content TEXT NOT NULL,
  file_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  read_at TIMESTAMP,
  is_system_message BOOLEAN DEFAULT FALSE
);

-- User Presence Table  
CREATE TABLE IF NOT EXISTS user_presence (
  user_id VARCHAR PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP DEFAULT NOW(),
  current_task_id VARCHAR
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_messages_task_id ON task_messages(task_id);
CREATE INDEX IF NOT EXISTS idx_task_messages_sender_id ON task_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_task_messages_created_at ON task_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence(is_online);
CREATE INDEX IF NOT EXISTS idx_user_presence_current_task_id ON user_presence(current_task_id);

-- Add RLS policies for security
ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Users can read messages for tasks they're involved in
CREATE POLICY "Users can read task messages they have access to" ON task_messages
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks WHERE created_by = auth.uid()
      UNION
      SELECT task_id FROM task_participants WHERE user_id = auth.uid()
    )
  );

-- Users can send messages for tasks they're involved in  
CREATE POLICY "Users can send messages for their tasks" ON task_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    task_id IN (
      SELECT id FROM tasks WHERE created_by = auth.uid()
      UNION
      SELECT task_id FROM task_participants WHERE user_id = auth.uid()
    )
  );

-- Users can manage their own presence
CREATE POLICY "Users can manage their own presence" ON user_presence
  FOR ALL USING (user_id = auth.uid());

-- Users can read presence of others in their tasks
CREATE POLICY "Users can read presence of task participants" ON user_presence
  FOR SELECT USING (
    user_id IN (
      SELECT created_by FROM tasks WHERE created_by = auth.uid()
      OR id IN (SELECT task_id FROM task_participants WHERE user_id = auth.uid())
      UNION
      SELECT user_id FROM task_participants WHERE task_id IN (
        SELECT id FROM tasks WHERE created_by = auth.uid()
        UNION
        SELECT task_id FROM task_participants WHERE user_id = auth.uid()
      )
    )
  );