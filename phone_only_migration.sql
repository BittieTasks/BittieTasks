-- Phone verification migration - ONLY what's needed for phone auth
-- No foreign keys, no complex relationships, just the essentials

-- Add phone verification table
CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number varchar NOT NULL,
    code varchar(6) NOT NULL,
    attempts integer DEFAULT 0,
    verified boolean DEFAULT false,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
);

-- Add phone columns to users table (if they don't exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_notifications boolean DEFAULT true;

-- Add unique constraint on phone number (safely)
DO $$ 
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_phone_number_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_phone_number_unique UNIQUE(phone_number);
    END IF;
END $$;

-- Create sessions table for authentication (if not exists)
CREATE TABLE IF NOT EXISTS sessions (
    sid varchar PRIMARY KEY NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp NOT NULL
);

-- Add session index
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'IDX_session_expire'
    ) THEN
        CREATE INDEX IDX_session_expire ON sessions USING btree (expire);
    END IF;
END $$;