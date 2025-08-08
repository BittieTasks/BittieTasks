import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neonConfig
const neonConfig = { webSocketConstructor: ws };

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setupDatabase() {
  console.log('Setting up database tables...');
  
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        profile_picture TEXT,
        total_earnings DECIMAL DEFAULT '0.00',
        rating DECIMAL DEFAULT '0.00',
        completed_tasks INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        skills TEXT[] DEFAULT ARRAY[]::TEXT[],
        availability JSONB,
        is_email_verified BOOLEAN DEFAULT false,
        is_phone_verified BOOLEAN DEFAULT false,
        is_identity_verified BOOLEAN DEFAULT false,
        is_background_checked BOOLEAN DEFAULT false,
        phone_number TEXT,
        phone_verification_code TEXT,
        phone_verification_expires TIMESTAMP,
        identity_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
        trust_score INTEGER DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        identity_score INTEGER DEFAULT 0,
        is_captcha_verified BOOLEAN DEFAULT false,
        captcha_score DECIMAL DEFAULT '0.0',
        device_fingerprint TEXT,
        ip_address TEXT,
        user_agent TEXT,
        signup_method TEXT DEFAULT 'email',
        behavior_score INTEGER DEFAULT 0,
        last_captcha_verification TIMESTAMP,
        government_id_uploaded BOOLEAN DEFAULT false,
        government_id_verified BOOLEAN DEFAULT false,
        face_verification_completed BOOLEAN DEFAULT false,
        liveliness_check_passed BOOLEAN DEFAULT false,
        mouse_movement_analyzed BOOLEAN DEFAULT false,
        keystroke_pattern_analyzed BOOLEAN DEFAULT false,
        session_behavior_score INTEGER DEFAULT 0,
        human_verification_level TEXT DEFAULT 'basic',
        two_factor_enabled BOOLEAN DEFAULT false,
        two_factor_secret TEXT,
        backup_codes TEXT[] DEFAULT ARRAY[]::TEXT[],
        email_verification_token TEXT,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMP,
        last_login TIMESTAMP,
        failed_login_attempts INTEGER DEFAULT 0,
        account_locked BOOLEAN DEFAULT false,
        lock_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subscription_tier TEXT DEFAULT 'free',
        subscription_status TEXT DEFAULT 'active',
        subscription_start_date TIMESTAMP,
        subscription_end_date TIMESTAMP,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        monthly_task_limit INTEGER DEFAULT 5,
        monthly_tasks_completed INTEGER DEFAULT 0,
        last_monthly_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        priority_support BOOLEAN DEFAULT false,
        ad_free BOOLEAN DEFAULT false,
        premium_badge BOOLEAN DEFAULT false,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        referral_count INTEGER DEFAULT 0,
        referral_earnings DECIMAL DEFAULT '0.00',
        ad_frequency INTEGER DEFAULT 5,
        ad_relevance INTEGER DEFAULT 7,
        ad_types TEXT[] DEFAULT ARRAY['native_feed', 'sponsored_task']::TEXT[],
        ad_categories TEXT[] DEFAULT ARRAY['education', 'health-wellness', 'retail']::TEXT[],
        max_ad_budget INTEGER DEFAULT 100,
        min_ad_budget INTEGER DEFAULT 10,
        family_friendly_only BOOLEAN DEFAULT true,
        local_ads_only BOOLEAN DEFAULT false,
        ethical_ads_only BOOLEAN DEFAULT true,
        ad_personalization BOOLEAN DEFAULT true
      );
    `);
    console.log('✓ Users table created');

    // Create task_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT
      );
    `);
    console.log('✓ Task categories table created');

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category_id VARCHAR REFERENCES task_categories(id),
        payment DECIMAL,
        duration_minutes INTEGER,
        difficulty TEXT NOT NULL,
        requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
        image_url TEXT,
        rating DECIMAL DEFAULT '0.00',
        completions INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        task_type TEXT NOT NULL DEFAULT 'shared',
        sponsor_info JSONB,
        payment_type TEXT NOT NULL DEFAULT 'cash',
        barter_offered TEXT,
        barter_wanted TEXT,
        estimated_value DECIMAL,
        barter_category TEXT,
        allow_accountability_partners BOOLEAN DEFAULT false,
        max_partners INTEGER DEFAULT 3,
        partner_payment DECIMAL DEFAULT '0.00',
        flexible_barter BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tasks table created');

    // Create sessions table for express-session
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    console.log('✓ Sessions table created');

    // Insert default task categories
    await pool.query(`
      INSERT INTO task_categories (id, name, icon, color, description) VALUES
        ('440740be-526e-4c88-a9e4-d6a4abb94b28', 'Household', 'fa-home', '#3B82F6', 'Home and household tasks'),
        ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Childcare', 'fa-baby', '#10B981', 'Childcare and parenting tasks'),
        ('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'Shopping', 'fa-shopping-cart', '#F59E0B', 'Shopping and errands'),
        ('c3d4e5f6-g7h8-9012-cdef-345678901234', 'Transportation', 'fa-car', '#EF4444', 'Transportation and delivery'),
        ('d4e5f6g7-h8i9-0123-defg-456789012345', 'Self-Care', 'fa-heart', '#EC4899', 'Personal wellness and self-care'),
        ('e5f6g7h8-i9j0-1234-efgh-567890123456', 'Barter', 'fa-exchange-alt', '#8B5CF6', 'Trade skills and services without cash')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Default task categories inserted');

    // Insert demo tasks
    await pool.query(`
      INSERT INTO tasks (id, title, description, category_id, payment, duration_minutes, difficulty, task_type) VALUES
        ('8d75f318-a626-4469-9704-083fcd9cbbb2', 'Help with grocery shopping', 'Need someone to help carry groceries from the store to my apartment', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 25.00, 60, 'Easy', 'shared'),
        ('f1e2d3c4-b5a6-9788-0def-123456789abc', 'Babysitting for date night', 'Looking for a trusted babysitter for our 2 kids (ages 4 and 7) for a 3-hour evening', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 45.00, 180, 'Medium', 'shared'),
        ('a9b8c7d6-e5f4-3210-ghij-klmnopqrstuv', 'House cleaning help', 'Need help with deep cleaning the house, especially kitchen and bathrooms', '440740be-526e-4c88-a9e4-d6a4abb94b28', 60.00, 240, 'Medium', 'shared')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✓ Demo tasks inserted');

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().catch(console.error);