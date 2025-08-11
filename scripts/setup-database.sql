-- BittieTasks Database Setup
-- Run this in your Supabase SQL Editor

-- Create profiles table for user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  location TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'circle',
  color TEXT DEFAULT 'bg-gray-100 text-gray-700',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payout DECIMAL(10,2) NOT NULL CHECK (payout >= 0),
  location TEXT NOT NULL,
  time_commitment TEXT,
  max_participants INTEGER DEFAULT 1 CHECK (max_participants > 0),
  current_participants INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  task_type TEXT DEFAULT 'community' CHECK (task_type IN ('community', 'solo', 'sponsored')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsor_name TEXT,
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_participants table for applications
CREATE TABLE IF NOT EXISTS task_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  message TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, participant_id)
);

-- Create transactions table for payments
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  payer_id UUID REFERENCES profiles(id),
  payee_id UUID REFERENCES profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert parent-focused categories
INSERT INTO categories (name, description, icon, color) VALUES
  ('School & Education', 'School pickups, tutoring, educational activities', 'GraduationCap', 'bg-blue-100 text-blue-700'),
  ('Meal Planning', 'Meal prep, cooking together, grocery planning', 'ChefHat', 'bg-green-100 text-green-700'),
  ('Shopping & Errands', 'Grocery runs, errands, bulk buying groups', 'ShoppingBag', 'bg-purple-100 text-purple-700'),
  ('Transportation', 'Carpooling, ride sharing, transportation help', 'Car', 'bg-orange-100 text-orange-700'),
  ('Childcare Support', 'Babysitting, playdate exchanges, child supervision', 'Heart', 'bg-pink-100 text-pink-700'),
  ('Home & Garden', 'Home maintenance, gardening, cleaning help', 'Home', 'bg-emerald-100 text-emerald-700'),
  ('Health & Wellness', 'Fitness groups, wellness activities, health support', 'Activity', 'bg-teal-100 text-teal-700'),
  ('Social Events', 'Community events, parties, social gatherings', 'Users', 'bg-indigo-100 text-indigo-700')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for tasks
CREATE POLICY "Anyone can view open tasks" ON tasks
  FOR SELECT USING (status = 'open');

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for task_participants
CREATE POLICY "Users can view their own applications" ON task_participants
  FOR SELECT USING (auth.uid() = participant_id);

CREATE POLICY "Task creators can view applications to their tasks" ON task_participants
  FOR SELECT USING (
    auth.uid() IN (
      SELECT creator_id FROM tasks WHERE tasks.id = task_participants.task_id
    )
  );

CREATE POLICY "Users can apply to tasks" ON task_participants
  FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update participant count
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE tasks 
    SET current_participants = current_participants + 1
    WHERE id = NEW.task_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE tasks 
    SET current_participants = current_participants + 1
    WHERE id = NEW.task_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE tasks 
    SET current_participants = current_participants - 1
    WHERE id = NEW.task_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE tasks 
    SET current_participants = current_participants - 1
    WHERE id = OLD.task_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for participant count updates
DROP TRIGGER IF EXISTS participant_count_trigger ON task_participants;
CREATE TRIGGER participant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON task_participants
  FOR EACH ROW EXECUTE FUNCTION update_participant_count();