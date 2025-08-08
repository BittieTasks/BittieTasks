-- BittieTasks/TaskParent Database Migration for Supabase
-- This file contains the complete schema migration from PostgreSQL to Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE - Comprehensive user management
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_picture TEXT,
    total_earnings DECIMAL DEFAULT 0.00,
    rating DECIMAL DEFAULT 0.00,
    completed_tasks INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    availability JSONB,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    is_background_checked BOOLEAN DEFAULT FALSE,
    phone_number TEXT,
    phone_verification_code TEXT,
    phone_verification_expires TIMESTAMPTZ,
    identity_documents TEXT[] DEFAULT '{}',
    trust_score INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0,
    identity_score INTEGER DEFAULT 0,
    -- Enhanced Human Verification
    is_captcha_verified BOOLEAN DEFAULT FALSE,
    captcha_score DECIMAL DEFAULT 0.0,
    device_fingerprint TEXT,
    ip_address TEXT,
    user_agent TEXT,
    signup_method TEXT DEFAULT 'email',
    behavior_score INTEGER DEFAULT 0,
    last_captcha_verification TIMESTAMPTZ,
    -- Identity Verification Requirements
    government_id_uploaded BOOLEAN DEFAULT FALSE,
    government_id_verified BOOLEAN DEFAULT FALSE,
    face_verification_completed BOOLEAN DEFAULT FALSE,
    liveliness_check_passed BOOLEAN DEFAULT FALSE,
    -- Anti-Bot Measures
    mouse_movement_analyzed BOOLEAN DEFAULT FALSE,
    keystroke_pattern_analyzed BOOLEAN DEFAULT FALSE,
    session_behavior_score INTEGER DEFAULT 0,
    human_verification_level TEXT DEFAULT 'basic',
    -- Two-Factor Authentication
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    backup_codes TEXT[] DEFAULT '{}',
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE,
    lock_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Subscription fields
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    monthly_task_limit INTEGER DEFAULT 5,
    monthly_tasks_completed INTEGER DEFAULT 0,
    last_monthly_reset TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    priority_support BOOLEAN DEFAULT FALSE,
    ad_free BOOLEAN DEFAULT FALSE,
    premium_badge BOOLEAN DEFAULT FALSE,
    -- Referral fields
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    referral_count INTEGER DEFAULT 0,
    referral_earnings DECIMAL DEFAULT 0.00,
    -- Ad Preference Settings
    ad_frequency INTEGER DEFAULT 5,
    ad_relevance INTEGER DEFAULT 7,
    ad_types TEXT[] DEFAULT '{native_feed,sponsored_task}',
    ad_categories TEXT[] DEFAULT '{education,health-wellness,retail}',
    max_ad_budget INTEGER DEFAULT 100,
    min_ad_budget INTEGER DEFAULT 10,
    family_friendly_only BOOLEAN DEFAULT TRUE,
    local_ads_only BOOLEAN DEFAULT FALSE,
    ethical_ads_only BOOLEAN DEFAULT TRUE,
    ad_personalization BOOLEAN DEFAULT TRUE
);

-- 2. TASK CATEGORIES TABLE
CREATE TABLE public.task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT
);

-- 3. TASKS TABLE - Core task management
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.task_categories(id),
    payment DECIMAL,
    duration_minutes INTEGER,
    difficulty TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    image_url TEXT,
    rating DECIMAL DEFAULT 0.00,
    completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    task_type TEXT NOT NULL DEFAULT 'shared',
    sponsor_info JSONB,
    -- Barter-specific fields
    payment_type TEXT NOT NULL DEFAULT 'cash',
    barter_offered TEXT,
    barter_wanted TEXT,
    estimated_value DECIMAL,
    barter_category TEXT,
    -- Self-care specific fields
    allow_accountability_partners BOOLEAN DEFAULT FALSE,
    max_partners INTEGER DEFAULT 3,
    partner_payment DECIMAL DEFAULT 0.00,
    flexible_barter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. TASK COMPLETIONS TABLE
CREATE TABLE public.task_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id),
    user_id UUID REFERENCES public.users(id),
    status TEXT NOT NULL,
    submission_notes TEXT,
    proof_files TEXT[] DEFAULT '{}',
    review_notes TEXT,
    rating INTEGER,
    earnings DECIMAL,
    payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'pending',
    platform_fee DECIMAL,
    net_earnings DECIMAL,
    -- Barter-specific fields
    is_barter_transaction BOOLEAN DEFAULT FALSE,
    barter_value DECIMAL,
    barter_description TEXT,
    barter_agreement JSONB,
    tax_form_required BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. PAYMENTS TABLE
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id TEXT NOT NULL UNIQUE,
    task_completion_id UUID REFERENCES public.task_completions(id),
    payer_id UUID REFERENCES public.users(id),
    payee_id UUID REFERENCES public.users(id),
    amount DECIMAL NOT NULL,
    platform_fee DECIMAL NOT NULL,
    net_amount DECIMAL NOT NULL,
    status TEXT NOT NULL,
    stripe_charge_id TEXT,
    stripe_transfer_id TEXT,
    payment_method TEXT,
    currency TEXT DEFAULT 'usd',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

