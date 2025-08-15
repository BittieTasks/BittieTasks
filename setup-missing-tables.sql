-- Setup only missing tables and components for BittieTasks

-- Create enums (only if they don't exist)
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('open', 'active', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_type AS ENUM ('shared', 'solo', 'sponsored', 'barter', 'platform_funded', 'corporate_sponsored', 'peer_to_peer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'auto_approved', 'manual_review', 'approved', 'rejected', 'flagged');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE review_tier AS ENUM ('auto_approve', 'standard_review', 'enhanced_review', 'corporate_review');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription_payment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_method AS ENUM ('photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'auto_verified', 'manual_review', 'verified', 'rejected', 'requires_additional_proof');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE revenue_stream AS ENUM ('peer_to_peer', 'corporate_partnership', 'platform_funded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN 
  -- Check if phone_number column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_number') THEN
    ALTER TABLE users ADD COLUMN phone_number VARCHAR;
  END IF;
  
  -- Add other missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE users ADD COLUMN bio TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
    ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_earnings') THEN
    ALTER TABLE users ADD COLUMN total_earnings DECIMAL(10, 2) DEFAULT '0.00';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tasks_completed') THEN
    ALTER TABLE users ADD COLUMN tasks_completed INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
    ALTER TABLE users ADD COLUMN subscription_tier VARCHAR DEFAULT 'free';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR;
  END IF;
END $$;

-- Create phone verification codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0
);

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  type task_type NOT NULL,
  category VARCHAR NOT NULL,
  location VARCHAR,
  earning_potential DECIMAL(10, 2) DEFAULT 0.00,
  max_participants INTEGER DEFAULT 1,
  current_participants INTEGER DEFAULT 0,
  status task_status DEFAULT 'open',
  host_id VARCHAR NOT NULL,
  requires_verification BOOLEAN DEFAULT true,
  verification_method verification_method[] DEFAULT ARRAY['photo'],
  tags TEXT[],
  payment_type VARCHAR DEFAULT 'per_task',
  estimated_time INTEGER,
  difficulty_level INTEGER DEFAULT 1,
  special_requirements TEXT,
  approval_status approval_status DEFAULT 'pending',
  review_tier review_tier DEFAULT 'standard_review',
  revenue_stream revenue_stream,
  corporate_sponsor_id VARCHAR,
  is_featured BOOLEAN DEFAULT false,
  priority_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create task participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS task_participants (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR NOT NULL,
  participant_id VARCHAR NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'active',
  role VARCHAR DEFAULT 'participant',
  completion_verified BOOLEAN DEFAULT false,
  verification_score INTEGER,
  payment_processed BOOLEAN DEFAULT false,
  earnings DECIMAL(10, 2),
  bonus_earnings DECIMAL(10, 2) DEFAULT '0.00',
  completed_at TIMESTAMP,
  UNIQUE(task_id, participant_id)
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR,
  user_id VARCHAR NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  platform_fee DECIMAL(10, 2) DEFAULT '0.00',
  net_amount DECIMAL(10, 2),
  fee_percentage DECIMAL(4, 2)
);

-- Create verification submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS verification_submissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR NOT NULL,
  participant_id VARCHAR NOT NULL,
  method verification_method NOT NULL,
  status verification_status DEFAULT 'pending',
  media_urls TEXT[],
  location_data JSONB,
  submission_text TEXT,
  verification_score INTEGER,
  reviewer_notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  auto_verified BOOLEAN DEFAULT false
);

-- Create sessions table if it doesn't exist (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_host_id ON tasks(host_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_task_participants_task_id ON task_participants(task_id);
CREATE INDEX IF NOT EXISTS idx_task_participants_participant_id ON task_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_submissions_task_id ON verification_submissions(task_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY; 
ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (only if they don't exist)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile" ON users
      FOR SELECT USING (auth.uid()::text = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON users  
      FOR UPDATE USING (auth.uid()::text = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tasks are viewable by everyone') THEN
    CREATE POLICY "Tasks are viewable by everyone" ON tasks
      FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create tasks') THEN
    CREATE POLICY "Users can create tasks" ON tasks
      FOR INSERT WITH CHECK (auth.uid()::text = host_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Task hosts can update their tasks') THEN
    CREATE POLICY "Task hosts can update their tasks" ON tasks
      FOR UPDATE USING (auth.uid()::text = host_id);
  END IF;
END $$;