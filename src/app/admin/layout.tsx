/**
 * Admin / Operations shell — sidebar + topbar wrapper for every /admin/* route.
 * Server component. Gates the ENTIRE /admin segment: a staff session is required
 * (docs/ROUTES.md — "staff session + RBAC + MFA; every mutation writes an
 * AuditEvent"). In this demo the gate is a role check; in prod it hardens to
 * SSO + MFA assertion in middleware. Wraps children in `.studio-scope` with an
 * explicit ink colour (CLAUDE.md §5) so the console never renders white-on-white.
 * noindex — admin is staff-only.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme";
import { AdSidebar } from "@/components/admin/AdSidebar";
import { AdSignOut } from "@/components/admin/AdSignOut";

export const metadata: Metadata = {
  title: "operations · technotainment",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const s = await getCurrentSession();
  // Not staff → render children bare (no shell). The /admin/signin page renders full-screen,
  // and gated pages live under this layout; redirecting here would loop on /admin/signin itself.
  if (!s || s.role !== "staff") return <>{children}</>;

  return (
    <div
      className="studio-scope"
      style={{
        color: "var(--ink-1)",
        background: "var(--bg, var(--surface-2))",
        minHeight: "100vh",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <AdSidebar />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 20px",
            minHeight: 60,
            borderBottom: "1px solid var(--hairline)",
            background: "var(--surface)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#ef4444",
              }}
            >
              operations
            </span>
            <span
              className="lower tnum"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ink-3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.email}
            </span>
          </div>

          <div style={{ flex: 1 }} />

          <Link
            href="/home"
            className="btn btn-glass lower"
            style={{ padding: "9px 14px", fontSize: 13, textDecoration: "none" }}
          >
            back to app
          </Link>

          <ThemeToggle />
          <AdSignOut />
        </header>

        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
