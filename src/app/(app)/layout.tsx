import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/session";
import { balanceOf } from "@/lib/money";
import { formatCast } from "@/lib/cast";
import { ThemeToggle } from "@/components/theme";
import { NavLinks, type NavItem } from "@/components/app/NavLinks";
import { BottomNav } from "@/components/app/BottomNav";
import { SignOutButton } from "@/components/app/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const balance = await balanceOf(session.userId);

  const nav: NavItem[] = [
    { href: "/home", label: "home" },
    { href: "/following", label: "following" },
    { href: "/library", label: "library" },
    { href: "/wallet", label: "wallet" },
    { href: "/notifications", label: "notifications" },
    { href: "/settings", label: "settings" },
    { href: "/profile", label: "profile" },
  ];
  if (session.role === "creator") nav.push({ href: "/studio", label: "creator studio" });
  if (session.role === "staff") nav.push({ href: "/admin", label: "operations" });

  const bottomNav: NavItem[] = [
    { href: "/home", label: "home" },
    { href: "/following", label: "following" },
    { href: "/library", label: "library" },
    { href: "/wallet", label: "wallet" },
    { href: "/profile", label: "profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* top bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <Link
          href="/home"
          className="lower"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em" }}
        >
          <span
            aria-hidden
            style={{ width: 22, height: 22, borderRadius: 7, background: "var(--brand-gradient)", flex: "0 0 22px" }}
          />
          <span className="brand-grad-text">technotainment</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/wallet" className="cast-pill" aria-label="wallet balance">
          <span className="cast-glyph">C</span>
          <span className="tnum">{formatCast(balance)}</span>
        </Link>
        <ThemeToggle />
        <SignOutButton />
      </header>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* desktop sidebar */}
        <aside
          className="tt-sidebar"
          style={{
            width: 244,
            flex: "0 0 244px",
            padding: "18px 14px",
            borderRight: "1px solid var(--hairline)",
            position: "sticky",
            top: 61,
            height: "calc(100vh - 61px)",
            overflowY: "auto",
          }}
        >
          <div
            className="lower"
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--ink-4)",
              padding: "0 14px 8px",
            }}
          >
            you
          </div>
          <NavLinks items={nav} />
        </aside>

        {/* main column */}
        <main style={{ flex: 1, minWidth: 0, padding: "20px 18px 96px" }}>{children}</main>
      </div>

      {/* mobile bottom nav */}
      <div className="tt-bottomnav">
        <BottomNav items={bottomNav} />
      </div>

      {/* responsive: hide sidebar on small, hide bottom-nav on large */}
      <style>{`
        @media (max-width: 860px) { .tt-sidebar { display: none; } }
        @media (min-width: 861px) { .tt-bottomnav { display: none; } }
      `}</style>
    </div>
  );
}
