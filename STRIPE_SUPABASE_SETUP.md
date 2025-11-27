# Stripe Billing & Supabase Persistence Setup Guide

This guide will help you set up Stripe billing and Supabase persistence for your SaaS dashboard.

## 🎯 What's Been Implemented

### ✅ Stripe Integration
- Checkout flow for Pro ($29/mo) and Enterprise ($99/mo) plans
- Stripe customer creation
- Subscription management
- Success/cancel redirect handling

### ✅ Supabase Persistence
- Settings page saves to database
- User profile updates (name, email)
- Notification preferences storage
- Real-time data loading

## 📋 Prerequisites

Before starting, ensure you have:
- [Stripe Account](https://dashboard.stripe.com/register) (test mode)
- [Supabase Project](https://app.supabase.com) (already set up)
- Node.js and npm installed

## 🚀 Setup Steps

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration script from `supabase-migration.sql`:

```sql
-- Add Stripe and subscription columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": false, "marketing": true}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
```

4. Verify the migration:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
```

### Step 2: Create Stripe Products

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/test/products)
2. Create **Pro Plan**:
   - Name: Pro Plan
   - Pricing: $29.00 / month (recurring)
   - Copy the **Price ID** (starts with `price_`)
3. Create **Enterprise Plan**:
   - Name: Enterprise Plan
   - Pricing: $99.00 / month (recurring)
   - Copy the **Price ID**

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your environment variables in `.env.local`:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Test Keys (from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Price IDs (from Step 2)
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_yyy
```

### Step 4: Update Stripe Library

Update `lib/stripe.ts` with your actual price IDs, or use environment variables as shown above.

### Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the Integration

### Test Stripe Checkout

1. **Navigate to Billing Page**
   - Go to `/billing`

2. **Click "Upgrade to Pro"**
   - You'll be redirected to Stripe Checkout

3. **Use Test Card**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Complete Payment**
   - After success, you'll be redirected back to `/billing?success=true`
   - You should see a success message

5. **Verify in Stripe Dashboard**
   - Check [Stripe → Customers](https://dashboard.stripe.com/test/customers)
   - Check [Stripe → Subscriptions](https://dashboard.stripe.com/test/subscriptions)

### Test Settings Persistence

1. **Navigate to Settings Page**
   - Go to `/settings`

2. **Update Profile**
   - Change your name
   - Change your email
   - Toggle notification preferences

3. **Save Changes**
   - Click "Save Changes"
   - Wait for "Saved!" confirmation

4. **Verify in Supabase**
   - Open Supabase → Table Editor → `users`
   - Find your user record (id: `user-123`)
   - Verify the changes were saved

5. **Refresh Page**
   - Reload `/settings`
   - Confirm your changes persist

## 📁 Files Created/Modified

### New Files

```
├── lib/
│   ├── stripe.ts                      # Stripe client & configuration
│   ├── supabase-actions.ts            # Database operations
│   └── user-context.tsx               # User session context
├── app/api/stripe/checkout/
│   └── route.ts                       # Checkout API endpoint
├── supabase-migration.sql             # Database schema updates
└── .env.example                       # Environment template
```

### Modified Files

```
├── app/
│   ├── billing/page.tsx               # Real Stripe integration
│   ├── settings/page.tsx              # Supabase persistence
│   └── layout.tsx                     # UserProvider wrapper
└── package.json                       # Added stripe packages
```

## 🔑 API Endpoints

### POST `/api/stripe/checkout`

Creates a Stripe Checkout session.

**Request Body:**
```json
{
  "plan": "pro" | "enterprise",
  "userId": "user-123"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

## 🔒 Security Notes

### Current Implementation (Development)
- ⚠️ **Hardcoded User ID**: Currently using `user-123`
- ⚠️ **No Authentication**: No login/logout functionality
- ⚠️ **Test Mode Only**: Using Stripe test keys

### Production Recommendations
1. **Implement Authentication**
   - Use NextAuth.js, Supabase Auth, or Clerk
   - Get real user ID from session
   - Protect API routes with middleware

2. **Add Stripe Webhooks**
   - Listen for `checkout.session.completed`
   - Update database when subscription changes
   - Handle subscription cancellations

3. **Validate Requests**
   - Check user permissions
   - Validate plan selections
   - Rate limit API endpoints

4. **Use Environment Variables**
   - Never commit `.env.local`
   - Use production Stripe keys in production
   - Set up proper secrets management

## 📊 Database Schema

### Users Table (After Migration)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | - | Primary key |
| name | text | - | User's full name |
| email | text | - | User's email address |
| status | text | - | active/inactive |
| plan | text | - | Free/Pro/Enterprise |
| created_at | timestamp | now() | Account creation date |
| stripe_customer_id | text | null | Stripe customer ID |
| subscription_status | text | 'free' | Current subscription |
| subscription_id | text | null | Stripe subscription ID |
| notification_preferences | jsonb | {...} | User preferences |

## 🎨 User Flow

### Billing Flow
```
User clicks "Upgrade"
  ↓
Call /api/stripe/checkout
  ↓
Create/retrieve Stripe customer
  ↓
Create checkout session
  ↓
Redirect to Stripe
  ↓
User enters payment info
  ↓
Redirect back to /billing?success=true
  ↓
Show success message
```

### Settings Flow
```
User loads /settings
  ↓
Fetch user data from Supabase
  ↓
Display in form
  ↓
User makes changes
  ↓
Click "Save Changes"
  ↓
Update Supabase via supabase-actions
  ↓
Show "Saved!" confirmation
```

## 🐛 Troubleshooting

### Stripe Checkout Not Working

**Issue**: "Failed to create checkout session"

**Solutions**:
1. Check environment variables are set correctly
2. Verify Stripe API keys are valid
3. Check price IDs match your Stripe products
4. Look at browser console for errors
5. Check terminal logs for API errors

### Settings Not Saving

**Issue**: Changes don't persist after refresh

**Solutions**:
1. Verify database migration ran successfully
2. Check Supabase connection in browser console
3. Ensure `user-123` exists in users table
4. Check for errors in browser console
5. Verify Supabase permissions (RLS policies)

### Database Migration Failed

**Issue**: Column already exists error

**Solutions**:
1. Use `IF NOT EXISTS` in ALTER statements (already included)
2. Check if migration already ran
3. Manually verify columns in Supabase table editor

## 🚢 Next Steps

### Recommended Enhancements

1. **Add Authentication**
   - Implement NextAuth.js or Supabase Auth
   - Replace hardcoded `user-123` with real user IDs
   - Add login/logout functionality

2. **Stripe Webhooks**
   - Create `/api/stripe/webhook` endpoint
   - Handle `checkout.session.completed` events
   - Automatically update subscription status

3. **Subscription Management**
   - Cancel subscription button
   - Upgrade/downgrade between plans
   - View billing history
   - Download invoices

4. **Error Handling**
   - Better error messages
   - Retry logic for failed requests
   - Toast notifications for feedback

5. **Testing**
   - Write unit tests for API routes
   - Test webhook handlers
   - Integration tests for checkout flow

## 📚 Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## ❓ Support

If you encounter issues:
1. Check browser console for errors
2. Check terminal logs for server errors
3. Verify environment variables are set
4. Test with Stripe test cards
5. Check Supabase logs in dashboard

---

**Status**: ✅ Implementation Complete
**Last Updated**: November 2024

