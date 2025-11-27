import Stripe from 'stripe'

// Stripe is optional - only initialize if key is present
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  : null

// Stripe Price IDs - Replace with your actual price IDs from Stripe Dashboard
// To get these:
// 1. Go to https://dashboard.stripe.com/test/products
// 2. Create a "Pro Plan" product with $29/month recurring price
// 3. Create an "Enterprise Plan" product with $99/month recurring price
// 4. Copy the price IDs (they start with "price_") and paste them here

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    name: 'Pro',
    amount: 2900, // $29.00 in cents
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
    name: 'Enterprise',
    amount: 9900, // $99.00 in cents
  },
} as const

export type PlanType = keyof typeof STRIPE_PLANS

