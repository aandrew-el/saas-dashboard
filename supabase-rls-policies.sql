-- Fix Row Level Security (RLS) Policies for Users Table
-- Run this in Supabase SQL Editor

-- ===========================================
-- STEP 1: Check Current RLS Status
-- ===========================================

SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- If rowsecurity = 't' (true), RLS is enabled
-- If rowsecurity = 'f' (false), RLS is disabled


-- ===========================================
-- OPTION A: Disable RLS (Quick Fix for Dev)
-- ===========================================
-- Use this for quick testing. NOT for production!

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';


-- ===========================================
-- OPTION B: Enable RLS with Permissive Policies (Recommended)
-- ===========================================
-- Use this for a more proper setup (still dev-friendly)

-- First, enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow insert for testing" ON users;

-- Policy 1: Allow all users to view profiles (for now)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (true);

-- Policy 2: Allow all users to update profiles (for now)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy 3: Allow inserting test data
CREATE POLICY "Allow insert for testing" ON users
  FOR INSERT
  WITH CHECK (true);

-- Verify policies were created:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'users';


-- ===========================================
-- PRODUCTION POLICIES (For Future Reference)
-- ===========================================
-- Once you add authentication, replace the above with these:

/*
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id::uuid);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id::uuid)
  WITH CHECK (auth.uid() = id::uuid);

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id::uuid);
*/

