/**
 * Admin / Operations shell — sidebar + topbar wrapper for every /admin/* route.
 * Ported from prototype/v4/admin-app.jsx (grouped sidebar, narrow rail, operations
 * topbar with uptime + theme toggle + OP avatar). Server component. Gates the ENTIRE
 * /admin segment: a staff session is required (docs/ROUTES.md). For a non-staff session
 * it renders children bare so /admin/signin (full-screen) shows without a redirect loop.
 * Wraps children in `.studio-scope` with an explicit ink colour (CLAUDE.md §5) so the
 * console never renders white-on-white. noindex — admin is staff-only.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
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
    <div className="app-shell studio-scope" style={{ color: "var(--ink-1)" }}>
      <AdSidebar />
      <AdSidebar narrow />

      <div className="main-col">
        <header className="topbar theme-fade">
          <div style={{ padding: "0 18px", minHeight: 60, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, whiteSpace: "nowrap" }}>
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
              <span className="lower" style={{ fontSize: 15, fontWeight: 800 }}>
                {s.email}
              </span>
            </div>

            <div style={{ flex: 1 }} />

            <span
              className="studio-badge"
              style={{ borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }}
            >
              <span
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }}
              />{" "}
              99.98% up
            </span>

            <ThemeToggle />
            <AdSignOut />
          </div>
        </header>

        <main className="theme-fade" style={{ minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
