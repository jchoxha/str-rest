# Supabase setup (one-time)

str.rest runs as a static SPA backed by Supabase. Follow these steps once to
stand up the backend, then the app is "plug in keys and go."

## 1. Create the project
1. Go to https://supabase.com → **New project** (free tier is fine).
2. Pick a name/region, set a database password (save it).
3. When it's ready, open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → used only by the local seed script (never commit it).

## 2. Run the schema
1. Open **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and **Run**.
   This creates the tables, RLS policies, the `get_public_property` /
   `unlock_property` RPCs, the slug trigger, and the public `property-images`
   storage bucket. It's safe to re-run.

## 3. Enable auth providers
- **Email**: on by default. For local dev, **Authentication → Providers →
  Email**, you may turn **Confirm email** off so password sign-ups work without
  a verification round-trip.
- **Google**: **Authentication → Providers → Google** → enable, paste a Google
  OAuth client ID/secret (from Google Cloud Console). Add these to
  **Authentication → URL Configuration → Redirect URLs**:
  - `http://localhost:5173/str-rest/`
  - `https://jchoxha.github.io/str-rest/`
- **Magic link**: works out of the box via the Email provider.

## 4. Local env
Copy `.env.example` → `.env` and fill in the URL + anon key:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

## 5. Seed the public demo account
With the service_role key exported (PowerShell example):
```powershell
$env:VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR-SERVICE-ROLE-KEY"
node scripts/seed-demo.mjs
```
This creates a demo host, uploads the sample images to Storage, and inserts the
three sample properties (published). They'll be viewable at
`/p/the-littleton-tiny-home`, `/p/the-riverside-loft`, `/p/the-summit-cabin`.

## 6. Production env (GitHub Pages deploy)
In the **str-rest** repo → **Settings → Secrets and variables → Actions**, add
two repository secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The deploy workflow injects them at build time. (The anon key is public-safe;
security is enforced by Row-Level Security.)
