"use client";

/**
 * AdSidebar — the Admin / Operations left-nav, ported from prototype/v4/admin-app.jsx.
 * Client component so it can read the active route via usePathname. Renders the grouped
 * sidebar (sections + icons + the moderation badge) using the prototype's .sidebar / .sb-head
 * / .sb-section / .sb-item classes. The /admin segment is staff-gated in the layout.
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
  { section: null, items: [{ href: "/admin", label: "overview", icon: "grid" }] },
  {
    section: "people",
    items: [
      { href: "/admin/users", label: "users", icon: "users" },
      { href: "/admin/creators", label: "creators", icon: "cast" },
    ],
  },
  {
    section: "trust & money",
    items: [
      { href: "/admin/moderation", label: "moderation", icon: "flame" },
      { href: "/admin/finance", label: "finance", icon: "wallet" },
    ],
  },
  {
    section: "platform",
    items: [
      { href: "/admin/connectors", label: "connectors", icon: "settings" },
      { href: "/admin/growth", label: "seo & growth", icon: "trend" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdSidebar({ narrow = false }: { narrow?: boolean }) {
  const pathname = usePathname() ?? "/admin";
  const settingsActive = isActive(pathname, "/admin/settings");

  if (narrow) {
    return (
      <aside className="sidebar-rail">
        <div style={{ padding: "14px 0 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Link href="/admin" aria-label="admin home" style={{ display: "inline-flex" }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg,#ef4444,#b91c1c)",
                color: "white",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              T
            </span>
          </Link>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
          {NAV.map((grp, gi) => (
            <div key={gi}>
              {grp.section && <div className="sb-divider" />}
              {grp.items.map((it) => {
                const active = isActive(pathname, it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`sb-icon-only${active ? " active" : ""}`}
                    title={it.label}
                  >
                    <Icon name={it.icon} size={20} stroke={active ? 2.4 : 1.8} />
                  </Link>
                );
              })}
            </div>
          ))}
          <div className="sb-divider" />
          <Link
            href="/admin/settings"
            className={`sb-icon-only${settingsActive ? " active" : ""}`}
            title="control center"
          >
            <Icon name="settings" size={20} stroke={settingsActive ? 2.4 : 1.8} />
          </Link>
        </div>
        <Link href="/home" className="sb-icon-only" title="exit admin" style={{ marginBottom: 12 }}>
          <Icon name="chevL" size={20} />
        </Link>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sb-head" style={{ justifyContent: "space-between" }}>
        <Link
          href="/admin"
          aria-label="admin home"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none" }}
        >
          <span
            className="lower"
            style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em", color: "var(--ink-1)" }}
          >
            technotainment
          </span>
        </Link>
        <span className="studio-badge" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
          admin
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {NAV.map((grp, gi) => (
          <div key={gi}>
            {grp.section && <div className="sb-section">{grp.section}</div>}
            {grp.items.map((it) => {
              const active = isActive(pathname, it.href);
              return (
                <Link key={it.href} href={it.href} className={`sb-item${active ? " active" : ""}`}>
                  <Icon name={it.icon} size={18} stroke={active ? 2.4 : 1.8} /> {it.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="sb-divider" />
        <Link href="/admin/settings" className={`sb-item${settingsActive ? " active" : ""}`}>
          <Icon name="settings" size={18} stroke={settingsActive ? 2.4 : 1.8} /> control center
        </Link>
      </div>

      <Link href="/home" className="mode-switch" style={{ marginBottom: 16, textDecoration: "none" }}>
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
          <span className="lower" style={{ display: "block", fontSize: 13, fontWeight: 700 }}>
            exit admin
          </span>
          <span className="lower" style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)" }}>
            back to the app
          </span>
        </span>
      </Link>
    </aside>
  );
}
