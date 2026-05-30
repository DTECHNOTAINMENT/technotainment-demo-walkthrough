# CLAUDE.md — Technotainment

> **Read this first.** It is the standing brief for anyone (human or Claude Code) building
> the production app. The interactive prototype in `/` is the **product spec**; this repo
> turns it into a real, shippable system. When in doubt, the prototype's behaviour wins for
> product/UX questions; this file wins for architecture/convention questions.

---

## 1. What we're building

**Technotainment** is a creator live-streaming + VOD platform (product surface: *Metascape*).
Fans watch live & on-demand, follow creators, and spend **CAST** — a closed-loop platform
credit (**100 CAST = £1.00**) — on memberships, tips, drops, PPV and gifts. Creators run a
**Studio** (go live, upload, sell, get paid). Staff run an **Admin/Operations** console
(users, money, trust & safety, integrations, SEO).

Three apps, one codebase:

| App | Audience | Prototype files |
|---|---|---|
| **Viewer** | fans | `app.jsx`, `sidebar.jsx`, `home/live/microcast/wallet/profile/search` |
| **Creator Studio** | creators | `studio-*.jsx` |
| **Admin / Operations** | staff | `admin-*.jsx` |

---

## 1b. Operating autonomously (read this)

The owner is **non-technical** and expects you to build with minimal back-and-forth.

- **Decide, don't block.** All technical/product choices are pre-authorized in
  `docs/DECISIONS.md`. Follow them. If something isn't covered, pick the simplest standard,
  reversible option, record it under "Added by Claude Code", and continue.
- **Only pause for real-world items** (domain, bank, provider keys, legal, go-live approval) —
  the list is `DECISIONS.md §4` / `docs/FOR_THE_OWNER.md`. When blocked only by one of those,
  **stub it with a mock and keep building**; add it to the owner checklist.
- **Always runnable.** Every integration sits behind an interface with a mock implementation so
  the app boots and demos before real keys exist (the full pattern is `docs/INTEGRATIONS.md`).
  Real providers are required only at launch (`LAUNCH_MODE=prod`). Never leave `main` broken; use branches.
