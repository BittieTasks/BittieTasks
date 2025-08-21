-- Create task_applications table for solo task system
-- This table stores all task applications including solo tasks

CREATE TABLE IF NOT EXISTS task_applications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT NOT NULL,
  task_title TEXT,
  task_type TEXT DEFAULT 'solo',
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'completed', 'verified', 'expired')),
  application_message TEXT,
  payout_amount INTEGER DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,
  net_payout INTEGER DEFAULT 0,
  verification_photo TEXT,
  ai_analysis JSONB,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_applications_user_id ON task_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_applications_task_id ON task_applications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_applications_status ON task_applications(status);
CREATE INDEX IF NOT EXISTS idx_task_applications_created_at ON task_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_task_applications_user_task_date ON task_applications(user_id, task_id, created_at);

-- Row Level Security
ALTER TABLE task_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own applications
CREATE POLICY IF NOT EXISTS "Users can view own applications" ON task_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own applications
CREATE POLICY IF NOT EXISTS "Users can create own applications" ON task_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own applications
CREATE POLICY IF NOT EXISTS "Users can update own applications" ON task_applications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role can access all (for admin operations)
CREATE POLICY IF NOT EXISTS "Service role full access" ON task_applications
  FOR ALL USING (current_setting('role') = 'service_role');

-- Create or update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_task_applications_updated_at ON task_applications;
CREATE TRIGGER update_task_applications_updated_at
    BEFORE UPDATE ON task_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON task_applications TO authenticated;
GRANT ALL ON task_applications TO service_role;