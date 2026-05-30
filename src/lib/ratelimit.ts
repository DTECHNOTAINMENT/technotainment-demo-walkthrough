/**
 * Redis-backed sliding-window rate limiter (docs/BUILD_PLAN.md Phase 5). Portable: standard
 * Redis (Upstash → ElastiCache). Degrades open if Redis isn't configured so the app still boots.
 */
import { getRedis } from "@/lib/redis";

export interface RateResult {
  ok: boolean;
  remaining: number;
  limit: number;
}

/**
 * Allow `limit` actions per `windowSec` for `key`. Uses a sorted set of timestamps.
 * Fails open (ok:true) when Redis is unavailable.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateResult> {
  const redis = getRedis();
  if (!redis) return { ok: true, remaining: limit, limit };

  const now = Date.now();
  const windowMs = windowSec * 1000;
  const member = `${now}-${Math.random().toString(36).slice(2)}`;
  const rkey = `rl:${key}`;
  try {
    const pipe = redis.multi();
    pipe.zremrangebyscore(rkey, 0, now - windowMs);
    pipe.zadd(rkey, now, member);
    pipe.zcard(rkey);
    pipe.pexpire(rkey, windowMs);
    const res = await pipe.exec();
    const count = (res?.[2]?.[1] as number) ?? 1;
    const remaining = Math.max(0, limit - count);
    return { ok: count <= limit, remaining, limit };
  } catch {
    return { ok: true, remaining: limit, limit }; // fail open
  }
}
