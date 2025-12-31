# SaaS Analytics Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-purple)](https://stripe.com/)

Production-ready SaaS dashboard with authentication, billing, and analytics.

**[Live Demo](https://saas-dashboard-ngeazfea4-andrews-projects-8a799fb4.vercel.app)**

---

## Features

### Core
- **Authentication** - Email/password signup and login with Supabase Auth
- **Dashboard** - KPI cards, revenue charts, user metrics
- **User Management** - Searchable table with filters, pagination, role management
- **Billing** - Stripe checkout integration, subscription management, pricing tiers
- **Settings** - Profile editing, notification preferences, API key management
- **Dark Mode** - System preference detection with manual toggle

### Technical
- **Next.js 14** - App Router with Server Components
- **TypeScript** - Full type safety
- **Supabase** - PostgreSQL with Row Level Security
- **Stripe** - Payment processing and subscriptions
- **Recharts** - Interactive data visualization
- **shadcn/ui** - Accessible component library
- **Tailwind CSS** - Utility-first styling

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Deployment | Vercel |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Main dashboard with KPIs and charts |
| `/analytics` | Detailed analytics and metrics |
| `/users` | User management table |
| `/billing` | Subscription and payment management |
| `/settings` | Account settings |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Stripe account (optional, for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/aandrew-el/saas-dashboard.git
cd saas-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Stripe keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
```

---

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

---

## Author

**Andrew** - Full-stack developer

- GitHub: [@aandrew-el](https://github.com/aandrew-el)
- LinkedIn: [andrew-e-921028390](https://linkedin.com/in/andrew-e-921028390)

Available for freelance MVP development.

---

## License

MIT
