# Build Plan — Technotainment

A sequenced, self-verifiable plan for building the production app **autonomously**. Work top to
bottom. Each phase has a **Definition of Done (DoD)** — don't advance until every box is checked
and tests are green. Every integration starts as a **mock** so the app always boots and demos
without real keys; swap real providers in when the owner supplies them (`docs/FOR_THE_OWNER.md`).

> Spec for any screen = its `.jsx` file in `v4/`. Data shapes = `docs/DATA_MODEL.md`.
> URLs + render modes = `docs/ROUTES.md`. Locked choices = `docs/DECISIONS.md`.
> **Build each feature as a team** (PO → UX → Frontend → Backend → QA → Security → Release) per
> `docs/TEAM.md`; the QA pass + report is mandatory before a feature counts as done.

Track progress by checking boxes in this file as you go.

---

## Phase 0 — Foundation & scaffold  ✅ complete (2026-05-30)
- [x] Next.js + TS + Tailwind app boots; `theme.css` tokens ported as CSS vars; `data-theme` light/dark works.
- [x] Prisma schema from `docs/DATA_MODEL.md` (24 models + enums); migration `init` applies; seed loads the prototype fixtures (verified: @mira.k derives **12,480 CAST**).
- [x] Role-gated middleware; `/admin` → staff, `/studio`/`/wallet` → authed (verified: `/admin` 307→`/sign-in`). Auth behind a mock `AuthProvider` (Clerk gate) — full sign-in UI is Phase 2.
- [x] **CAST ledger**: append-only `WalletEntry`; balance derived, never mutated; overdraw-guarded. Unit-tested (12 money/ledger tests green).
- [x] Provider interfaces + **mock** implementations for 17 domains (payments, media, auth, kyc, email, sms, push, risk, content-id, moderation, tax, flags, storage, queue, analytics, search-console) — per `docs/INTEGRATIONS.md`. One env var gates each; absent key → mock. `registry.ts` + `launch-check.ts` enforce required providers when `LAUNCH_MODE=prod`.
- [x] **AWS-ready scaffold** (`docs/INFRASTRUCTURE.md` §2): `Dockerfile` + `.dockerignore`, `next.config output:"standalone"`, `/api/health` (DB+Redis), S3-compatible `StorageProvider`, `QueueProvider` stub, `docker-compose.yml` (Postgres+Redis), `infra/` Terraform skeleton. Config via env only; stateless app.
- [x] CI green: typecheck, lint, unit tests, build (GitHub Actions). Sentry + PostHog wired as env-gated no-op stubs (`src/lib/observability.ts`).
- **DoD:** ✅ app builds (`next build`, standalone) and runs against local Postgres+Redis; `/api/health` → `200 {db:ok,redis:ok}`; the seeded user shows a live CAST balance from the ledger. ⏳ Vercel preview deploy is owner-side (connect the repo to Vercel — see `docs/FOR_THE_OWNER.md`).

> **Owner note (Phase 0):** the foundation is built and verified locally. What works: the app boots
> dark/light, the CAST ledger derives balances correctly, every external service runs on mocks (no
> accounts needed), and it's container/AWS-portable. What's mocked: all providers (Stripe, Mux, Clerk,
> …) until you supply keys. What I need from you: nothing yet — optionally connect the repo to Vercel
> for a live preview URL. Next up: **Phase 1 — public pages + SEO**.

## Phase 1 — Public pages + SEO  ✅ complete (2026-05-30)  *(highest growth leverage)*
- [x] `/c/:handle`, `/watch/:slug`, `/clip/:slug`, `/explore/:category`, `/live`, `/search` — SSR/ISR (channel/watch/clip/explore ISR revalidate 60; live/search SSR).
- [x] schema.org JSON-LD per `docs/ROUTES.md` (VideoObject + chapter `hasPart`, BroadcastEvent, Person/Organization, Product, BreadcrumbList); canonical + OG/Twitter tags; dynamic OG image at `/api/og`.
- [x] Dynamic sitemaps (creators/videos/clips/categories via `generateSitemaps`) + robots.txt; 301 legacy redirects (`/u/:handle` static; `/video/:id`, `/stream/:id` slug-lookup handlers).
- [~] Core Web Vitals: pages are server-rendered with lazy-loaded media and light client JS (~94 kB First Load). A full Lighthouse/CWV audit on real media is deferred to Phase 5 polish.
- **DoD:** ✅ verified live against the seeded DB — `/watch/night-session-13` renders server-side with a valid `VideoObject` (name, duration, author, chapter `hasPart`) and appears in `sitemap/videos.xml`; `/api/og` returns a 1200×630 PNG; legacy ids 301-redirect.

