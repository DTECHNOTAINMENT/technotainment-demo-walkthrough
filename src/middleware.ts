import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection. Gates the authed app, Studio, and Admin segments.
 * - /studio  → any signed-in user (channel-ownership enforced per-route in Phase 3)
 * - /admin   → staff only; in prod this also asserts SSO + MFA (docs/ROUTES.md).
 *
 * Session/role is read from the `tt_session` cookie, which the AuthProvider sets
 * (mock dev users in dev; Clerk in prod — src/lib/integrations/auth). This stays
 * decoupled so middleware runs on the edge without importing provider SDKs.
 * Every /admin mutation additionally writes an AuditEvent at the handler layer.
 */

type Role = "member" | "creator" | "staff";

function readRole(req: NextRequest): Role | null {
  const raw = req.cookies.get("tt_session")?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { role?: Role };
    return parsed.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = readRole(req);

  const needsAuth = pathname.startsWith("/studio") || pathname.startsWith("/admin") || pathname.startsWith("/wallet");
  if (needsAuth && !role) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "staff") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "staff-only");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/admin/:path*", "/wallet/:path*"],
};
