# OBSYN // Archival Monolith Streetwear

OBSYN is a premium, high-contrast, black-themed apparel e-commerce platform engineered with a "Nike-level" digital polish — high-contrast monochrome design, architectural silhouettes, large hero imagery, and buttery-smooth scrolling (Lenis + GSAP).

---

## Tech Stack & Architecture

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom obsidian monochrome tokens (`#050505`, `#0a0a0a`, `#d4ff00` subtle neon accent)
- **Smooth Scroll & Motion**: Lenis (buttery inertia scrolling synced with GSAP ticker), GSAP with ScrollTrigger for section reveals and parallax, Framer Motion for drawer & modal micro-interactions
- **Database & Storage**: Supabase (PostgreSQL with strict Row Level Security + Storage for product images and custom designs)
- **Authentication**: Clerk (Google OAuth only) with server-side session validation
- **Payment Architecture**: Abstracted Payment Adapter (`lib/payment/`) with interchangeable providers (`test`, `stripe`, `razorpay`, `paypal`) and atomic stock deduction via Postgres RPC

---

## Security & Row Level Security (RLS) Model

Because this project authenticates users with Clerk rather than Supabase Auth, requests from the browser using the anon key do not carry Supabase-issued JWTs. To prevent permission denial while maintaining ironclad security:

1. **Service-Role Protected Tables**:
   - `orders`, `custom_designs`, `coupons`, `admins`, `activity_logs` have RLS enabled with zero public/anon/authenticated client access. They can ONLY be read or written via the **Supabase Service Role Key** on the server.
2. **Server-Side Mediation**:
   - `/orders`: A Next.js Server Component that reads the authenticated user's email via Clerk (`currentUser()`), queries Supabase with the service role client filtering by `user_email`, and passes customer orders to the UI.
   - `/api/custom-designs`: Authenticates with Clerk server-side, saves custom design assets to Supabase Storage, and inserts a row into `custom_designs` via the service role client.
   - `/api/checkout`: Validates the session and executes the atomic `place_order()` stored procedure in Postgres via the service role client.
   - `/api/coupons/validate`: Verifies coupons server-side without ever exposing the full coupon list to the public client.
   - `/control-obsyn`: Unguessable admin portal strictly gated on the server. Returns a `404 Not Found` if the visitor is not in `ADMIN_EMAILS` or the `admins` table.
3. **Public Client Bounds**:
   - The browser-side Supabase client (`lib/supabase/client.ts`) is strictly limited to public read queries (`products` and `sales`).

---

## Setup & Deployment Instructions

### 1. Database Setup (Supabase)

1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, copy its entire contents, paste into the SQL Editor, and click **Run**.
   - This creates all 7 tables with strict RLS policies.
   - Installs the atomic `place_order` stored procedure with row-level locks (`FOR UPDATE`).
   - Creates the `product-images` and `custom-designs` storage buckets with public read access.
   - Seeds flagship Genesis Drop 01 products, active promotional codes (`OBSYN10`, `WELCOME20`, `VIP50`), and an active launch sales campaign.

### 2. Authentication Setup (Clerk)

1. Create an application in [Clerk](https://clerk.com).
2. In **User & Authentication > Social Connections**, enable **Google** only.
3. Copy your Publishable Key and Secret Key into `.env.local`.
4. In **Webhooks**, create an endpoint pointing to `https://your-domain.com/api/webhooks/clerk` (or your local ngrok/localtunnel URL during development):
   - Subscribe to events: `user.created` and `user.updated`.
   - Copy the **Signing Secret** into `CLERK_WEBHOOK_SECRET` in `.env.local`.
   - The webhook automatically logs new user signups directly into the `activity_logs` table.

### 3. Environment Configuration

Create a `.env.local` file in the root directory (see `.env.example`):

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Admin Access Control (Standing allowlist for instant site owner access)
ADMIN_EMAILS=owner@gmail.com,admin@obsyn.com

# Payments
PAYMENT_PROVIDER=test # Change to 'stripe' | 'razorpay' | 'paypal' when gateway is selected
PAYMENT_PUBLIC_KEY=
PAYMENT_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the storefront.

---

## Key Features & Pages

- **`/` (Home)**: High-contrast hero with GSAP reveals, brand manifesto scrub reveal, flagship drop showcase, atelier configurator teaser, craftsmanship pillars.
- **`/catalogue`**: Complete product grid with real-time category filters and price sorting.
- **`/catalogue/[id]`**: Multi-angle gallery, size and fabric selectors, live stock countdown, add to bag with slide-in drawer.
- **`/custom-order`**: Bespoke configurator with silhouette selector, fabric dropdown, size dropdown, pattern dropdown, single artwork upload with fixed centered overlay, and live dynamic price calculation.
- **`/checkout`**: Order summary, server-validated coupon discounts, abstracted payment processing, and atomic stock decrement via `place_order()`.
- **`/order-confirmation`**: Minimalist luxury receipt with tracking number and production timeline.
- **`/orders`**: Customer order history filtered server-side by Clerk user email.
- **`/control-obsyn`**: Hidden admin portal gated by `ADMIN_EMAILS`:
  - Product catalogue CRUD (pricing, stock, featured toggle, textile options)
  - Promotional coupon management
  - Flash sales and campaign scheduler
  - Timeframe-filtered orders fulfillment matrix (12h, 24h, 1w, 1m, all time)
  - Live append-only activity & security audit ledger
