-- Create Test User for Development
-- Run this in Supabase SQL Editor

-- Step 1: Check if user-123 exists
SELECT * FROM users WHERE id = 'user-123';

-- Step 2: If not exists, create test user
-- This will create the user or do nothing if it already exists
INSERT INTO users (
  id, 
  name, 
  email, 
  status, 
  plan, 
  created_at,
  notification_preferences
) 
VALUES (
  'user-123',
  'Test User',
  'test@example.com',
  'active',
  'Free',
  NOW(),
  '{"email": true, "push": false, "marketing": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify the user was created
SELECT * FROM users WHERE id = 'user-123';

-- Expected result: You should see one row with the test user data

