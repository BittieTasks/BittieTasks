import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupMessagingTables() {
  console.log('Setting up messaging tables...')
  
  try {
    // Create task_messages table
    const { error: messagesError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_task_messages_task_id ON task_messages(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_messages_sender_id ON task_messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_task_messages_created_at ON task_messages(created_at);
      `
    })

    if (messagesError) {
      console.error('Error creating task_messages table:', messagesError)
      return
    }

    // Create user_presence table
    const { error: presenceError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_presence (
          user_id VARCHAR PRIMARY KEY,
          is_online BOOLEAN DEFAULT FALSE,
          last_seen TIMESTAMP DEFAULT NOW(),
          current_task_id VARCHAR
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_presence_is_online ON user_presence(is_online);
        CREATE INDEX IF NOT EXISTS idx_user_presence_current_task_id ON user_presence(current_task_id);
      `
    })

    if (presenceError) {
      console.error('Error creating user_presence table:', presenceError)
      return
    }

    // Set up RLS policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE task_messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "task_messages_select_policy" ON task_messages;
        DROP POLICY IF EXISTS "task_messages_insert_policy" ON task_messages;
        DROP POLICY IF EXISTS "user_presence_all_policy" ON user_presence;
        DROP POLICY IF EXISTS "user_presence_select_policy" ON user_presence;
        
        CREATE POLICY "task_messages_select_policy" ON task_messages
          FOR SELECT USING (
            task_id IN (
              SELECT id FROM tasks WHERE created_by = auth.uid()
              UNION
              SELECT task_id FROM task_participants WHERE user_id = auth.uid()
            )
          );
          
        CREATE POLICY "task_messages_insert_policy" ON task_messages
          FOR INSERT WITH CHECK (
            sender_id = auth.uid() AND
            task_id IN (
              SELECT id FROM tasks WHERE created_by = auth.uid()
              UNION
              SELECT task_id FROM task_participants WHERE user_id = auth.uid()
            )
          );
          
        CREATE POLICY "user_presence_all_policy" ON user_presence
          FOR ALL USING (user_id = auth.uid());
          
        CREATE POLICY "user_presence_select_policy" ON user_presence
          FOR SELECT USING (true);
      `
    })

    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError)
      return
    }

    console.log('✅ Messaging tables created successfully!')
    console.log('✅ Indexes created for performance')
    console.log('✅ RLS policies configured for security')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

// Run setup
setupMessagingTables().then(() => process.exit(0))