# Technotainment / Strmit Clickable Demo

Public-safe clickable prototype for Strmit v1.

Live site:
https://dtechnotainment.github.io/technotainment-demo-walkthrough/

## What this contains

This is no longer a static brochure. It is a self-contained clickable HTML prototype covering:

- Audience discovery and paid access flow
- Creator application, onboarding, profile, offer, media, and dashboard flow
- Admin approval, payment/access diagnosis, entitlement repair, payout export/recording, support, and audit flow
- Component/state board for access banners, status pills, repair forms, ledger rows, payout rows, and audit language
- Business review checklist for go/no-go before production coding

All people, IDs, amounts, support tickets, orders, entitlements, and payout references are demo data.

## V1 constraints reflected

- No blockchain/token framing
- No cart
- No merch
- No audience wallet
- One offer per order
- Entitlement is access truth, not provider redirect
- Manual payouts happen outside product and are recorded in Strmit
- Creator onboarding is admin-approved/cohort-based
- Admin repair requires reason and audit trail

## Local preview

```bash
python3 -m http.server 4173
# open http://127.0.0.1:4173/
```

## Files

- `index.html` — self-contained clickable prototype
- `assets/technotainment-logo.svg` — Technotainment logo
- `assets/technotainment-symbol.svg` — Technotainment symbol
