/**
 * App session. The signed-in user lives in the `tt_session` cookie (also read by middleware).
 * The cookie value is HMAC-SIGNED (lib/session-token) so it's tamper-evident — a user can't edit
 * their role. In dev the session is set by one-click sign-in from the seeded users; in prod Clerk
 * owns the session behind the same shape. Server-only.
 */
import { cookies } from "next/headers";
import { verifySession, signSession } from "@/lib/session-token";
import type { Session } from "@/lib/integrations";

export const SESSION_COOKIE = "tt_session";

export async function getCurrentSession(): Promise<Session | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parsed = await verifySession<Partial<Session>>(raw);
  if (!parsed?.userId || !parsed.role) return null;
  return parsed as Session;
}

export async function requireSession(): Promise<Session> {
  const s = await getCurrentSession();
  if (!s) throw new SessionError("not signed in");
  return s;
}

// Role hierarchy: staff ⊇ creator ⊇ member (a higher role satisfies a lower requirement).
const RANK: Record<Role, number> = { member: 0, creator: 1, staff: 2 };

export async function requireRole(role: Role): Promise<Session> {
  const s = await requireSession();
  if (RANK[s.role] < RANK[role]) throw new SessionError(`requires ${role}`);
  return s;
}

/** Produce the signed cookie value for a session (await — HMAC sign). */
export async function serializeSession(s: Session): Promise<string> {
  return signSession(s);
}

export class SessionError extends Error {}

type Role = "member" | "creator" | "staff";