-- 6. ESCROW TRANSACTIONS TABLE
CREATE TABLE public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_completion_id UUID REFERENCES public.task_completions(id),
    escrow_transaction_id TEXT NOT NULL,
    buyer_id UUID REFERENCES public.users(id),
    seller_id UUID REFERENCES public.users(id),
    amount DECIMAL NOT NULL,
    status TEXT NOT NULL,
    inspection_period_days INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 7. ACCOUNTABILITY PARTNERSHIPS TABLE
CREATE TABLE public.accountability_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id),
    task_completion_id UUID REFERENCES public.task_completions(id),
    creator_id UUID REFERENCES public.users(id),
    partner_id UUID REFERENCES public.users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    support_type TEXT DEFAULT 'encouragement',
    partner_earnings DECIMAL DEFAULT 0.00,
    support_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. MESSAGES TABLE
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES public.users(id),
    to_user_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. USER ACHIEVEMENTS TABLE
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    achievement_type TEXT NOT NULL,
    achievement_data JSONB,
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_visible BOOLEAN DEFAULT TRUE,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 1
);

-- 10. ACHIEVEMENT DEFINITIONS TABLE
CREATE TABLE public.achievement_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    category TEXT NOT NULL,
    criteria JSONB NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    reward_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 11. DAILY CHALLENGES TABLE
CREATE TABLE public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    reward_points INTEGER DEFAULT 5,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    estimated_minutes INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. USER CHALLENGES TABLE
CREATE TABLE public.user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    challenge_id UUID REFERENCES public.daily_challenges(id),
    assigned_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned',
    reflection TEXT,
    points_earned INTEGER DEFAULT 0
);

-- 13. REFERRALS TABLE
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID REFERENCES public.users(id),
    referred_user_id UUID REFERENCES public.users(id),
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    referrer_reward DECIMAL DEFAULT 10.00,
    referred_reward DECIMAL DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 14. AFFILIATE PRODUCTS TABLE
CREATE TABLE public.affiliate_products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    affiliate_url VARCHAR(500) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. TASK PRODUCTS TABLE
CREATE TABLE public.task_products (
    id SERIAL PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. BARTER TRANSACTIONS TABLE
CREATE TABLE public.barter_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id),
    task_completion_id UUID REFERENCES public.task_completions(id),
    offerer_id UUID REFERENCES public.users(id),
    accepter_id UUID REFERENCES public.users(id),
    offered_service TEXT NOT NULL,
    requested_service TEXT NOT NULL,
    agreed_value DECIMAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'proposed',
    negotiation_history JSONB,
    agreement_terms JSONB,
    delivery_date TIMESTAMPTZ,
    completion_proof TEXT[] DEFAULT '{}',
    mutual_rating BOOLEAN DEFAULT FALSE,
    tax_reporting_required BOOLEAN DEFAULT FALSE,
    platform_fee_type TEXT DEFAULT 'percentage',
    platform_fee_amount DECIMAL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- 17. USER ACTIVITY TABLE
CREATE TABLE public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    activity_type TEXT NOT NULL,
    metadata JSONB,
    risk_score INTEGER DEFAULT 0,
    flagged BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 18. VERIFICATION DOCUMENTS TABLE
CREATE TABLE public.verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending',
    verification_notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ
);

-- 19. SAFETY REPORTS TABLE
CREATE TABLE public.safety_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID REFERENCES public.users(id),
    reported_user_id UUID REFERENCES public.users(id),
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_tasks_category_id ON public.tasks(category_id);
CREATE INDEX idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX idx_task_completions_task_id ON public.task_completions(task_id);
CREATE INDEX idx_payments_payer_id ON public.payments(payer_id);
CREATE INDEX idx_payments_payee_id ON public.payments(payee_id);
CREATE INDEX idx_messages_from_user_id ON public.messages(from_user_id);
CREATE INDEX idx_messages_to_user_id ON public.messages(to_user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_challenges_user_id ON public.user_challenges(user_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accountability_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barter_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (users can only see their own data)
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id::uuid);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id::uuid);

CREATE POLICY "Users can view all categories" ON public.task_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view active tasks" ON public.tasks FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can view own completions" ON public.task_completions FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can create own completions" ON public.task_completions FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = payer_id::uuid OR auth.uid() = payee_id::uuid);

CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = from_user_id::uuid OR auth.uid() = to_user_id::uuid);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = from_user_id::uuid);

CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view all achievement definitions" ON public.achievement_definitions FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can view active challenges" ON public.daily_challenges FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Users can view own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id::uuid);

-- Insert default categories
INSERT INTO public.task_categories (id, name, icon, color, description) VALUES
('cooking', 'Cooking', 'fa-utensils', '#FF6B6B', 'Meal preparation and cooking activities'),
('cleaning', 'Cleaning', 'fa-broom', '#4ECDC4', 'Home cleaning and organization tasks'),
('childcare', 'Childcare', 'fa-baby', '#45B7D1', 'Child supervision and care activities'),
('exercise', 'Exercise', 'fa-dumbbell', '#96CEB4', 'Physical fitness and workout activities'),
('errands', 'Errands', 'fa-car', '#FFEAA7', 'Shopping, appointments, and errands'),
('self-care', 'Self Care', 'fa-heart', '#DDA0DD', 'Personal wellness and mindfulness activities');

-- Success message
SELECT 'BittieTasks database migration completed successfully!' as status;