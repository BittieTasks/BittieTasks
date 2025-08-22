import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupVerificationTables() {
  console.log('Setting up AI verification tables...')
  
  try {
    // Create task_verifications table
    const { error: verificationError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS task_verifications (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id VARCHAR REFERENCES tasks(id) NOT NULL,
          user_id VARCHAR REFERENCES auth.users(id) NOT NULL,
          verification_type VARCHAR NOT NULL DEFAULT 'ai_photo' CHECK (verification_type IN ('ai_photo', 'manual', 'admin')),
          status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'pending_review')),
          ai_confidence INTEGER, -- 0-100
          ai_reasoning TEXT,
          ai_details JSONB,
          before_photo_url VARCHAR,
          after_photo_url VARCHAR,
          verification_notes TEXT,
          admin_notes TEXT,
          reviewed_by VARCHAR REFERENCES auth.users(id),
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          reviewed_at TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_task_verifications_task_id ON task_verifications(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_verifications_user_id ON task_verifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_task_verifications_status ON task_verifications(status);
        CREATE INDEX IF NOT EXISTS idx_task_verifications_created_at ON task_verifications(created_at);
      `
    })

    if (verificationError) {
      console.error('Error creating task_verifications table:', verificationError)
      return
    }

    // Create task_participants table if not exists
    const { error: participantsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS task_participants (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id VARCHAR REFERENCES tasks(id) NOT NULL,
          user_id VARCHAR REFERENCES auth.users(id) NOT NULL,
          status VARCHAR NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'rejected', 'completed')),
          applied_at TIMESTAMP DEFAULT NOW() NOT NULL,
          accepted_at TIMESTAMP,
          completed_at TIMESTAMP,
          notes TEXT,
          UNIQUE(task_id, user_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_task_participants_task_id ON task_participants(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_participants_user_id ON task_participants(user_id);
        CREATE INDEX IF NOT EXISTS idx_task_participants_status ON task_participants(status);
      `
    })

    if (participantsError) {
      console.error('Error creating task_participants table:', participantsError)
      return
    }

    // Set up RLS policies
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE task_verifications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "task_verifications_select_policy" ON task_verifications;
        DROP POLICY IF EXISTS "task_verifications_insert_policy" ON task_verifications;
        DROP POLICY IF EXISTS "task_participants_select_policy" ON task_participants;
        DROP POLICY IF EXISTS "task_participants_insert_policy" ON task_participants;
        
        CREATE POLICY "task_verifications_select_policy" ON task_verifications
          FOR SELECT USING (
            user_id = auth.uid() OR
            task_id IN (SELECT id FROM tasks WHERE created_by = auth.uid())
          );
          
        CREATE POLICY "task_verifications_insert_policy" ON task_verifications
          FOR INSERT WITH CHECK (user_id = auth.uid());
          
        CREATE POLICY "task_participants_select_policy" ON task_participants
          FOR SELECT USING (
            user_id = auth.uid() OR
            task_id IN (SELECT id FROM tasks WHERE created_by = auth.uid())
          );
          
        CREATE POLICY "task_participants_insert_policy" ON task_participants
          FOR INSERT WITH CHECK (user_id = auth.uid());
      `
    })

    if (rlsError) {
      console.error('Error setting up RLS policies:', rlsError)
      return
    }

    console.log('✅ AI verification tables created successfully!')
    console.log('✅ Task participants table created successfully!')
    console.log('✅ Indexes created for performance')
    console.log('✅ RLS policies configured for security')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

// Run setup
setupVerificationTables().then(() => process.exit(0))