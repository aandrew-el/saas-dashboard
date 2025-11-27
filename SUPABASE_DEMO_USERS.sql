-- Run this in Supabase SQL Editor to create demo users for the Users page
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run

-- Step 1: Create the demo_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.demo_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS and allow public read
ALTER TABLE public.demo_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read demo users" ON public.demo_users;
CREATE POLICY "Anyone can read demo users" ON public.demo_users FOR SELECT USING (true);

-- Step 3: Insert demo data (only if table is empty)
INSERT INTO public.demo_users (name, email, status, plan)
SELECT * FROM (VALUES
  ('John Smith', 'john@example.com', 'active', 'pro'),
  ('Sarah Johnson', 'sarah@example.com', 'active', 'enterprise'),
  ('Mike Wilson', 'mike@example.com', 'inactive', 'free'),
  ('Emily Brown', 'emily@example.com', 'active', 'pro'),
  ('David Lee', 'david@example.com', 'active', 'free'),
  ('Lisa Anderson', 'lisa@example.com', 'active', 'pro'),
  ('James Taylor', 'james@example.com', 'inactive', 'free'),
  ('Jennifer Martinez', 'jennifer@example.com', 'active', 'enterprise'),
  ('Robert Garcia', 'robert@example.com', 'active', 'pro'),
  ('Michelle Robinson', 'michelle@example.com', 'active', 'free')
) AS t(name, email, status, plan)
WHERE NOT EXISTS (SELECT 1 FROM public.demo_users LIMIT 1);
