import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session-token";

/**
 * Route protection (the real gate — pages trust this).
 * - /admin/signin  → open (staff entry point)
 * - /admin/*       → staff only; non-staff are sent to /admin/signin
 * - /studio, /wallet → any signed-in user (channel-ownership enforced per-route)
 *
 * Session/role is read from the `tt_session` cookie, set by the AuthProvider
 * (mock dev users in dev; Clerk in prod). In prod /admin also asserts SSO + MFA.
 * Every /admin mutation additionally writes an AuditEvent at the handler layer.
 */

type Role = "member" | "creator" | "staff";

async function readRole(req: NextRequest): Promise<Role | null> {
  const raw = req.cookies.get("tt_session")?.value;
  if (!raw) return null;
  // Verify the HMAC signature — a tampered cookie (e.g. role escalated to "staff") fails here.
  const parsed = await verifySession<{ role?: Role }>(raw);
  return parsed?.role ?? null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await readRole(req);

  // Admin sign-in is the staff entry point — always reachable.
  if (pathname === "/admin/signin") return NextResponse.next();

  // Admin segment: staff only.
  if (pathname.startsWith("/admin")) {
    if (role !== "staff") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/signin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Studio + wallet: any signed-in user.
  if ((pathname.startsWith("/studio") || pathname.startsWith("/wallet")) && !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/admin/:path*", "/wallet/:path*"],
};
