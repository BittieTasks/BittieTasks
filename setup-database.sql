-- BittieTasks Database Schema Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT FALSE,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  tasks_completed INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  monthly_goal DECIMAL(10,2) DEFAULT 500.00,
  -- Subscription fields
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  monthly_task_limit INTEGER DEFAULT 5,
  monthly_tasks_completed INTEGER DEFAULT 0,
  last_monthly_reset TIMESTAMPTZ,
  priority_support BOOLEAN DEFAULT FALSE,
  ad_free BOOLEAN DEFAULT FALSE,
  premium_badge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  task_type TEXT DEFAULT 'shared' CHECK (task_type IN ('shared', 'solo', 'sponsored', 'barter')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'active', 'completed', 'cancelled')),
  payout DECIMAL(10,2) NOT NULL,
  max_participants INTEGER DEFAULT 1,
  current_participants INTEGER DEFAULT 0,
  location TEXT,
  time_commitment TEXT,
  deadline TIMESTAMPTZ,
  requirements TEXT[],
  skills_required TEXT[],
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsor_name TEXT,
  sponsor_bonus DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create task_participants table
CREATE TABLE IF NOT EXISTS public.task_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'accepted', 'completed', 'verified', 'cancelled')),
  application_message TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  earnings DECIMAL(10,2) DEFAULT 0.00,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  UNIQUE(task_id, user_id)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('task_completion', 'referral_bonus', 'corporate_sponsorship', 'platform_fee', 'subscription')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  stripe_payment_intent_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
('Errands & Shopping', 'Grocery runs, pharmacy pickups, general errands', 'shopping-cart', '#10b981'),
('Transportation', 'School pickups, carpooling, activity transportation', 'car', '#3b82f6'),
('Meal Planning & Prep', 'Meal planning, batch cooking, family dinners', 'chef-hat', '#f59e0b'),
('Activity Coordination', 'Organizing playdates, group activities, events', 'calendar', '#8b5cf6'),
('Self-Care & Wellness', 'Walking groups, meditation, wellness activities', 'heart', '#ec4899'),
('Skill Sharing', 'Tutoring, lessons, teaching new skills', 'book-open', '#06b6d4'),
('Household Tasks', 'Cleaning, organization, home maintenance', 'home', '#84cc16'),
('Pet Care', 'Dog walking, pet sitting, vet visits', 'heart', '#f97316')
ON CONFLICT DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = creator_id);

-- Task participants policies  
CREATE POLICY "Task participants viewable by task creator and participant" ON public.task_participants
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT creator_id FROM public.tasks WHERE id = task_id)
    );

CREATE POLICY "Users can apply to tasks" ON public.task_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories are public
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
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

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();