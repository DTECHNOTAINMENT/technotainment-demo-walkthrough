# Decisions — pre-authorized defaults

> **Purpose:** the owner is non-technical and wants Claude Code to build autonomously.
> This file pre-decides the questions Claude Code would otherwise stop to ask. **Treat every
> choice here as approved.** Only pause for the items under "§4 Must ask the owner". If a
> decision isn't covered here, pick the **simplest, most standard, reversible** option, write it
> into this file under "added by Claude Code", and keep going.

---

## 1. Technical stack — LOCKED (don't re-litigate)

| Area | Decision |
|---|---|
| Framework | **Next.js (App Router) + TypeScript** |
| Hosting | **Vercel** for dev/preview DX — but **production target is AWS**. Stay cloud-portable; no Vercel-only features. See `docs/INFRASTRUCTURE.md`. |
| Database | **PostgreSQL** via **Prisma** |
| Cache / realtime counters | **Redis** (Upstash) |
| Auth | **Clerk** (fastest); viewer social login + staff org/MFA. (WorkOS/Auth0 acceptable if Clerk blocks.) |
| Styling | **Tailwind CSS**, but port `theme.css` tokens verbatim as CSS variables; keep `data-theme`. |
| Components | shadcn/ui as the base; rebuild the prototype's primitives (`StatCard`, `Pill`, etc.) on top. |
| State/data fetching | Server Components for reads; **TanStack Query** for client mutations. |
| Payments | **Stripe** first (cards, Apple/Google Pay, 3DS, Connect payouts). Add others later behind the same interface. |
| Live media | **Mux** (ingest/transcode/VOD). LiveKit later for co-watch rooms. |
| Email / SMS / push | Resend (email), Twilio (SMS), Firebase (push). |
| File/image storage | **S3-compatible** behind a `StorageProvider` — Cloudflare R2 in dev, **AWS S3** in prod (same adapter). |
| Containerization | **Docker** (`output: "standalone"`) from Phase 0 → runs on ECS Fargate. Keep app stateless. |
| Error tracking / analytics | Sentry + PostHog. |
| Tests | Vitest (unit) + Playwright (e2e on critical flows). |
| CI | GitHub Actions: typecheck, lint, test, build on every PR. |
| **Client (v1)** | **Responsive web + installable PWA.** One Next.js codebase serves desktop + mobile browsers; no app stores needed to launch. |
| **Native apps** | **Deferred to post-launch** — React Native (Expo) reusing the same API. Apple/Google **in-app purchase** for selling CAST only becomes relevant then (store policy). Don't build native in v1. |

**Build incrementally with stubs.** Every integration sits behind an interface with a **mock
implementation** so the app runs end-to-end before real keys exist (see `BUILD_PLAN.md`). The app
must always boot and demo with mocks; real providers swap in when the owner supplies keys.

---

## 2. Product/business rules — DEFAULTS (owner can change later in Admin)

These mirror the prototype's Admin → Settings. Use them; surface them as editable config, not
hard-codes.

- **CAST:** `100 CAST = £1.00`. Integer only. Balances are an append-only ledger (a liability).
- **Platform fee:** **12%** of creator earnings (per-creator override allowed). No top-up fee to fans.
- **Payouts:** 7-day clearing hold; auto-run monthly on the 1st; **no minimum**; bank transfer free.
- **Refunds:** fan-initiated within **14 days** for undelivered/defective digital goods; tips are
  non-refundable; PPV refundable only if unwatched. Refund reverses the CAST ledger entry.
- **Membership pricing:** changing a tier price never affects existing members (rate locked until cancel).
- **Creator eligibility:** any verified user can apply; **KYC (Persona) required before first payout**,
  not before creating. New creators start at the 12% standard rate.
- **Moderation:** 3-strike model → strike 1 warn, strike 2 temp suspend (7d), strike 3 ban. High-severity
  (CSAM, credible threats, fraud) = immediate suspend + report. AI auto-flag holds risky items for human review.
