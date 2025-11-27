# Signup Flow Fix - Implementation Guide

## ✅ What Was Fixed

### 1. Enhanced Error Logging (`lib/auth-context.tsx`)
- Added comprehensive console logging throughout the signup process
- Now shows: 🔐 Starting, ✅ Success, ❌ Errors, 📧 Email confirmation status
- Helps debug issues in browser console

### 2. Improved Profile Creation
- Changed from `insert` to `upsert` to handle existing profiles
- Added `created_at` and `updated_at` timestamps
- Profile creation errors no longer block signup (auth succeeds even if profile fails)
- Can be retried/fixed later without losing the account

### 3. Email Confirmation Handling
- Detects if email confirmation is required
- Shows appropriate message to user
- Supports both auto-login and email-confirm flows

### 4. Better Error Messages
- Shows specific error messages from Supabase
- Distinguishes between auth errors and profile creation errors
- Clearer feedback to users

## 🚀 Setup Steps

### Step 1: Run Database Setup

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-profiles-setup.sql`
6. Click **Run**
7. Verify you see: "✅ Profiles table setup complete!"

### Step 2: Configure Supabase Auth Settings

1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Scroll to **Auth Providers**
3. Ensure **Email** is enabled
4. For testing: Scroll to **Email Auth** section
5. **Disable** "Enable email confirmations" (makes testing easier)
6. Click **Save**

### Step 3: Verify Environment Variables

Check your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart your dev server after any changes to `.env.local`:

```bash
npm run dev
```

## 🧪 Testing the Signup Flow

### Test 1: Basic Signup (Email Confirmation Disabled)

1. Navigate to `/settings`
2. Click "Sign up"
3. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. **Check browser console** for:
   ```
   🔐 Starting signup process...
   ✅ Auth user created: [uuid]
   Creating profile for user: [uuid]
   ✅ Profile created successfully
   ✅ User logged in immediately
   ```
6. Settings form should appear immediately
7. Your name and email should be pre-filled

### Test 2: Signup with Email Confirmation (Optional)

If you enable email confirmations:

1. Follow steps 1-4 from Test 1
2. Should see alert: "✅ Please check your email to confirm your account"
3. Check email for confirmation link
4. Click link to confirm
5. Return to `/settings` and sign in

### Test 3: Profile Already Exists

The `upsert` ensures this works gracefully:

1. Try signing up with same email again (after deleting from auth.users)
2. Profile gets updated instead of erroring
3. No duplicate profile entries

## 🐛 Debugging

### Check Browser Console

Open DevTools (F12) and look for:
- 🔐 **Starting signup process** - Signup initiated
- ✅ **Auth user created** - Supabase Auth succeeded
- ✅ **Profile created successfully** - Database row created
- ❌ **Error messages** - Shows what failed

### Common Issues & Solutions

#### Issue: "Invalid login credentials"
**Cause**: Trying to sign in before confirming email  
**Fix**: Check email for confirmation link, or disable email confirmation in Supabase

#### Issue: "User already registered"
**Cause**: Email already exists  
**Fix**: Use a different email or sign in instead

#### Issue: "new row violates row-level security policy"
**Cause**: RLS policies not set up correctly  
**Fix**: Run `supabase-profiles-setup.sql` again

#### Issue: Profile not created but auth user exists
**Cause**: RLS policy blocking insert  
**Fix**: 
1. Check policies in Supabase Dashboard → Table Editor → profiles → Policies
2. Ensure "Users can insert own profile" policy exists
3. Policy should use `auth.uid() = id`

#### Issue: "Failed to fetch" or "Network error"
**Cause**: Environment variables not loaded  
**Fix**: 
1. Verify `.env.local` file exists and has correct values
2. Restart dev server: `npm run dev`
3. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

## 📊 Verification Checklist

After successful signup, verify:

- [ ] User appears in Supabase Dashboard → Authentication → Users
- [ ] Profile row exists in Table Editor → profiles table
- [ ] Profile has correct `id` (matches auth.users id)
- [ ] Profile has name, email, notification_preferences
- [ ] User is automatically logged in (if email confirmation disabled)
- [ ] Settings form appears with user data pre-filled
- [ ] Console shows all ✅ success messages

## 🔍 Database Queries for Verification

Run these in Supabase SQL Editor to verify:

```sql
-- Check if user exists in auth
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'test@example.com';

-- Check if profile exists
SELECT * 
FROM profiles 
WHERE email = 'test@example.com';

-- Check RLS policies
SELECT * 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Count total profiles
SELECT COUNT(*) as total_profiles 
FROM profiles;
```

## 🎯 Expected Flow After Fix

1. **User clicks "Create Account"**
   - Console: 🔐 Starting signup process...
   
2. **Supabase creates auth user**
   - Console: ✅ Auth user created: abc-123-uuid
   
3. **App creates profile row**
   - Console: Creating profile for user: abc-123-uuid
   - Console: ✅ Profile created successfully
   
4. **Check session**
   - If email confirmation disabled: ✅ User logged in immediately
   - If email confirmation enabled: 📧 Email confirmation required
   
5. **User sees settings form**
   - Name and email pre-filled
   - Can edit and save settings
   - Changes persist to database

## 🔐 Production Recommendations

Before going to production:

1. **Enable email confirmations** for security
2. **Set up email templates** in Supabase
3. **Add password reset flow**
4. **Implement proper error boundaries**
5. **Add rate limiting** for signup attempts
6. **Monitor auth.users and profiles** for orphaned records
7. **Set up proper error tracking** (Sentry, etc.)

## 📝 Files Modified

- `lib/auth-context.tsx` - Enhanced signUp function with logging and upsert
- `app/settings/page.tsx` - Improved error handling and user feedback
- `supabase-profiles-setup.sql` (new) - Database setup script
- `SIGNUP_FIX_GUIDE.md` (new) - This guide

---

**Status**: ✅ Signup flow fixed and ready for testing  
**Last Updated**: November 2024

