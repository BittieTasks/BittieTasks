import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()

    // Create the database tables using raw SQL
    const createTablesSQL = `
      -- Create enums
      CREATE TYPE task_type_enum AS ENUM ('solo', 'community', 'corporate', 'barter');
      CREATE TYPE task_status_enum AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'expired');
      CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'flagged');
      CREATE TYPE review_tier_enum AS ENUM ('auto_approval', 'standard_review', 'enhanced_review', 'manual_review');
      CREATE TYPE verification_status_enum AS ENUM ('pending', 'approved', 'rejected', 'requires_review');
      CREATE TYPE verification_method_enum AS ENUM ('photo', 'video', 'gps', 'time_tracking', 'community', 'business', 'receipt', 'social_proof');

      -- Create verification_tokens table for email verification
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create users table (profile extension)
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(20) UNIQUE,
        email VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        profile_image_url VARCHAR(500),
        location VARCHAR(255),
        bio TEXT,
        phone_verified BOOLEAN DEFAULT false,
        verified BOOLEAN DEFAULT false,
        email_notifications BOOLEAN DEFAULT true,
        sms_notifications BOOLEAN DEFAULT true,
        total_earnings DECIMAL(10,2) DEFAULT 0.00,
        tasks_completed INTEGER DEFAULT 0,
        active_referrals INTEGER DEFAULT 0,
        monthly_goal DECIMAL(10,2) DEFAULT 500.00,
        subscription_tier VARCHAR(20) DEFAULT 'free',
        subscription_status VARCHAR(20) DEFAULT 'active',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        subscription_start_date TIMESTAMP WITH TIME ZONE,
        subscription_end_date TIMESTAMP WITH TIME ZONE,
        monthly_task_limit INTEGER DEFAULT 5,
        monthly_tasks_completed INTEGER DEFAULT 0,
        last_monthly_reset TIMESTAMP WITH TIME ZONE,
        priority_support BOOLEAN DEFAULT false,
        ad_free BOOLEAN DEFAULT false,
        premium_badge BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category_id UUID REFERENCES categories(id),
        creator_id UUID REFERENCES users(id) NOT NULL,
        type task_type_enum DEFAULT 'solo',
        status task_status_enum DEFAULT 'open',
        approval_status approval_status_enum DEFAULT 'pending',
        review_tier review_tier_enum DEFAULT 'standard_review',
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(255),
        rejection_reason TEXT,
        flagged_reason TEXT,
        risk_score INTEGER DEFAULT 0,
        earning_potential DECIMAL(8,2) NOT NULL,
        max_participants INTEGER DEFAULT 1,
        current_participants INTEGER DEFAULT 0,
        duration VARCHAR(50),
        location VARCHAR(255),
        zip_code VARCHAR(10),
        city VARCHAR(100),
        state VARCHAR(50),
        coordinates VARCHAR(50),
        radius_miles INTEGER DEFAULT 25,
        difficulty VARCHAR(10) DEFAULT 'medium',
        requirements TEXT,
        sponsor_id VARCHAR(255),
        sponsor_budget DECIMAL(10,2),
        scheduled_date TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        offering TEXT,
        seeking TEXT,
        trade_type VARCHAR(50),
        tags VARCHAR(100)[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create task_participants table
      CREATE TABLE IF NOT EXISTS task_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        status VARCHAR(20) DEFAULT 'joined',
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        accepted_at TIMESTAMP WITH TIME ZONE,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        application_message TEXT,
        rating INTEGER,
        review TEXT,
        earnings DECIMAL(8,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create payments table
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        task_id UUID REFERENCES tasks(id),
        user_id UUID REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        platform_fee DECIMAL(10,2) NOT NULL,
        processing_fee DECIMAL(10,2) NOT NULL,
        net_amount DECIMAL(10,2) NOT NULL,
        task_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        stripe_payment_intent_id VARCHAR(255),
        stripe_charge_id VARCHAR(255),
        fee_breakdown JSONB,
        failure_reason TEXT,
        is_escrow BOOLEAN DEFAULT false,
        escrowed_at TIMESTAMP WITH TIME ZONE,
        release_scheduled_at TIMESTAMP WITH TIME ZONE,
        released_at TIMESTAMP WITH TIME ZONE,
        dispute_status VARCHAR(20),
        dispute_reason TEXT,
        disputed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        failed_at TIMESTAMP WITH TIME ZONE
      );

      -- Create user_earnings table
      CREATE TABLE IF NOT EXISTS user_earnings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) NOT NULL,
        task_id UUID REFERENCES tasks(id),
        payment_id VARCHAR(255) REFERENCES payments(id),
        amount DECIMAL(10,2) NOT NULL,
        task_type VARCHAR(20) NOT NULL,
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create task_completion_submissions table
      CREATE TABLE IF NOT EXISTS task_completion_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        participant_id UUID REFERENCES task_participants(id) NOT NULL,
        verification_status verification_status_enum DEFAULT 'pending',
        verification_methods verification_method_enum[],
        photo_urls VARCHAR(500)[],
        video_urls VARCHAR(500)[],
        photo_metadata JSONB,
        video_metadata JSONB,
        gps_coordinates VARCHAR(50)[],
        location_history JSONB,
        start_location VARCHAR(255),
        end_location VARCHAR(255),
        start_time TIMESTAMP WITH TIME ZONE,
        end_time TIMESTAMP WITH TIME ZONE,
        total_duration INTEGER,
        time_tracking_data JSONB,
        community_verifications JSONB,
        business_verification VARCHAR(255),
        receipt_urls VARCHAR(500)[],
        social_proof_urls VARCHAR(500)[],
        auto_verification_score INTEGER,
        ai_analysis_results JSONB,
        fraud_detection_score INTEGER,
        quality_score INTEGER,
        reviewed_by VARCHAR(255),
        review_notes TEXT,
        rejection_reason TEXT,
        approved_at TIMESTAMP WITH TIME ZONE,
        payment_released BOOLEAN DEFAULT false,
        payment_released_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Insert some sample data to make the system functional
      INSERT INTO categories (name, description, icon) VALUES 
        ('Delivery & Errands', 'Food delivery, package pickup, grocery shopping', '🚚'),
        ('Home & Garden', 'Cleaning, lawn care, minor repairs', '🏠'),
        ('Pet Care', 'Dog walking, pet sitting, grooming', '🐕'),
        ('Digital Tasks', 'Data entry, social media, online research', '💻'),
        ('Event Support', 'Setup, cleanup, staffing assistance', '🎉'),
        ('Tutoring & Teaching', 'Academic help, skill sharing, lessons', '📚')
      ON CONFLICT DO NOTHING;

      -- Create some sample solo tasks
      INSERT INTO tasks (title, description, category_id, creator_id, type, status, approval_status, earning_potential, location, city, state, requirements) VALUES
        ('Grocery Shopping for Elderly Neighbor', 'Pick up weekly groceries for my elderly neighbor. List provided, payment via app.', 
         (SELECT id FROM categories WHERE name = 'Delivery & Errands' LIMIT 1), 
         (SELECT id FROM users LIMIT 1), 
         'solo', 'open', 'approved', 25.00, 'Downtown Area', 'Seattle', 'WA', 
         'Must have reliable transportation, ID verification required'),
        
        ('Dog Walking - Friendly Golden Retriever', 'Walk my 3-year-old Golden Retriever Max for 30 minutes in the park nearby.',
         (SELECT id FROM categories WHERE name = 'Pet Care' LIMIT 1),
         (SELECT id FROM users LIMIT 1),
         'solo', 'open', 'approved', 20.00, 'Green Lake Area', 'Seattle', 'WA',
         'Experience with dogs preferred, must provide photo verification'),
         
        ('Data Entry for Small Business', 'Enter customer information from paper forms into digital spreadsheet. About 50 entries.',
         (SELECT id FROM categories WHERE name = 'Digital Tasks' LIMIT 1),
         (SELECT id FROM users LIMIT 1),
         'solo', 'open', 'approved', 35.00, 'Remote/Online', 'Seattle', 'WA',
         'Basic computer skills, attention to detail required'),
         
        ('Event Setup Help - Birthday Party', 'Help set up tables, chairs, and decorations for outdoor birthday party.',
         (SELECT id FROM categories WHERE name = 'Event Support' LIMIT 1),
         (SELECT id FROM users LIMIT 1),
         'solo', 'open', 'approved', 40.00, 'Ballard', 'Seattle', 'WA',
         'Must be available Saturday 2-4 PM, physical work involved')
      ON CONFLICT DO NOTHING;

      -- Enable Row Level Security
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
      ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE user_earnings ENABLE ROW LEVEL SECURITY;
      ALTER TABLE task_completion_submissions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

      -- Create basic RLS policies
      CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
      CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
      
      CREATE POLICY "Anyone can view approved tasks" ON tasks FOR SELECT USING (approval_status = 'approved' AND status = 'open');
      CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid()::text = creator_id::text);
      CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);
      CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid()::text = creator_id::text);
      
      CREATE POLICY "Users can view their task participations" ON task_participants FOR SELECT USING (auth.uid()::text = user_id::text);
      CREATE POLICY "Users can join tasks" ON task_participants FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
      
      CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid()::text = user_id::text);
      CREATE POLICY "Users can view their own earnings" ON user_earnings FOR SELECT USING (auth.uid()::text = user_id::text);
      CREATE POLICY "Users can view their own submissions" ON task_completion_submissions FOR SELECT USING (auth.uid()::text = user_id::text);
    `

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createTablesSQL })

    if (error) {
      console.error('Database setup error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create database tables',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully' 
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}