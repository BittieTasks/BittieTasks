-- Minimal migration script for phone verification
-- Run this step by step if needed

-- Step 1: Create phone verification table (the key new table needed)
CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number varchar NOT NULL,
    code varchar(6) NOT NULL,
    attempts integer DEFAULT 0,
    verified boolean DEFAULT false,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Step 2: Add phone columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;

-- Step 3: Make phone number unique (skip if this causes errors)
DO $$ 
BEGIN
    ALTER TABLE users ADD CONSTRAINT users_phone_number_unique UNIQUE(phone_number);
EXCEPTION 
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Constraint already exists, skipping';
END $$;

-- Step 4: Create sessions table for auth (skip if exists)
CREATE TABLE IF NOT EXISTS sessions (
    sid varchar PRIMARY KEY NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp NOT NULL
);

-- Step 5: Create index on sessions
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions USING btree (expire);