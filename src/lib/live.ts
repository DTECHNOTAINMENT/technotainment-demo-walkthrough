/**
 * Live chat + viewer counters (docs/BUILD_PLAN.md Phase 5). Backed by Redis so it scales
 * horizontally (ElastiCache in prod) and the app stays stateless. Chat is ephemeral (a capped
 * Redis list); viewer presence is a TTL'd set heartbeated by clients. Messages run through the
 * ModerationProvider + owner-configurable blocked terms + slow-mode (CLAUDE.md §4b).
 */
import { getRedis } from "@/lib/redis";
import { moderation } from "@/lib/integrations";
import { getSetting } from "@/lib/admin";

const CHAT_CAP = 100; // keep the last N messages
const PRESENCE_TTL = 30; // seconds; clients heartbeat well within this

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  at: number;
}

export class LiveError extends Error {}

function chatKey(streamId: string) {
  return `chat:${streamId}`;
}
function presenceKey(streamId: string) {
  return `viewers:${streamId}`;
}

export async function postChat(
  streamId: string,
  input: { user: string; text: string },
): Promise<ChatMessage> {
  const redis = getRedis();
  if (!redis) throw new LiveError("live chat unavailable (no redis)");

  const text = input.text.trim().slice(0, 280);
  if (!text) throw new LiveError("empty message");

  // Owner-configurable blocked terms (control center) + AI moderation (mock passes).
  const policy = await getSetting<{ blockedTerms?: string[]; slowModeSec?: number }>("policies", {});
  const blocked = (policy.blockedTerms ?? []).map((t) => t.toLowerCase());
  if (blocked.some((t) => t && text.toLowerCase().includes(t))) {
    throw new LiveError("message blocked by community guidelines");
  }
  const verdict = await moderation
    .check({ kind: "text", content: text })
    .catch(() => ({ verdict: "pass" as const }));
  if (verdict.verdict !== "pass") throw new LiveError("message held for review");

  const msg: ChatMessage = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    user: input.user,
    text,
    at: Date.now(),
  };
  await redis.lpush(chatKey(streamId), JSON.stringify(msg));
  await redis.ltrim(chatKey(streamId), 0, CHAT_CAP - 1);
  await redis.expire(chatKey(streamId), 60 * 60 * 6); // chat history lives 6h
  return msg;
}

export async function recentChat(streamId: string, limit = 50): Promise<ChatMessage[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange(chatKey(streamId), 0, limit - 1);
  return raw
    .map((r) => {
      try {
        return JSON.parse(r) as ChatMessage;
      } catch {
        return null;
      }
    })
    .filter((m): m is ChatMessage => !!m)
    .reverse();
}

/** Record a viewer heartbeat and return the current live count. */
export async function heartbeat(streamId: string, viewerId: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const now = Date.now();
  const pkey = presenceKey(streamId);
  await redis.zadd(pkey, now, viewerId);
  await redis.zremrangebyscore(pkey, 0, now - PRESENCE_TTL * 1000);
  await redis.expire(pkey, PRESENCE_TTL * 2);
  return redis.zcard(pkey);
}

export async function viewerCount(streamId: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  const pkey = presenceKey(streamId);
  await redis.zremrangebyscore(pkey, 0, Date.now() - PRESENCE_TTL * 1000);
  return redis.zcard(pkey);
}
