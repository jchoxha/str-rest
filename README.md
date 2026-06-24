# str.rest

Digital guidebooks and direct-booking pages for short-term rental (STR) hosts.

Hosts sign up, create properties, and build a guest-facing page — home details,
house rules, a "shop your stay" affiliate storefront, host bios, a photo
gallery, local recommendations, a virtual guestbook, and a direct-booking call
to action — all from a host dashboard. Guests open a single link for everything
they need during their stay. Sensitive details (Wi-Fi, door codes) stay hidden
until the guest enters the access code the host sent them.

## Tech stack

- **React 19** + **Vite** (static SPA)
- **Supabase** — Postgres + Auth + Storage + Row-Level Security (the backend,
  called directly from the browser)
- **react-router-dom**
- **Tailwind CSS v4**, **Framer Motion**, **lucide-react**

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev            # start the dev server
npm run build          # production build to dist/
npm run lint           # run ESLint
```

**Backend setup is required** before auth/data work — see
[`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) for the one-time project, schema,
provider, and demo-seed steps. Without env vars the app still runs but shows a
"configure Supabase" notice on the login screen.

## Routes

- `/` — landing page
- `/login` — sign in / sign up (email+password, magic link, Google)
- `/app` — host dashboard (protected)
- `/p/:slug` — public guest page for a property

## Project structure

```
src/
  App.jsx                 Routes
  main.jsx                Router + AuthProvider
  auth/                   AuthProvider, useAuth, ProtectedRoute
  lib/
    supabase.js           Supabase client (from env)
    properties.js         Data access: properties CRUD, image upload, guest RPCs, guestbook
  pages/                  LandingPage, LoginPage
  components/
    HostDashboard.jsx     Host admin: dashboard, site builder, property settings, storefront
    GuestView.jsx         Public guest page (also the builder preview)
supabase/migrations/      SQL schema, RLS policies, RPCs, storage bucket
scripts/                  seed-demo.mjs + demo-data.mjs (populate the public demo account)
```

## Deployment

Pushing to `main` builds and deploys to **GitHub Pages** via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (Settings → Pages
→ Source = GitHub Actions). The build reads `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` from repository secrets.

Vite `base` is `/str-rest/`; client-side routes use a `404.html` SPA fallback so
deep links survive a refresh on Pages.
