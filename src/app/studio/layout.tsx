/**
 * Creator Studio shell — sidebar + topbar wrapper for every /studio/* route.
 * Server component: gates on creator-channel ownership (requireCreatorChannel),
 * redirecting users without a channel to onboarding. Wraps children in
 * `.studio-scope` with an explicit ink colour (CLAUDE.md §5) so the dashboard
 * never renders white-on-white. noindex — Studio is authed.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { requireCreatorChannel } from "@/lib/studio";
import { ThemeToggle } from "@/components/theme";
import { StSidebar } from "@/components/studio/StSidebar";

export const metadata: Metadata = {
  title: "creator studio",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: ReactNode }) {
  let channelName: string | null = null;
  try {
    const { channel } = await requireCreatorChannel();
    channelName = channel.name;
  } catch {
    // No creator channel yet: render children bare (no shell). The onboarding page renders
    // full-screen, and every gated page self-redirects to /studio/onboarding — so the layout
    // must NOT redirect here, or /studio/onboarding (which is under this layout) would loop.
  }
  if (!channelName) return <>{children}</>;

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
      <StSidebar />

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
                color: "var(--ink-4)",
              }}
            >
              creator studio
            </span>
            <span
              className="lower"
              style={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {channelName}
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
        </header>

        <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
