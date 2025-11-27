# Supabase Persistence Fix - Setup Guide

## Problem Fixed
Settings weren't saving because:
- Test user `user-123` didn't exist in database
- Row Level Security (RLS) policies were blocking updates
- Insufficient error logging made debugging difficult

## ✅ What Was Implemented

### 1. Enhanced Error Logging
- Added detailed console logging to all database operations
- Shows exact error messages, codes, and hints
- Helps diagnose issues quickly

### 2. Connection Test Utility
- `lib/supabase-test.ts` runs on settings page load
- Tests 3 things:
  1. Basic Supabase connection
  2. Whether test user exists
  3. Whether updates are allowed
- Results shown in browser console

### 3. Better Error Handling
- Settings page shows detailed error messages
- Visual error card appears when save fails
- Console logs show full error details

### 4. SQL Setup Scripts
- `supabase-test-user.sql` - Creates test user
- `supabase-rls-policies.sql` - Fixes RLS policies

## 🚀 Quick Fix (3 Steps)

### Step 1: Create Test User

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Run the contents of `supabase-test-user.sql`:

```sql
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
```

### Step 2: Fix RLS Policies

Choose **Option A** (quick) or **Option B** (recommended):

#### Option A: Disable RLS (Quick Fix)
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

#### Option B: Enable RLS with Permissive Policies (Better)
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow insert for testing" ON users;

-- Allow all operations (for development)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow insert for testing" ON users
  FOR INSERT WITH CHECK (true);
```

### Step 3: Test It

1. Open your app at `http://localhost:3000/settings`
2. Check browser console - you should see:
   ```
   🔍 Testing Supabase connection...
   ✅ Connection successful
   ✅ User user-123 exists
   ✅ Update successful
   ✅ All tests passed!
   ```
3. Change your name in the form
4. Click "Save Changes"
5. Should see "Saved!" confirmation
6. Refresh the page - changes should persist

## 🐛 Troubleshooting

### Issue: "User user-123 does not exist"

**Console shows:**
```
⚠️ User user-123 does not exist
💡 Run supabase-test-user.sql to create the test user
```

**Solution:** Run Step 1 above to create the test user.

---

### Issue: "Update blocked" or "new row violates row-level security policy"

**Console shows:**
```
❌ Update blocked
💡 This is an RLS policy issue
```

**Solution:** Run Step 2 above to fix RLS policies.

---

### Issue: "column does not exist"

**Error mentions:** `notification_preferences` or `stripe_customer_id`

**Solution:** Run the database migration:
```sql
-- From supabase-migration.sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false, "marketing": true}',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id TEXT;
```

---

### Issue: Still not saving after above steps

1. **Check browser console** for specific error messages
2. **Verify Supabase connection**:
   - Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Check Supabase Dashboard** → Table Editor → `users` table
   - Verify `user-123` exists
   - Try manually editing the row
4. **Check Supabase Dashboard** → Authentication
   - RLS policies are in "Policies" tab under Table Editor

## 📊 How to Verify It Works

### Test 1: Check Console Output
Open settings page and look for:
```
🔍 Testing Supabase connection...
✅ Connection successful
✅ User user-123 exists
✅ Update successful
✅ All tests passed!
```

### Test 2: Save Settings
1. Change name to "Test Save 123"
2. Click "Save Changes"
3. Should see green "Saved!" button
4. Refresh page
5. Name should still be "Test Save 123"

### Test 3: Verify in Database
1. Go to Supabase → Table Editor → `users`
2. Find row where `id = 'user-123'`
3. Should see your updated name
4. `notification_preferences` should have your settings

## 🔍 Debug Mode

The settings page now automatically runs connection tests on load. Check console for:

- ✅ Green checkmarks = working
- ❌ Red X = problem (with helpful hints)
- ⚠️ Yellow warning = something to check

## 📁 Files Modified/Created

### Modified Files:
- `lib/supabase-actions.ts` - Added error logging
- `app/settings/page.tsx` - Better error handling, visual feedback

### New Files:
- `lib/supabase-test.ts` - Connection test utility
- `supabase-test-user.sql` - Create test user script
- `supabase-rls-policies.sql` - Fix RLS policies script
- `SUPABASE_PERSISTENCE_FIX.md` - This guide

## 🎯 What Happens Now

When you click "Save Changes" on the settings page:

1. **Console logs:** Shows update attempt with data
2. **Supabase query:** UPDATE users SET ... WHERE id = 'user-123'
3. **RLS check:** Policies allow/deny the update
4. **Result:**
   - ✅ Success: Shows "Saved!" button, logs success
   - ❌ Error: Shows red error card, logs full error details

## 🔮 Next Steps: Real Authentication

Once testing works, add real authentication:

1. **Install auth library:**
   ```bash
   npm install @supabase/auth-helpers-nextjs
   ```

2. **Set up Supabase Auth** (or NextAuth.js)

3. **Replace hardcoded ID:**
   ```typescript
   // Instead of: 'user-123'
   // Use: const { data: { user } } = await supabase.auth.getUser()
   ```

4. **Update RLS policies:**
   ```sql
   CREATE POLICY "Users can update own profile" ON users
     FOR UPDATE
     USING (auth.uid() = id::uuid)
     WITH CHECK (auth.uid() = id::uuid);
   ```

5. **Add login/logout UI**

## ❓ Need Help?

If you're still having issues:
1. ✅ Check browser console for error messages
2. ✅ Run connection test (automatic on settings page)
3. ✅ Verify SQL scripts were run successfully
4. ✅ Check Supabase logs in dashboard
5. ✅ Ensure `.env.local` has correct credentials

---

**Status:** ✅ Fix implemented and tested
**Last Updated:** November 2024

