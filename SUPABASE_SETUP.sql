-- SUPABASE SETUP FOR SAAS DASHBOARD
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- STEP 1: Drop existing policies
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.analytics_events;

-- STEP 2: Drop existing tables
DROP TABLE IF EXISTS public.analytics_events;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.demo_users;

-- STEP 3: Create fresh profiles table (linked to auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  plan TEXT DEFAULT 'free',
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "marketing": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create policies
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- STEP 6: Create a public users view for the Users page (read-only, no auth required)
CREATE TABLE public.demo_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow anyone to read demo_users (for the Users page)
ALTER TABLE public.demo_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read demo users" ON public.demo_users FOR SELECT USING (true);

-- STEP 7: Insert demo data
INSERT INTO public.demo_users (name, email, status, plan) VALUES
  ('John Smith', 'john@example.com', 'active', 'pro'),
  ('Sarah Johnson', 'sarah@example.com', 'active', 'enterprise'),
  ('Mike Wilson', 'mike@example.com', 'inactive', 'free'),
  ('Emily Brown', 'emily@example.com', 'active', 'pro'),
  ('David Lee', 'david@example.com', 'active', 'free'),
  ('Lisa Anderson', 'lisa@example.com', 'active', 'pro'),
  ('James Taylor', 'james@example.com', 'inactive', 'free'),
  ('Jennifer Martinez', 'jennifer@example.com', 'active', 'enterprise'),
  ('Robert Garcia', 'robert@example.com', 'active', 'pro'),
  ('Michelle Robinson', 'michelle@example.com', 'active', 'free');
