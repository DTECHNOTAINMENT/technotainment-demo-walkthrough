# Technotainment — Metascape

Creator live-streaming + VOD platform built around **CAST**, a closed-loop platform credit
(**100 CAST = £1.00**). Fans watch live & on-demand and spend CAST on memberships, tips, drops,
PPV and gifts. Creators run a **Studio**; staff run an **Admin/Operations** console.

This repo is being built from the design handoff into a **production Next.js app**, phase by
phase per `docs/BUILD_PLAN.md`. The original interactive prototype (the product spec) is preserved
under [`prototype/`](./prototype/).

> **Status: Phase 0 — Foundation & scaffold.** See progress at the bottom of `docs/BUILD_PLAN.md`.

## Stack (locked — `docs/DECISIONS.md §1`)

Next.js (App Router) + TypeScript · PostgreSQL/Prisma · Redis · Tailwind (tokens ported from the
prototype's `theme.css`) · mock-first integrations (Stripe, Mux, Clerk, Persona, …) · Docker /
ECS-Fargate target, AWS-portable from day one.

## Conventions

- **Money is integer CAST** — never floats; convert to fiat only at the edge (`src/lib/cast.ts`).
- **Balance is a derived, append-only ledger** (`src/lib/ledger.ts` → `WalletEntry`), never a
  mutable number.
- **Configure, don't code** — owner-changeable values are DB-backed Admin settings, not literals
  (`CLAUDE.md §4b`). Phase 0 seeds defaults in `src/lib/config.ts`.
- **Mock-first integrations** — every external service sits behind an interface with a mock
  (`src/lib/integrations/*`); real providers swap in by setting one env var
  (`docs/INTEGRATIONS.md`). The app always boots and demos with zero real accounts.
- **AWS-portable** — config via env only, stateless app, `output: "standalone"`
  (`docs/INFRASTRUCTURE.md`).

## Review it through a link

**A. The code + verified build** — open the pull request: the diff, per-phase Definition-of-Done
checks in `docs/BUILD_PLAN.md`, and the file tree. No setup.

**B. Click through the running app (live preview)** — one-time Vercel deploy (the app needs a DB):
1. Import this repo at [vercel.com/new](https://vercel.com/new).
2. Add two free integrations from the Vercel dashboard → Storage/Integrations: **Neon** (Postgres,
   sets `DATABASE_URL`) and **Upstash** (Redis, sets `REDIS_URL`). Optionally set `SESSION_SECRET`
   (any 32+ char string) and `APP_URL` (your Vercel URL).
3. Deploy. The build (`npm run vercel-build`) runs the migrations and seeds demo data automatically,
   so the preview opens fully populated. Everything runs on mocks — no provider keys needed.
   - Sign in: `/sign-in` (one-click seeded users) · Studio: a creator account → `/studio` ·
     Admin: `/admin/signin`.

**C. Instant visual of the original prototype** — enable Pages once (repo Settings → Pages → Source
= "GitHub Actions"); the `deploy-prototype-pages` workflow publishes `prototype/` to
`https://dtechnotainment.github.io/technotainment-demo-walkthrough/`. (This is the design spec; the
production app above is the real build.)

## Run it locally

```bash
npm install
cp .env.example .env.local        # all blank keys → app runs on mocks
npm run dev                        # http://localhost:3000
```

With local services (Postgres + Redis):

```bash
docker compose up db redis -d
# set DATABASE_URL / REDIS_URL in .env.local (see docker-compose.yml)
npx prisma migrate dev             # apply schema
npm run db:seed                    # load the prototype fixtures
npm run dev
```

Full container parity (proves AWS-portability):

```bash
docker compose up --build          # app + db + redis; GET /api/health → 200
```

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | `prisma generate` + production build (`standalone`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `next lint` |
| `npm test` | Vitest unit tests (money + ledger paths) |
| `npm run db:seed` | seed DB from prototype fixtures |

## Layout

```
src/app/            App Router routes (+ /api/health)
src/components/      shared UI (theme provider/toggle)
src/lib/            config, cast money helpers, CAST ledger, db, redis, observability
src/lib/integrations/  ports & adapters — one folder per external service (mock + real)
prisma/             schema.prisma (from docs/DATA_MODEL.md) + seed.ts (from fixtures)
infra/              Terraform skeleton for the AWS target
docs/               the build directions (READINESS, DECISIONS, BUILD_PLAN, TEAM, …)
prototype/          the original interactive prototype (product spec) + earlier iterations
CLAUDE.md           standing brief — read first
```

## Docs (read in this order)

`docs/READINESS.md` → `CLAUDE.md` → `docs/DECISIONS.md` → `docs/BUILD_PLAN.md` → `docs/TEAM.md` →
`docs/INTEGRATIONS.md` → `docs/INFRASTRUCTURE.md` → `HANDOFF.md` → `docs/DATA_MODEL.md` →
`docs/ROUTES.md` → `.env.example`.
