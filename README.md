# Technotainment — Metascape v4 (live prototype)

This repo hosts the **Metascape v4** interactive prototype for **Technotainment** — a
creator live-streaming + VOD platform built around **CAST**, a closed-loop platform credit
(**100 CAST = £1.00**).

Live site:
https://dtechnotainment.github.io/technotainment-demo-walkthrough/

## What this contains

`index.html` is the self-contained Metascape v4 app (React 18 UMD + in-browser Babel, no build
step). It ships **three first-class modes**, each a full app with its own navigation and routing:

- **Viewer** (default) — home, live watch, channel/microcast pages, search, wallet + top-up,
  profile + consent.
- **Creator Studio** — sidebar → "creator studio" (or Profile → become a creator): dashboard,
  go-live control room, content + per-video editor, store/drops, audience, memberships/tiers,
  analytics, earnings/payouts, settings, onboarding.
- **Admin / Operations** — Profile → "operations" *(open for demo; gate to staff in prod)*:
  overview, users, moderation, finance, connectors, SEO & growth, control center, settings.

Toggle light/dark from the top bar. State persists in `localStorage` (`metascape-v4-*` keys).

## Layout

```
index.html         Metascape v4 entry — loads v4/*.jsx
v4/                all prototype modules (viewer + studio + admin + payments)
  theme.css        design tokens (dark-first, data-theme)
  studio.css       additive studio/admin styles
assets/            butterfly + logo marks used by the app (plus brand SVGs)
manifesto.html     the earlier creator-owned-entertainment thesis landing page
```

## Local preview

It's a static site — serve it and open `index.html`.

```bash
python3 -m http.server 8000
# open http://127.0.0.1:8000/
```

## Notes

- This is a **prototype** (front-end fixtures, simulated payments/streaming, toasts instead of
  writes). It is the **product spec**, not the production stack — the production target is
  Next.js (App Router) + TypeScript with SSR/ISR for SEO.
- All people, IDs, amounts, orders, entitlements and payout references are demo data.
