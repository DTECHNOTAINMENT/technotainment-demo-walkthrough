"use client";

/**
 * StSidebar — the Creator Studio left-nav. Client component so it can read the active
 * route via usePathname. Active state highlights the current segment. Ports the
 * prototype's grouped sidebar (studio-app.jsx) into a Next.js Link list.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
}
interface NavGroup {
  section: string | null;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  { section: null, items: [{ href: "/studio", label: "dashboard" }] },
  {
    section: "create",
    items: [
      { href: "/studio/live", label: "go live" },
      { href: "/studio/content", label: "content" },
      { href: "/studio/store", label: "store" },
    ],
  },
  {
    section: "grow",
    items: [
      { href: "/studio/audience", label: "audience" },
      { href: "/studio/memberships", label: "memberships" },
      { href: "/studio/analytics", label: "analytics" },
    ],
  },
  {
    section: "money",
    items: [{ href: "/studio/earnings", label: "earnings" }],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/studio") return pathname === "/studio";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StSidebar() {
  const pathname = usePathname() ?? "/studio";

  return (
    <aside
      style={{
        width: 230,
        flex: "0 0 230px",
        borderRight: "1px solid var(--hairline)",
        background: "var(--surface)",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {NAV.map((grp, gi) => (
        <div key={gi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {grp.section && (
            <div
              className="lower"
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-4)",
                padding: "14px 12px 6px",
              }}
            >
              {grp.section}
            </div>
          )}
          {grp.items.map((it) => {
            const active = isActive(pathname, it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className="lower"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: active ? 800 : 600,
                  textDecoration: "none",
                  color: active ? "var(--ink-1)" : "var(--ink-3)",
                  background: active ? "var(--surface-2)" : "transparent",
                  border: `1px solid ${active ? "var(--hairline)" : "transparent"}`,
                }}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      ))}

      <div style={{ flex: 1 }} />

      <Link
        href="/studio/settings"
        className="lower"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          borderRadius: 10,
          fontSize: 13.5,
          fontWeight: isActive(pathname, "/studio/settings") ? 800 : 600,
          textDecoration: "none",
          color: isActive(pathname, "/studio/settings") ? "var(--ink-1)" : "var(--ink-3)",
          background: isActive(pathname, "/studio/settings") ? "var(--surface-2)" : "transparent",
        }}
      >
        settings
      </Link>
    </aside>
  );
}
