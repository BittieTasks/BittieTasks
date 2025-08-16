-- Create email verification tokens table for Phase 3B email verification
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Also create the task_verifications table for AI verification system
CREATE TABLE IF NOT EXISTS task_verifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR REFERENCES tasks(id) NOT NULL,
  user_id VARCHAR REFERENCES users(id) NOT NULL,
  verification_type VARCHAR NOT NULL DEFAULT 'ai_photo',
  status VARCHAR NOT NULL DEFAULT 'pending',
  ai_confidence INTEGER,
  ai_reasoning TEXT,
  ai_details JSONB,
  before_photo_url VARCHAR,
  after_photo_url VARCHAR,
  verification_notes TEXT,
  admin_notes TEXT,
  reviewed_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMP
);

-- Create indexes for task verifications
CREATE INDEX IF NOT EXISTS idx_task_verifications_task_id ON task_verifications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_verifications_user_id ON task_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_task_verifications_status ON task_verifications(status);