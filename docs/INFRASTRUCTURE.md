# Infrastructure & AWS readiness

> **Target:** production will run on **AWS**. Build **cloud-portable from day one** so the move is
> config, not a rewrite. Vercel is fine for fast preview deploys *during the build*, but nothing may
> depend on Vercel-only features. Follow 12-factor; keep everything behind the adapters in
> `docs/INTEGRATIONS.md`.

---

## 1. Portability rules (do these from the first commit)

- **Config only via env vars** (12-factor). No hardcoded URLs/keys. Works identically on Vercel,
  Docker, ECS, Lambda. AWS injects the same vars from **Secrets Manager / SSM Parameter Store**.
- **Stateless app servers.** No local disk for anything that must persist. Sessions, counters,
  rate-limits → **Redis**. Uploads/assets → **object storage behind a `StorageProvider`** (below).
- **No Vercel-proprietary primitives.** Use portable equivalents:
  - storage → **S3-compatible** (R2/S3), not Vercel Blob
  - cache/kv → **standard Redis** (Upstash in dev → ElastiCache on AWS), not Vercel KV
  - cron → a plain `/api/cron/*` route triggered by a scheduler (Vercel Cron in dev →
    **EventBridge** on AWS), not Vercel-only cron logic
  - queues → a `QueueProvider` interface (in-memory mock → **SQS** on AWS)
- **`next.config: { output: "standalone" }`** so the app builds into a self-contained server that
  runs in a container *or* serverless. Avoid features that only work on Vercel's edge runtime.
- **Don't pin to a region or a single AZ** in code; read region/bucket/endpoints from env.
- **Health endpoint** `GET /api/health` (checks DB + Redis) for load-balancer/ECS health checks.
- **Structured JSON logs to stdout** (not files) — works with CloudWatch out of the box.
- **Run DB migrations as a separate step** (not at boot) so it fits ECS task / CI pipelines.

If every one of these holds, deploying to AWS is: build the image, point env at AWS services, ship.

---

## 2. Artifacts to create in Phase 0 (so the repo is AWS-ready immediately)

- [ ] **`Dockerfile`** — multi-stage, builds the Next.js `standalone` output; non-root; `EXPOSE 3000`.
- [ ] **`.dockerignore`** — `node_modules`, `.next/cache`, `.git`, env files.
- [ ] **`next.config.*`** — `output: "standalone"`.
- [ ] **`/api/health`** — returns 200 + DB/Redis status.
- [ ] **`StorageProvider`** adapter — S3 SDK (works with R2 *and* S3 by changing the endpoint env).
- [ ] **`QueueProvider`** + **scheduler** — mock/in-memory now; SQS/EventBridge adapters stubbed.
- [ ] **`infra/`** — a minimal **Terraform** skeleton (see §4) so the AWS target is documented as code.
- [ ] **`docker-compose.yml`** (dev) — Postgres + Redis locally, mirrors the prod service shape.

Doing this in Phase 0 costs little and means there is **never** a painful "make it AWS-compatible"
migration later — you just stand up the AWS resources and flip env vars.

---

## 3. Target AWS architecture (the eventual mapping)

| Concern | Build-time (dev/preview) | AWS production |
|---|---|---|
| App (Next.js) | Vercel **or** `docker compose up` | **ECS Fargate** behind **ALB** (containers), *or* **OpenNext → Lambda + CloudFront** for serverless |
| Database | local Postgres / Neon | **RDS (Aurora) PostgreSQL**, Multi-AZ |
| Cache / sessions / counters | local Redis / Upstash | **ElastiCache for Redis** |
| Object storage | Cloudflare R2 (S3-compatible) | **S3** |
| CDN / edge | Vercel/Cloudflare | **CloudFront** (in front of ALB + S3) |
| Secrets / config | `.env.local` | **Secrets Manager** + **SSM Parameter Store** |
| Background jobs / async | mock queue | **SQS** (+ workers on Fargate) |
| Scheduled tasks | dev cron route | **EventBridge** → the `/api/cron/*` routes |
| Email / SMS | Resend / Twilio | **SES** (email) + Twilio (or **SNS** for SMS) |
| Live video | Mux (mock test stream) | **Mux** *(keep)* or migrate to **AWS IVS** — both behind `VideoProvider` |
| Logs / metrics / alerts | console + Sentry | **CloudWatch** (logs/metrics/alarms) + Sentry |
| Container registry | — | **ECR** |
| DNS / TLS | — | **Route 53** + **ACM** |
| IaC | — | **Terraform** (in `infra/`) |
| CI/CD | GitHub Actions → preview | GitHub Actions → build image → ECR → ECS deploy |

> **Recommended default:** containerize (Docker) and run on **ECS Fargate**. It's the most portable,
> least magic path and keeps Next.js behaving normally. OpenNext-on-Lambda is a valid alternative if
> you prefer pay-per-request serverless — the portability rules in §1 keep *both* doors open, so the
> choice can be made at migration time without code changes.

Because video is already behind `VideoProvider`, switching **Mux → AWS IVS** later (if you want
everything in-house on AWS) is a new adapter file + env keys — no app/UI changes.

---

## 4. Terraform skeleton (`infra/`)

A thin, documented starting point — not a full deploy. Modules to scaffold:
`network` (VPC, subnets, ALB), `data` (RDS, ElastiCache), `storage` (S3 + CloudFront),
`app` (ECR, ECS service/task, autoscaling), `secrets` (Secrets Manager), `dns` (Route 53 + ACM).
Keep state in an **S3 backend + DynamoDB lock**. Variables for region/sizing so it scales from a
cheap single-AZ dev stack to Multi-AZ prod.

---

## 5. Owner-supplied at migration time (not needed during the build)

These go on the `docs/FOR_THE_OWNER.md` checklist; they're only required when you actually move to
AWS: **AWS account** (+ billing), domain in **Route 53** (or delegate DNS), and a decision on
**Mux-vs-IVS** for video. Until then, everything runs on mocks + dev services.

---

**Bottom line for Claude Code:** follow §1 always, produce §2 in Phase 0, and treat §3 as the
destination. Keep Vercel for preview DX if useful, but never let the app *need* it. The result is an
AWS migration that's a deployment exercise, not an engineering project.
