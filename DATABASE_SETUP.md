# Jus Wellness — Database Setup Guide

## 1. Create a Supabase Project (Free Tier)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Fill in:
   - **Name:** `jus-wellness`
   - **Database Password:** (save this somewhere safe)
   - **Region:** Choose closest to Ghana (e.g. `eu-west-1` or `us-east-1`)
4. Wait ~2 minutes for the project to spin up

## 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (or Cmd+Enter)
6. You should see "Success. No rows returned" — this means all tables, indexes, triggers, RLS policies, and seed data were created

## 3. Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long JWT string)

## 4. Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

## 5. Verify

1. Start the dev server: `npm run dev`
2. Go to your Supabase dashboard → **Table Editor**
3. You should see all tables populated:
   - `products` — 22 rows (all your juices, coconut drinks, shots)
   - `product_sizes` — size/price combos for each product
   - `inventory` — 27 raw material items

## What's Included

### Tables
| Table | Purpose |
|-------|---------|
| `products` | Product catalog |
| `product_sizes` | Size & pricing per product |
| `customers` | Customer database |
| `orders` | All orders (online, WhatsApp, walk-in, wholesale) |
| `order_items` | Line items per order |
| `inventory` | Raw materials & packaging |
| `inventory_logs` | Restock/usage history |
| `production_batches` | Daily production tracking |
| `batch_ingredients` | What went into each batch |
| `inquiries` | Contact form submissions |

### Automations (Database Triggers)
- **Auto order numbers** — `JUS-0001`, `JUS-0002`, etc.
- **Auto batch numbers** — `BATCH-0001`, etc.
- **Auto inventory deduction** — when a batch is marked "completed", ingredients are auto-deducted
- **Auto customer stats** — when an order is delivered, customer's total_orders and total_spent update
- **Auto timestamps** — `updated_at` fields refresh on every update

### Security (Row Level Security)
- **Public:** Can view products, place orders, submit inquiries
- **Authenticated (Admin):** Full CRUD on everything
- No one can read other customers' orders without auth

## Next Steps
- Set up Supabase Auth for admin login
- Connect Paystack for payments
- Deploy to Vercel
