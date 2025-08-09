-- Fix Row Level Security issues in Supabase
-- These commands need to be run in your Supabase SQL Editor

-- Enable RLS on all tables that have policies but RLS disabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

-- Check if profiles table exists and create if needed
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_picture TEXT,
  total_earnings DECIMAL DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  bio TEXT,
  skills TEXT[],
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  date_of_birth DATE,
  verification_status TEXT DEFAULT 'pending',
  identity_verified BOOLEAN DEFAULT FALSE,
  background_check BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_task_limit INTEGER DEFAULT 5,
  monthly_tasks_completed INTEGER DEFAULT 0,
  referral_code TEXT,
  referred_by TEXT,
  referral_count INTEGER DEFAULT 0,
  referral_earnings DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, username, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    'verified'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.tasks TO anon, authenticated;
GRANT ALL ON public.task_categories TO anon, authenticated;