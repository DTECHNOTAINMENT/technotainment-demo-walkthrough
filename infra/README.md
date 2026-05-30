# infra/ — AWS target (Terraform skeleton)

A thin, documented starting point — **not** a full deploy. It records the production AWS
architecture as code so migration is a deployment exercise, not an engineering project
(see `docs/INFRASTRUCTURE.md` §3/§4). Nothing here runs during the build; the app runs on
mocks + local dev services until the owner provisions AWS.

## Modules (to flesh out at migration time)

| Module | Resources |
|---|---|
| `network` | VPC, public/private subnets, ALB, security groups |
| `data` | RDS (Aurora PostgreSQL, Multi-AZ), ElastiCache for Redis |
| `storage` | S3 buckets + CloudFront distribution |
| `app` | ECR repo, ECS Fargate service/task, autoscaling |
| `secrets` | Secrets Manager + SSM Parameter Store entries |
| `dns` | Route 53 zone + ACM certificate |

State backend: **S3 + DynamoDB lock**. Variables drive region/sizing so the same code
scales from a cheap single-AZ dev stack to Multi-AZ prod.

## Mapping (dev → AWS)

| Concern | Dev/preview | AWS prod |
|---|---|---|
| App | `docker compose` / Vercel | ECS Fargate behind ALB |
| DB | local Postgres | RDS Aurora PostgreSQL |
| Cache | local Redis | ElastiCache |
| Storage | R2 (S3-compatible) | S3 |
| CDN | Cloudflare/Vercel | CloudFront |
| Secrets | `.env.local` | Secrets Manager / SSM |
| Queue | in-memory mock | SQS |
| Cron | `/api/cron/*` dev trigger | EventBridge → `/api/cron/*` |

> Because every external service sits behind an adapter (`docs/INTEGRATIONS.md`) and config is
> env-only, switching to AWS is: build the image → push to ECR → point env at AWS services → ship.
