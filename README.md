# Grand MF Arena — Sales & Inventory Management System

A simple, elegant black-and-gold sales & inventory system built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Features

- **Dashboard** — total sales, total products sold, number of stores, recent transactions
- **New Sale** — select store, add multiple products with quantity/price, auto subtotal + grand total, saved atomically with stock deduction
- **Inventory** — add/edit/delete products, tracks current stock, price, and units sold
- **Stores** — list of stores, click through to see full purchase history per store
- **Sales History** — filter by store, product, and date range; view full transaction details
- Email/password login (Supabase Auth), protected routes via middleware
- Responsive sidebar navigation, black + gold theme built around the Grand MF Arena logo

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Deployable to Vercel

---

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql` from this project. It will:
   - Create the `stores`, `products`, `transactions`, and `transaction_items` tables
   - Enable Row Level Security with a policy allowing any signed-in user full access
   - Insert the sample stores (Sugbabs, Vins, Egoy, Rouxsther, GMD) and products (Red Horse, Grande, San Mig Light, Pale Pilsen, Coke Mismo, Sprite Mismo, Royal Mismo)
   - Create a `record_sale` function used by the app to save a transaction and decrement stock atomically
3. Go to **Authentication → Users** and create a login for each staff member who will use the system (email + password). There is no public sign-up page by design — only an admin creates accounts.
4. Go to **Settings → API** and copy:
   - **Project URL**
   - **anon public key**

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

These are the **only** two environment variables required. Both are safe to expose to the browser (the anon key relies on Row Level Security, which is enabled in the schema).

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, and sign in with a user you created in Supabase Auth.

## 4. Deploy to Vercel

1. Push this project to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com/new).
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel will detect Next.js automatically — no extra build configuration is needed.

## Project structure

```
src/
  app/
    (app)/                 — authenticated pages, wrapped with the sidebar layout
      page.tsx             — Dashboard
      sales/page.tsx       — New Sale (transaction entry)
      inventory/page.tsx   — Inventory (add/edit/delete products)
      stores/page.tsx      — Stores list
      stores/[id]/page.tsx — Store purchase history
      history/page.tsx     — Sales history with filters
    login/page.tsx         — Login page (no sidebar)
    layout.tsx             — Root layout
    globals.css            — Theme tokens (black + gold)
  components/
    Sidebar.tsx             — Responsive sidebar navigation
    ui.tsx                  — Card, Button, Input, Select, Modal, etc.
  lib/
    supabase/client.ts      — Browser Supabase client
    supabase/server.ts      — Server component Supabase client
    types.ts                — Shared TypeScript types + formatters
  middleware.ts             — Redirects unauthenticated users to /login
supabase/
  schema.sql                — Full database schema + sample data
public/
  logo.jpg                  — Grand MF Arena logo
```

## How stock deduction works

Saving a sale calls the `record_sale` Postgres function (via `supabase.rpc(...)`) instead of inserting rows directly from the client. That function, in a single transaction:

1. Creates the `transactions` row
2. Locks and checks each product's stock
3. Inserts each `transaction_items` row
4. Decrements `products.stock` and increments `products.units_sold`
5. Updates the transaction's `grand_total`

This keeps stock counts accurate even if two sales are recorded at the same time, and prevents selling more than what's in stock.

## Notes on scope

This is intentionally kept simple, per the brief: one shared login for authenticated staff (no per-role permissions), no receipt printing, and no reporting/export beyond the on-screen dashboard and history filters. These are natural next steps if you want to extend the system later — e.g. CSV export, multiple staff roles, or low-stock email alerts.
