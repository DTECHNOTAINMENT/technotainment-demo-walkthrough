import { NextResponse } from "next/server";

// Health endpoint for load-balancer / ECS health checks (docs/INFRASTRUCTURE.md §1).
// Checks DB + Redis when configured; in dev (mocks, no services) it still returns 200
// with per-dependency status so the app is always runnable.
export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "skipped" | "error"> = {
    db: "skipped",
    redis: "skipped",
  };

  // DB check — only if a real database is configured.
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/db");
      await prisma.$queryRaw`SELECT 1`;
      checks.db = "ok";
    } catch {
      checks.db = "error";
    }
  }

  // Redis check — only if configured.
  if (process.env.REDIS_URL) {
    try {
      const { pingRedis } = await import("@/lib/redis");
      checks.redis = (await pingRedis()) ? "ok" : "error";
    } catch {
      checks.redis = "error";
    }
  }

  const healthy = !Object.values(checks).includes("error");
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      mode: process.env.LAUNCH_MODE ?? "dev",
      checks,
      ts: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
