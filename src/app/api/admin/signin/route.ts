import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, serializeSession } from "@/lib/session";
import { rateLimit } from "@/lib/ratelimit";
import { demoAdminSessionFor, DEMO_ADMINS } from "@/lib/fixtures";
import type { Session } from "@/lib/integrations";

// Dev staff sign-in: assume a seeded AdminUser → staff session. In prod this is SSO + enforced
// MFA (docs/ROUTES.md). The /admin segment is gated to role "staff" by middleware.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = await rateLimit(`admin-signin:${ip}`, 15, 60);
  if (!rl.ok) return NextResponse.json({ error: "too many attempts, slow down" }, { status: 429 });

  const { adminUserId } = (await req.json().catch(() => ({}))) as { adminUserId?: string };
  if (!adminUserId) return NextResponse.json({ error: "adminUserId required" }, { status: 400 });

  let session: Session | null = null;
  let adminRole: string | undefined;
  try {
    const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
    if (admin) {
      session = { userId: admin.id, handle: admin.email, displayName: admin.name, email: admin.email, role: "staff" };
      adminRole = admin.role;
    }
  } catch {
    /* no DB → demo fallback below */
  }
  if (!session) {
    const demo = demoAdminSessionFor(adminUserId);
    if (demo) {
      session = demo as Session;
      adminRole = DEMO_ADMINS.find((a) => a.id === adminUserId)?.role;
    }
  }
  if (!session) return NextResponse.json({ error: "unknown staff" }, { status: 404 });

  const res = NextResponse.json({ ok: true, session, adminRole });
  res.cookies.set(SESSION_COOKIE, await serializeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
