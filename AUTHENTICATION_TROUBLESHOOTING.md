# Authentication Troubleshooting Guide

## Issue Identified: Row Level Security (RLS) Problems

Your email verification is working, but there are database security issues preventing user profile creation after verification.

## Root Cause
- Supabase tables have RLS policies defined but RLS is not enabled
- This blocks profile creation after email verification
- User gets authenticated but no profile is created

## Fix Required in Supabase SQL Editor

**Run these commands in your Supabase Dashboard → SQL Editor:**

```sql
-- Enable RLS on main tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  verification_status TEXT DEFAULT 'pending',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  monthly_task_limit INTEGER DEFAULT 5,
  monthly_tasks_completed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## What This Fixes

1. **Email Verification** ✅ Working (Supabase sends email via SendGrid)
2. **User Authentication** ✅ Working (user gets authenticated)
3. **Profile Creation** ❌ Fixed by enabling RLS and proper policies
4. **Access Control** ✅ Secure with RLS policies

## Test After Fixing

1. Go to Supabase → SQL Editor
2. Run the SQL commands above
3. Test signup flow again:
   - Sign up with real email
   - Check email and click verification link
   - Should redirect and create profile successfully
   - Login should work normally

## Expected Result After Fix

- User signs up → Gets verification email
- Clicks email link → Gets authenticated 
- Profile gets created automatically
- User can access app features
- Authentication flow works end-to-end

This will resolve the authentication issues and enable full functionality!