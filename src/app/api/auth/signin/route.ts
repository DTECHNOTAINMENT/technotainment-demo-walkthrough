import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, serializeSession } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { demoSessionFor } from "@/lib/fixtures";
import type { Role, Session } from "@/lib/integrations";

// Dev sign-in: pick a seeded user by id and set the session cookie. In prod Clerk owns
// this flow; the cookie shape stays identical. (docs/INTEGRATIONS.md Auth — mock dev users.)
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = await rateLimit(`signin:${ip}`, 20, 60);
  if (!rl.ok) return NextResponse.json({ error: "too many attempts, slow down" }, { status: 429 });

  const { userId } = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  let session: Session | null = null;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { creator: true } });
    if (user) {
      const role: Role = user.role === "creator" ? "creator" : "member";
      session = { userId: user.id, handle: user.handle, displayName: user.displayName, email: user.email, role };
    }
  } catch {
    /* no DB → demo fallback below */
  }
  // No-DB demo fallback: accept a known demo identity so the walkthrough works with zero database.
  if (!session) {
    const demo = demoSessionFor(userId);
    if (demo) session = demo as Session;
  }
  if (!session) return NextResponse.json({ error: "unknown user" }, { status: 404 });

  const res = NextResponse.json({ ok: true, session });
  res.cookies.set(SESSION_COOKIE, await serializeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
