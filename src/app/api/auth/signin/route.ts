import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, serializeSession } from "@/lib/session";
import type { Role, Session } from "@/lib/integrations";

// Dev sign-in: pick a seeded user by id and set the session cookie. In prod Clerk owns
// this flow; the cookie shape stays identical. (docs/INTEGRATIONS.md Auth — mock dev users.)
export async function POST(req: Request) {
  const { userId } = (await req.json().catch(() => ({}))) as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { creator: true } });
  if (!user) return NextResponse.json({ error: "unknown user" }, { status: 404 });

  const role: Role = user.role === "creator" ? "creator" : "member";
  const session: Session = {
    userId: user.id,
    handle: user.handle,
    displayName: user.displayName,
    email: user.email,
    role,
  };
  const res = NextResponse.json({ ok: true, session });
  res.cookies.set(SESSION_COOKIE, serializeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
