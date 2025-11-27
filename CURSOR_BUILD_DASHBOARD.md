# Build Complete SaaS Dashboard

## Project Setup (Already Done)
- Next.js 14 with TypeScript
- Tailwind CSS configured
- shadcn/ui initialized with components: button, card, input, label, avatar, dropdown-menu, separator, table, badge
- Supabase connected (env vars in .env.local)

## What to Build

Create a complete SaaS admin dashboard with these pages:

### 1. Layout (`app/layout.tsx`)
- Dark sidebar navigation on the left (fixed, 250px wide)
- Main content area on the right
- Navigation items: Dashboard, Users, Analytics, Billing, Settings

### 2. Dashboard Page (`app/page.tsx`)
- 4 KPI cards at top: Total Users, Revenue, Active Subscriptions, Growth %
- Use mock data for now
- Clean, modern design with the shadcn cards

### 3. Users Page (`app/users/page.tsx`)
- Table showing users from Supabase
- Columns: Name, Email, Status, Plan, Joined Date
- Fetch from Supabase `users` table
- Create `lib/supabase.ts` for the client

### 4. Analytics Page (`app/analytics/page.tsx`)
- Simple stats cards (no charts needed, keep it simple)
- Show: Page Views, Bounce Rate, Avg Session, Top Pages

### 5. Billing Page (`app/billing/page.tsx`)
- Current plan display
- Pricing cards for different tiers (Free, Pro, Enterprise)
- Mock upgrade buttons

### 6. Settings Page (`app/settings/page.tsx`)
- Profile settings form (name, email)
- Notification toggles
- Save button

## Supabase Setup

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

The `users` table already exists with columns: id, name, email, status, plan, created_at

## Design Guidelines
- Use shadcn/ui components everywhere
- Dark sidebar, light main content
- Clean, minimal, professional look
- Mobile responsive

## Build Order
1. Create the sidebar layout first
2. Build the dashboard page with KPI cards
3. Add the users page with Supabase fetch
4. Add analytics, billing, settings pages
5. Make sure navigation works between all pages

Start building now!