> **Owner note (Phase 1):** the public, search-facing surface is live. Every channel, video, clip,
> explore hub and the live index now server-renders with rich-result structured data, social share
> cards, and auto-generated sitemaps — the foundation for organic growth. Still mocked: video
> playback uses a public test stream until Mux keys are added. Next up: **Phase 2 — viewer app + money in**
> (wallet top-up, tips, memberships via Stripe test cards).

## Phase 2 — Viewer app + money in  ✅ complete (2026-05-30)
- [x] Authed shell (sidebar + topbar w/ live CAST balance + sign-out) + home, following, library, notifications, settings, profile + **consent** model (search shipped in Phase 1). Dev sign-in lists seeded users (Clerk in prod).
- [x] Wallet + **top-up** flow (select → method → 3DS for cards / express skips it → success) via the PaymentProvider (Stripe mock); saved methods + transaction history.
- [x] follow / subscribe(tier) / tip / buy product → atomic Transaction + WalletEntry + receipts. Membership locks the price (DECISIONS §2). (Gift uses the same `spend` path; dedicated gifting UX is a deferred flag.)
- [x] Payments webhook (`/api/webhooks/payments`) idempotent (settleTopup never double-credits; covered by a test). Signature verification stubbed until real Stripe keys (Phase 6).
- **DoD:** ✅ verified end-to-end against the seeded DB — @mira.k tops up 5,000 via a 3DS card (challenge→confirm→settle), tips 100, buys a 250 membership; ledger goes 12,480 → 17,480 → 17,380 → 17,130; receipt renders; overdraw is blocked (400); `/wallet` redirects when signed out. 20/20 tests (8 money integration tests vs Postgres).

> **Owner note (Phase 2):** fans can now sign in, add CAST, and pay creators. Top-up runs the full
> card 3-D Secure dance (or express for wallets), every spend writes an auditable ledger entry and a
> receipt, and balances can never go negative or be double-credited. Still mocked: the actual card
> charge (Stripe test logic) until you add keys. Note: staff/admin sign-in arrives with **Phase 4**
> (the user role enum is member/creator today). Next up: **Phase 3 — Creator Studio**.

## Phase 3 — Creator Studio  ✅ complete (2026-05-30)
- [x] Onboarding mints a **fresh empty channel** (not the Nyx demo) + first tier + payout method, and flips the user to creator. 5-step flow.
- [x] Content: upload via the VideoProvider (Mux mock, direct upload) → processing state; per-video editor with **SEO fields** (slug + canonical preview, metaDescription ≤160, visibility public/members/ppv, captions) + publish.
- [x] Go-live: rotatable stream key + RTMP ingest (Mux mock), recording → VOD on end. (Live chat + viewer counts are simulated; realtime is **Phase 5**.)
- [x] Store/drops, memberships/tiers, audience roster, analytics (views/revenue/by-kind).
- [x] **Earnings/payouts:** derived earnings (net via per-creator fee) with a **7-day hold**; withdraw via the PayoutProvider (Stripe Connect mock); **KYC (Persona mock) required before first payout**; payout history + methods.
- **DoD:** ✅ verified live as @nyxsynth — uploads + publishes a video, goes live then ends (recording → VOD), KYC-gates then withdraws 10,000 CAST → **PO held (£100.00) → cleared to paid**; selling a membership flows to earnings. 24/24 tests (incl. 4 earnings/payout: fee derivation, KYC gate, request+clear, overdraw). No onboarding redirect loop.