- **Age:** 16+ to watch, 18+ to earn/spend or view age-restricted content. Collect DOB at signup; gate accordingly.
- **Consent:** analytics expose only granted scopes; delete a viewer's data ≤7 days after withdrawal.
- **Regions at launch:** UK + EU (GBP/EUR). US/others behind a feature flag.
- **Account closure:** unspent CAST is refundable to the original method within 90 days; creator
  balances are paid out per normal schedule, then the channel is archived.

---

## 3. Conventions Claude Code should just follow

- **Configure, don't code** (`CLAUDE.md §4b`): anything the owner might change = a DB-backed setting
  in the Admin control center, read at runtime, never hardcoded. Deferred features ship built but
  flag-off so the owner enables them with a toggle. When in doubt, make it a setting.
- Money in code = integer CAST; format to fiat only at the UI/payout edge.
- Lowercase UI voice; tabular/mono numerals (matches the prototype).
- Every privileged/admin action writes an **AuditEvent**. Build the audit log as infrastructure.
- Feature-flag anything risky; default new flags **off** in prod, **on** in preview.
- Accessibility: WCAG AA, keyboard nav, captions on video, 44px hit targets.
- Secrets only server-side; never expose secret keys to the client or logs.
- Write a test for every money path and every auth/permission boundary.

---

## 4. Must ask the owner (don't guess — these are real-world / legal / spend)

Claude Code should **proceed with mocks** and collect these in `docs/FOR_THE_OWNER.md → setup
checklist`, surfacing them when a real deployment needs them:

1. **Domain name** + DNS access.
2. **Legal entity + bank account** (needed for Stripe/Adyen KYB and payouts).
3. **Provider sign-ups & API keys** — Stripe, Mux, Clerk, Persona, Resend, Twilio, Cloudflare, etc.
   (Claude Code lists exactly which and where to paste them.)
4. **Terms of Service + Privacy Policy** — needs a lawyer; Claude Code can draft placeholders.
5. **Music/content licensing** (PRS/PPL/ASCAP) — required for a music-heavy platform; owner decision.
6. **Brand assets** — final logo files, colours already in `theme.css`.
7. **Go-live approval** — owner approves before anything touches real money or real users.

---

## 5. MVP / launch scope — build this first, defer the rest

To avoid gold-plating, **v1 = the smallest thing that lets a fan pay a creator and a creator get
paid, with staff able to run it safely.** Build the phases in `BUILD_PLAN.md` to this cut line;
everything under "defer" is real and specced, just **not** for first launch.

**In v1**
- Viewer: sign up, browse/search, watch **live + VOD**, follow, **wallet top-up** (cards +
  Apple/Google Pay), **tip**, buy **one-tier membership**, buy a **drop/PPV**.
- Creator: onboarding (mints empty channel), **go live**, **upload**, memberships + tips + store,
  **earnings + bank payout** (KYC before first payout).
- Admin: users, creators/applications, **moderation**, **finance + payout runs**, connectors, settings.
- Public **SEO** pages (channel/watch/clip/explore/live) — SSR + schema + sitemaps.
- Regions: **UK + EU**. Web/PWA only.

**Defer (post-launch, behind flags)**
- Co-watch "small rooms", native mobile apps, courses, gifted-sub gifting UX polish, USDC/BNPL
  top-ups, advanced analytics, US + other regions, referral/affiliate, marketing blog/CMS.

When unsure whether something is v1, **assume defer** and ship the simpler path.

## 6. Things still worth an owner answer (have defaults — won't block)

These are pre-defaulted so the build never stops, but you may want to weigh in (see
`docs/READINESS.md`): brand fonts/logo finalization, exact platform-fee %, launch regions,
content/community policy wording, and customer-support channel (default: a support email +
help centre; Intercom/Zendesk later).

## 7. Added by Claude Code
*(append new decisions here as they come up, with a one-line rationale, so the owner has a trail.)*
