"use client";

/**
 * StSidebar — the Creator Studio left-nav, ported to match prototype/v4/studio-app.jsx:
 * logo + "technotainment" + studio badge header (`.sb-head` / `.studio-badge`), grouped nav
 * with per-item icons and section labels (`.sb-item` / `.sb-section`), and an "exit studio"
 * mode-switch pinned to the bottom (`.mode-switch`). Client component so it can read the
 * active route via usePathname. Active state highlights the current segment.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}
interface NavGroup {
  section: string | null;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  { section: null, items: [{ href: "/studio", label: "dashboard", icon: "grid" }] },
  {
    section: "create",
    items: [
      { href: "/studio/live", label: "go live", icon: "flame" },
      { href: "/studio/content", label: "content", icon: "film" },
      { href: "/studio/store", label: "store", icon: "bag" },
    ],
  },
  {
    section: "grow",
    items: [
      { href: "/studio/audience", label: "audience", icon: "users" },
      { href: "/studio/memberships", label: "memberships", icon: "heart" },
      { href: "/studio/analytics", label: "analytics", icon: "trend" },
    ],
  },
  {
    section: "money",
    items: [{ href: "/studio/earnings", label: "earnings", icon: "wallet" }],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/studio") return pathname === "/studio";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StSidebar() {
  const pathname = usePathname() ?? "/studio";
  const settingsActive = isActive(pathname, "/studio/settings");

  return (
    <aside
      style={{
        width: 240,
        flex: "0 0 240px",
        borderRight: "1px solid var(--hairline)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <div className="sb-head" style={{ justifyContent: "space-between" }}>
        <Link
          href="/studio"
          aria-label="studio home"
          className="lower"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            textDecoration: "none",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "-0.03em",
            color: "var(--ink-1)",
          }}
        >
          technotainment
        </Link>
        <span className="studio-badge">studio</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {NAV.map((grp, gi) => (
          <div key={gi}>
            {grp.section && <div className="sb-section">{grp.section}</div>}
            {grp.items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link key={it.href} href={it.href} className={`sb-item ${active ? "active" : ""}`}>
                  <Icon name={it.icon} size={18} stroke={active ? 2.4 : 1.8} /> {it.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="sb-divider" />
        <Link href="/studio/settings" className={`sb-item ${settingsActive ? "active" : ""}`}>
          <Icon name="settings" size={18} stroke={settingsActive ? 2.4 : 1.8} /> settings
        </Link>
      </div>

      <Link href="/home" className="mode-switch lower" style={{ marginBottom: 16, textDecoration: "none" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "var(--surface-2)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 34px",
          }}
        >
          <Icon name="eye" size={16} stroke={2.2} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>exit studio</span>
          <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)" }}>back to watching</span>
        </span>
      </Link>
    </aside>
  );
}
