import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, serializeSession } from "@/lib/session";
import type { Session } from "@/lib/integrations";

// Dev staff sign-in: assume a seeded AdminUser → staff session. In prod this is SSO + enforced
// MFA (docs/ROUTES.md). The /admin segment is gated to role "staff" by middleware.
export async function POST(req: Request) {
  const { adminUserId } = (await req.json().catch(() => ({}))) as { adminUserId?: string };
  if (!adminUserId) return NextResponse.json({ error: "adminUserId required" }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { id: adminUserId } });
  if (!admin) return NextResponse.json({ error: "unknown staff" }, { status: 404 });

  const session: Session = {
    userId: admin.id,
    handle: admin.email,
    displayName: admin.name,
    email: admin.email,
    role: "staff",
  };
  const res = NextResponse.json({ ok: true, session, adminRole: admin.role });
  res.cookies.set(SESSION_COOKIE, serializeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
