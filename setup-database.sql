-- BittieTasks Database Setup SQL
-- Run this directly in your Supabase SQL editor

-- Create enums
CREATE TYPE task_status AS ENUM ('open', 'active', 'completed', 'cancelled');
CREATE TYPE task_type AS ENUM ('shared', 'solo', 'sponsored', 'barter', 'platform_funded', 'corporate_sponsored', 'peer_to_peer');
CREATE TYPE approval_status AS ENUM ('pending', 'auto_approved', 'manual_review', 'approved', 'rejected', 'flagged');
CREATE TYPE review_tier AS ENUM ('auto_approve', 'standard_review', 'enhanced_review', 'corporate_review');
CREATE TYPE transaction_type AS ENUM ('task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription_payment');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE verification_method AS ENUM ('photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof');
CREATE TYPE verification_status AS ENUM ('pending', 'auto_verified', 'manual_review', 'verified', 'rejected', 'requires_additional_proof');
CREATE TYPE revenue_stream AS ENUM ('peer_to_peer', 'corporate_partnership', 'platform_funded');

-- Create users table (extends auth.users)
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR UNIQUE NOT NULL,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  location VARCHAR,
  bio TEXT,
  phone_verified BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  total_earnings DECIMAL(10, 2) DEFAULT '0.00',
  tasks_completed INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  monthly_goal DECIMAL(10, 2) DEFAULT '500.00',
  subscription_tier VARCHAR DEFAULT 'free',
  subscription_status VARCHAR DEFAULT 'active',
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  monthly_task_limit INTEGER DEFAULT 5,
  monthly_tasks_completed INTEGER DEFAULT 0,
  last_monthly_reset TIMESTAMP,
  priority_support BOOLEAN DEFAULT false,
  ad_free BOOLEAN DEFAULT false,
  premium_badge BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create phone verification codes table
CREATE TABLE phone_verification_codes (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0
);

-- Create tasks table
CREATE TABLE tasks (
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
  host_id VARCHAR NOT NULL REFERENCES users(id),
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

-- Create task participants table
CREATE TABLE task_participants (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  participant_id VARCHAR NOT NULL REFERENCES users(id),
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

-- Create transactions table
CREATE TABLE transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR REFERENCES tasks(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
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

-- Create verification submissions table  
CREATE TABLE verification_submissions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  participant_id VARCHAR NOT NULL REFERENCES users(id),
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

-- Create sessions table (for authentication)
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IDX_session_expire ON sessions(expire);

-- Create indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_host_id ON tasks(host_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_task_participants_task_id ON task_participants(task_id);
CREATE INDEX idx_task_participants_participant_id ON task_participants(participant_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_task_id ON transactions(task_id);
CREATE INDEX idx_verification_submissions_task_id ON verification_submissions(task_id);
CREATE INDEX idx_verification_submissions_participant_id ON verification_submissions(participant_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY; 
ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (you can customize these)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users  
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Tasks are viewable by everyone" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid()::text = host_id);

CREATE POLICY "Task hosts can update their tasks" ON tasks
  FOR UPDATE USING (auth.uid()::text = host_id);