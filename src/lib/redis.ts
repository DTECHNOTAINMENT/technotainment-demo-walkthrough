/**
 * Redis access for sessions, live counters, and rate-limits (docs/INFRASTRUCTURE.md §1).
 * Portable: standard Redis (Upstash in dev → ElastiCache on AWS), never Vercel KV.
 * Lazily connects only when REDIS_URL is set, so the app still boots on mocks without it.
 */
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

export function getRedis(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;
  if (!process.env.REDIS_URL) {
    globalForRedis.redis = null;
    return null;
  }
  const client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  // Don't crash the process on a transient connection error; health surfaces status.
  client.on("error", () => {});
  globalForRedis.redis = client;
  return client;
}

export async function pingRedis(): Promise<boolean> {
  const c = getRedis();
  if (!c) return false;
  try {
    if (c.status !== "ready" && c.status !== "connecting") await c.connect();
    return (await c.ping()) === "PONG";
  } catch {
    return false;
  }
}
