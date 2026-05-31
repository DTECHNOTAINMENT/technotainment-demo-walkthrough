"use client";

/**
 * StMobileNav — mobile-only hamburger + slide-in drawer for the Creator Studio nav.
 * Mirrors StSidebar's items. Shows only below 1024px (the trigger uses `.sb-mobile-btn`,
 * which globals.css hides at >=1024px). The desktop sidebar is unchanged.
 */
import { useState } from "react";
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
      { href: "/studio/monetization", label: "monetization", icon: "cast" },
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

export function StMobileNav() {
  const pathname = usePathname() ?? "/studio";
  const [open, setOpen] = useState(false);
  const settingsActive = isActive(pathname, "/studio/settings");

  return (
    <>
      <button
        type="button"
        className="sb-mobile-btn"
        aria-label="open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="grid" size={20} stroke={2.2} />
      </button>

      {open && (
        <>
          <div className="sb-drawer-scrim" onClick={() => setOpen(false)} aria-hidden />
          <aside className="sb-drawer studio-scope" style={{ color: "var(--ink-1)" }}>
            <div className="sb-head" style={{ justifyContent: "space-between" }}>
              <span className="lower" style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>
                technotainment
              </span>
              <button
                type="button"
                aria-label="close menu"
                onClick={() => setOpen(false)}
                style={{ color: "var(--ink-3)", padding: 4 }}
              >
                <Icon name="close" size={18} stroke={2.2} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
              {NAV.map((grp, gi) => (
                <div key={gi}>
                  {grp.section && <div className="sb-section">{grp.section}</div>}
                  {grp.items.map((it) => {
                    const active = isActive(pathname, it.href);
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={`sb-item ${active ? "active" : ""}`}
                        onClick={() => setOpen(false)}
                      >
                        <Icon name={it.icon} size={18} stroke={active ? 2.4 : 1.8} /> {it.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
              <div className="sb-divider" />
              <Link
                href="/studio/settings"
                className={`sb-item ${settingsActive ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon name="settings" size={18} stroke={settingsActive ? 2.4 : 1.8} /> settings
              </Link>
              <div className="sb-divider" />
              <Link href="/home" className="sb-item lower" onClick={() => setOpen(false)}>
                <Icon name="eye" size={18} stroke={1.8} /> exit studio
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
