-- Profiles Table Setup Script
-- Run this in Supabase SQL Editor

-- Step 1: Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "marketing": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Step 4: Create RLS policies

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 5: Verify the setup
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled",
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as "Policy Count"
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Step 6: Show all policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profiles table setup complete!';
  RAISE NOTICE 'Table created: profiles';
  RAISE NOTICE 'RLS enabled: Yes';
  RAISE NOTICE 'Policies created: 3 (INSERT, SELECT, UPDATE)';
END $$;