- **Self-verify.** Work the phases in `docs/BUILD_PLAN.md`; don't advance past a phase until its
  Definition of Done is met and tests are green. After each phase, deploy a Vercel preview and post
  a short **plain-language** progress note (what works, what's mocked, what you need from the owner).
- **Money & auth need tests.** Write a test for every CAST path and every permission boundary.
- **Work like a product team, not a lone coder.** For each feature, move through the roles in
  `docs/TEAM.md` — Product Owner → UX → Frontend → Backend → **QA** → Security → Release — wearing
  one hat at a time. The **QA pass is mandatory after every feature**: verify against acceptance
  criteria, write the tests, try to break it, and post a short QA report with suggestions. Don't
  skip the review hats.

## 2. The prototype (what exists today)

- One file `Metascape v4.html` loads ~37 `.jsx` modules via in-browser Babel. **This is a
  prototype technique, not the production stack.**
- React 18 UMD, no bundler, no types. Modules are IIFEs that hang singletons off `window`.
- All data is **fixtures** (`data.jsx`, `studio-shared.jsx`, `admin-shared.jsx`). All writes
  are local React state or toasts. Payments/streaming are simulated.
- Styling: `theme.css` (dark-first design tokens) + `studio.css` (additive). Theme via
  `<html data-theme="dark|light">`.

**Do not ship the prototype.** Rebuild it as below; mine it for layout, copy, flows and shapes.

---

## 3. Target production stack

- **Next.js (App Router) + TypeScript** — non-negotiable: public pages must SSR/ISR for SEO (§7 of `HANDOFF.md`).
- **React Server Components** for public read paths; client components for Studio/Admin dashboards.
- **Styling**: port `theme.css` tokens verbatim into CSS variables (keep the dark-first +
  `data-theme` model). Tailwind optional, but the token names must survive.
- **Data**: PostgreSQL + Prisma (or Drizzle). Redis for sessions/rate-limit/live counters.
- **API**: REST or tRPC — contract in `docs/DATA_MODEL.md`. Webhooks for every async provider.
- **Auth**: WorkOS/Auth0/Clerk. Viewer social login; **staff SSO + RBAC + enforced MFA** for Admin.
- **Media**: Mux or AWS IVS (live ingest/transcode/VOD); Cloudflare CDN/edge; LiveKit/Agora for
  the co-watch "small rooms".
- **Payments**: Stripe + Adyen, Apple/Google Pay, PayPal/Venmo, Circle (USDC); payouts via
  Stripe Connect / Tipalti / Trolley. See `docs/DATA_MODEL.md → Payments` and `.env.example`.

---

## 4. Repo conventions

- **Money is integer CAST.** Never floats. `100 CAST = £1.00`. Convert to fiat only at the
  presentation/payout edge. Store balances as a ledger, not a mutable number (§Payments).
- **CAST is a float liability** — issued balances are money we owe. Treat the ledger as
  append-only and reconcilable.
- **Lowercase UI voice.** The product uses lowercase labels and `tnum`/mono for numbers — keep it.
- **Three render tiers:** public (SSR/ISR, SEO-critical) · authed app (CSR/RSC mix) ·
  dashboards (client). See `docs/ROUTES.md`.
- **Every privileged action is audit-logged** (Admin `AUDIT`). Build the audit trail as
  infrastructure, not a feature.
- **Consent-scoped data.** Audience/analytics only expose what a viewer consented to
  (`profile.jsx` consent model); deletion within 7 days of withdrawal.
- **Feature flags** gate rollouts (Admin `FLAGS`). Wire a real flag service (LaunchDarkly/Statsig).

---

## 4b. Configure, don't code — the owner runs the platform from Admin

**Principle:** anything an owner might reasonably want to change must be **editable in the Admin
control center**, persisted in the DB, read at runtime — *never* hardcoded. The prototype's
Admin → **control center** (`admin-settings.jsx` + `admin-controls.jsx`) is the spec for what must
be owner-configurable. Before hardcoding any value the owner might change, stop and make it a
setting. The non-technical owner builds the business by toggles, not tickets.

Build each of these as real, persisted, audit-logged config (defaults seeded from the prototype):

- **Branding** — app/company name, currency name, tagline, logo, brand colours, default theme.
  Served by a DB-backed config/theme provider so a rename or recolour needs no deploy.
- **Fees & CAST economy** — take-rate (global + per-creator), exchange rate, min top-up, payout
  hold, min payout. Read from config on every money calculation, never literals.
- **Payment methods** — per-rail on/off for top-up *and* payout. A method shows only if its flag is
  on **and** its connector is configured (`docs/INTEGRATIONS.md`).
- **Policies** — age limits, strike count + escalation, blocked terms, community-guidelines text,
  auto-hold, default chat mode. Moderation/age logic reads these.
- **Pages & content** — Terms/Privacy/Guidelines/Help/marketing as CMS records; categories; system
  announcement banner. Public pages render from these records.
- **Feature flags = the roadmap.** Deferred features (native apps, courses, BNPL, extra regions,
  referrals, blog/CMS, co-watch, instant payouts, USDC…) ship **built but flag-off**. Gate each
  behind its flag from the start, so "add it later" is an Admin toggle, not a code change.
- **Connectors, team/RBAC, regions** — same rule; already configurable surfaces.

Every change here writes an **AuditEvent** and takes effect **without a deploy**. When in doubt:
**make it a setting.**

---

## 5. Design system (port these tokens)

Source of truth: `theme.css`. Key tokens: `--bg`, `--surface[-2/-3]`, `--ink-1..4`,
`--hairline[-2]`, `--brand-gradient` (cyan→blue→violet→magenta), `--live-gradient`.
Both themes defined under `:root` (dark) and `html[data-theme="light"]`.

Reusable primitives to promote into a component library (currently in `studio-shared.jsx`):
`StatCard`, `StudioCard`, `StudioPageHead`, `Pill` (tones: neutral/ok/warn/live/info),
`Seg` (tabs), charts (`Bars`, `AreaSpark`, `SegBar`, `Spark`), `MethodRow`/`PayBrand`
(`payments.jsx`). CSS utilities: `.stat-num`, `.tg` (toggle), `.st-row`, `.copy-field`,
`.meter`, `.dropzone`, `.sb-head` (unified header strip), `.onair`.

⚠️ The app is **dark-first**; base text is white. Any component that doesn't set an explicit
colour must inherit `--ink-1` (we scope `.studio-scope { color: var(--ink-1) }`). Watch for
white-on-white in light theme when porting.

---

## 6. Build order (suggested)

1. **Foundation** — Next.js, design tokens, auth, DB schema from `docs/DATA_MODEL.md`, CAST ledger.
2. **Public + SEO** — channel `/c/:handle`, watch `/watch/:slug`, clip, explore, live index;
   SSR + schema.org + sitemaps + OG. (Highest growth leverage — see `HANDOFF.md §7`.)
3. **Viewer app** — auth, wallet + top-up (Stripe/Apple/Google Pay), memberships, follow.
4. **Creator Studio** — channel, upload (Mux), go-live, memberships, store, earnings/payouts, analytics.
5. **Admin** — users, creators/KYC, moderation, finance/payout-runs, connectors, SEO, settings, RBAC.
6. **Realtime** — chat, live counters, co-watch rooms.

---

## 7. Where to find things

- `docs/FOR_THE_OWNER.md` — plain-language guide for the non-technical owner + the "only you can do" setup checklist.
- `docs/DECISIONS.md` — **pre-authorized** tech + product/business defaults. Don't re-ask these.
- `docs/BUILD_PLAN.md` — phased milestones with a Definition of Done per phase. Work top to bottom.
- `docs/TEAM.md` — **operating model**: act as a full product team (PO/UX/frontend/backend/QA/security) per feature; mandatory QA pass + report after each one.
- `docs/INTEGRATIONS.md` — **the adapter pattern**: build every connector (video, payments, …) behind an interface with a mock; real providers required only at launch. Read before wiring any external service.
- `docs/INFRASTRUCTURE.md` — **AWS is the production target.** Build cloud-portable (12-factor, Docker, S3-compatible storage, standard Redis) from Phase 0 so migration is config, not a rewrite.
- `HANDOFF.md` — narrative handoff: architecture, file map, payments model, SEO requirements.
- `docs/DATA_MODEL.md` — entities, relationships, REST API contract (grounded in the fixtures).
- `docs/ROUTES.md` — full URL map + per-route rendering strategy + SEO metadata.
- `.env.example` — every integration key & config var, grouped by domain.
- `v4/*.jsx` — the screens. **The JSX is the spec** — open the relevant file for any screen.
- Prototype state keys (localStorage, `metascape-v4-*` / `metascape-studio-*` /
  `metascape-admin-*`) are listed in `HANDOFF.md §4`.

---

## 8. Prototype shortcuts to replace (don't ship these)

- Fixtures instead of a DB; toasts instead of writes; simulated 3DS/streaming timers.
- Admin entry is open via Profile **for demo** — gate to staff SSO/RBAC in prod.
- The demo Studio uses seeded creator **Nyx Okafor**; real onboarding mints a fresh empty channel.
- No tests, no error boundaries, no rate limiting, no i18n yet — all required for prod.
