/**
 * App session. The signed-in user lives in the `tt_session` cookie (also read by
 * middleware.ts at the edge). In dev this is set by one-click sign-in from the seeded
 * users (AuthProvider.listDevUsers); in prod Clerk owns the session behind the same shape.
 * Server-only.
 */
import { cookies } from "next/headers";
import type { Role, Session } from "@/lib/integrations";

export const SESSION_COOKIE = "tt_session";

export async function getCurrentSession(): Promise<Session | null> {
  const raw = cookies().get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<Session>;
    if (!parsed.userId || !parsed.role) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

/** Require a signed-in user; throws (callers map to redirect / 401). */
export async function requireSession(): Promise<Session> {
  const s = await getCurrentSession();
  if (!s) throw new SessionError("not signed in");
  return s;
}

/** Require a specific role (e.g. staff for admin handlers). */
export async function requireRole(role: Role): Promise<Session> {
  const s = await requireSession();
  if (s.role !== role && !(role === "member")) {
    // creator/staff are supersets of member for member-level actions
    if (!(s.role === "staff")) throw new SessionError(`requires ${role}`);
  }
  return s;
}

export function serializeSession(s: Session): string {
  return encodeURIComponent(JSON.stringify(s));
}

export class SessionError extends Error {}