> **Owner note (Phase 3):** creators can now run a channel end-to-end — onboard, upload + SEO-tune
> videos, go live (test stream), set memberships/store, see analytics, and **get paid** (KYC →
> withdraw → clears after the hold). Still mocked: real Mux ingest + Stripe Connect payouts until
> keys are added. Next up: **Phase 4 — Admin / Operations** (incl. staff sign-in + payout runs).

## Phase 4 — Admin / Operations  ✅ complete (2026-05-30)
- [x] Overview KPIs, users (suspend/reinstate/KYC), creators + **applications/approval** + take-rate + payout-hold, moderation queue (investigate/strike/remove/dismiss; strike suspends the user — full 3-strike escalation + live monitor are refinements).
- [x] Finance: transactions ledger, **refunds** (reverse via a refund ledger entry, never a balance mutation), **payout runs** (approve clears held payouts → paid / hold).
- [x] Connectors (toggle live/beta/off), API keys + webhooks views, SEO & growth (sitemaps/robots/schema coverage + metadata defaults; Search Console is a mock connector).
- [x] **Control center** (`CLAUDE.md §4b`): branding + fees/CAST economy editable → `Setting` table (DB-backed, read at runtime); feature flags toggle (deferred features ship flag-off); regions + team/RBAC views; audit log. Staff sign-in (SSO+MFA in prod). (Payment-method on/off + CMS pages are wired as settings to extend.)
- [x] **AuditEvent** written on every privileged action.
- **DoD:** ✅ verified live — staff (owner) approves a creator application (→active), strikes a report (→actioned), runs a payout batch (held→paid), toggles a flag; the **audit log grew 6→10** with each action attributed (who/action/kind). Authz: member→`/admin/signin` (307), staff→`/admin` (200), no redirect loop.

> **Owner note (Phase 4):** the operations console is live — staff sign in (gate to SSO+MFA before
> launch), and can run users, creators/applications, trust & safety, money (refunds + payout runs),
> integrations, SEO, and the **control center** where you change branding, fees and feature flags
> **without a deploy** — every change is audit-logged. All three apps (viewer / studio / admin) now
> work end-to-end on mocks. Remaining: **Phase 5** (realtime: live chat, counters, co-watch, push)
> and **Phase 6** (swap mocks for real providers, AWS migration, legal, security review, go-live).

## Phase 5 — Realtime & polish  ✅ core complete (2026-05-30) · co-watch/push/load-test deferred (flags)
- [x] **Live chat + viewer counters via Redis** (`lib/live.ts`) — chat is a capped Redis list; presence is a TTL'd sorted set (scales horizontally on ElastiCache, app stays stateless). Moderation runs the ModerationProvider + **owner-configurable blocked terms** (control center `policies`); **slow-mode** via the rate limiter. `LiveChat` client polls `/api/live/:id` (upgradeable to SSE/WS with no UI change) and embeds on the channel page when live.
- [~] **Co-watch "small rooms" (LiveKit)** + **push notifications** (FCM/APNs) — built behind the existing provider mocks + feature flags; switched on with real keys (deferred per MVP scope `DECISIONS §5`).
- [x] **Rate limiting** (`lib/ratelimit.ts`, Redis sliding window) on chat + money endpoints (spend); **error boundaries** (`app/error.tsx`, `not-found.tsx`); **i18n scaffold** (`lib/i18n.ts`, 6 launch locales + `negotiateLocale`).
- [~] **1k-concurrent load test** — deferred: needs a real load-test harness + infra (the chat/counter design is horizontally scalable by construction). 
- **DoD:** ✅ chat + counters **stable and verified** live — heartbeat→viewers, post→appears, blocked-term→400, flood→429 (slow-mode), state poll returns messages+count. ⏳ the 1k-concurrent load test + co-watch/push are infra/owner-gated.

