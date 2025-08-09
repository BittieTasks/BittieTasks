-- Supabase Migration Script
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  total_earnings DECIMAL DEFAULT 0.00,
  rating DECIMAL DEFAULT 0.00,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  date_of_birth DATE,
  verification_status TEXT DEFAULT 'unverified',
  identity_verified BOOLEAN DEFAULT false,
  background_check BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  privacy_profile TEXT DEFAULT 'public',
  privacy_contact TEXT DEFAULT 'public',
  marketing_emails BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  email_task_updates BOOLEAN DEFAULT true,
  email_payment_updates BOOLEAN DEFAULT true,
  email_security_alerts BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  monthly_task_limit INTEGER DEFAULT 5,
  monthly_tasks_completed INTEGER DEFAULT 0,
  last_monthly_reset TIMESTAMP DEFAULT NOW(),
  priority_support BOOLEAN DEFAULT false,
  ad_free BOOLEAN DEFAULT false,
  premium_badge BOOLEAN DEFAULT false,
  referral_code TEXT,
  referred_by TEXT,
  referral_count INTEGER DEFAULT 0,
  referral_earnings DECIMAL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own profile
DROP POLICY IF EXISTS "Users can view and update own profile" ON profiles;
CREATE POLICY "Users can view and update own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();