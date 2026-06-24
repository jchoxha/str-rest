# str.rest

Digital guidebooks and direct-booking pages for short-term rental (STR) hosts.

Hosts build a guest-facing page — home details, house rules, a "shop your
stay" affiliate storefront, host bios, a photo gallery, local recommendations,
a virtual guestbook, and a direct-booking call to action — and manage it all
from a host dashboard. Guests open a single link for everything they need
during their stay.

## Tech stack

- **React 19** + **Vite** (SPA, no backend yet)
- **Tailwind CSS v4**
- **Framer Motion**, **lucide-react**
- State persisted client-side in `localStorage`

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## Project structure

```
src/
  App.jsx                     Top-level Host/Guest toggle + app state
  components/
    HostDashboard.jsx         Host admin: dashboard, analytics, site builder, storefront
    GuestView.jsx             Public guest-facing page (also rendered as the builder preview)
  data/
    defaultProperties.js      Seed content for the demo property
```

## Deployment

Pushing to `main` builds the app and deploys it to **GitHub Pages** via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pages must be
configured to deploy from **GitHub Actions** (Settings → Pages → Source).

Vite is configured with a relative `base` (`./`), so the build works from any
sub-path without hardcoding the repository name.

## Status

Early development — evolving from a UI prototype into a working app. Data is
currently client-side only.