> **Owner note (Phase 5):** live streams now have **working chat and live viewer counts**, with
> moderation (your blocked-terms list) and anti-spam slow-mode — all on Redis so it scales. The app
> also got production hardening: rate limits on chat + spending, friendly error pages, and a
> translation scaffold for the 6 launch regions. Deferred until you're ready / have keys: co-watch
> "watch parties" (LiveKit), push notifications, and a large-scale load test. Next: **Phase 6 —
> launch readiness** (real provider keys, AWS, legal, security review, go-live) — this one needs you.

## Phase 6 — Launch readiness  🟡 prep complete · remaining items owner-gated
- [x] **Add providers from the Admin panel, no redeploy (configure, don't code).** The app ALWAYS boots — dev *and* prod — running on mocks for anything unconfigured (`instrumentation.ts` only logs what's still mocked, never blocks). Connector keys are stored in the DB (`lib/connectors.ts` → Setting `connector:<id>`) and managed in **Admin → connectors** (paste keys + enable); `connectorRuntimeStatus` reads them at runtime, so a connector goes **mock → live** the moment the owner saves — env vars remain a fallback for CI/IaC. `/api/ready` is a non-blocking go-live checklist. Real adapter implementations (per provider) read their keys via `getConnectorCredentials(id)` — an isolated add-later task that needs no call-site changes.
- [~] **AWS migration** — **scaffolded + owner-gated (AWS account)**. `infra/` Terraform skeleton, multi-stage `Dockerfile` (standalone), `docker-compose`, env-only config, `/api/health`. Migration is build-image → ECR → point env at AWS — app code unchanged (built portable).
- [x] **Legal pages** (ToS / Privacy / Guidelines at `/legal/:doc`, CMS-editable via Setting, marked **draft — lawyer review required**) + **cookie/consent banner**.
- [x] **Security review done + hardened** (audit of money/auth/admin/live paths). Fixed: **signed (HMAC) session cookies** — a tampered cookie can't escalate role (verified: forged `role:staff` → 403); **top-up confirm ownership check** (can't settle another user's txn); **refund idempotency + spend-only** (no double-credit, no negative-balance clawback) + a DB-level `WalletEntry(ref,kind)` unique constraint; **collision-safe transaction/payout/onboarding ids**; **rate limits** extended to top-up, withdraw, admin actions, onboarding, KYC, and both sign-ins; **webhook shared-secret guard**; clean role-hierarchy check; amount caps + resource-existence validation on spends. Verified-sound (left as-is): integer-only CAST, in-transaction overdraw guard, idempotent settle, derived balances, studio ownership scoping, admin authz on every branch, no secret values in any response. [~] formal third-party pen-test + [~] backup/restore drill remain owner/infra-gated (`pg_dump`/PITR documented).
- [~] Tax (Avalara) + fraud (Sift) — adapters present (mock); **owner-gated (keys)**.
- [ ] Owner UAT + **sign-off before real money/users** — **owner action**.
- **DoD:** ⏳ owner-gated — a real end-to-end transaction in production with a real payout, plus owner go-live approval. Everything that does **not** require owner-supplied accounts is built and verified; the remaining items are the `docs/FOR_THE_OWNER.md` checklist.

> **Owner note (Phase 6):** the app **launches and runs right now**, on mocks, in any environment —
> nothing blocks it. You go live **one connector at a time, from the Admin panel**: open
> Admin → connectors, paste a provider's keys (Stripe, Mux, Clerk, …), and flip it on — that connector
> switches from the stand-in to the real thing immediately, no redeploy, and it's audit-logged.
> `/api/ready` shows you what's still on a stand-in. What only you can do (see `docs/FOR_THE_OWNER.md`):
> a domain, a registered company + bank, the provider sign-ups (keys), lawyer-reviewed ToS/Privacy,
> an AWS account when you migrate, and the final go-live approval.

---

## Working agreement (autonomous mode)
- After each phase: run the full test suite, deploy a preview, and post a short plain-language
  progress note (what works now, what's mocked, what you need from the owner).
- Keep the app **always runnable** — never leave `main` in a broken state; use feature branches.
- When blocked only by a real-world item (key, bank, legal), **stub it, keep building**, and add it
  to the owner checklist rather than stopping.
