"use client";

/**
 * AdSidebar — the Admin / Operations left-nav. Client component so it can read the
 * active route via usePathname. Ports admin-app.jsx's grouped sidebar into a
 * Next.js Link list. The /admin segment is staff-gated in the layout; finance,
 * connectors, growth and settings are owned by another agent but linked here.
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
  { section: null, items: [{ href: "/admin", label: "overview" }] },
  {
    section: "people",
    items: [
      { href: "/admin/users", label: "users" },
      { href: "/admin/creators", label: "creators" },
    ],
  },
  {
    section: "trust & money",
    items: [
      { href: "/admin/moderation", label: "moderation" },
      { href: "/admin/finance", label: "finance" },
    ],
  },
  {
    section: "platform",
    items: [
      { href: "/admin/connectors", label: "connectors" },
      { href: "/admin/growth", label: "seo & growth" },
      { href: "/admin/settings", label: "settings" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdSidebar() {
  const pathname = usePathname() ?? "/admin";

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "4px 8px 14px",
        }}
      >
        <span className="lower" style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em", color: "var(--ink-1)" }}>
          technotainment
        </span>
        <span
          className="chip lower"
          style={{ padding: "3px 9px", fontSize: 11, borderColor: "rgba(239,68,68,0.35)", color: "#ef4444" }}
        >
          admin
        </span>
      </div>

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

      <div
        className="lower"
        style={{
          fontSize: 10.5,
          color: "var(--ink-4)",
          padding: "10px 12px",
          lineHeight: 1.4,
        }}
      >
        staff · demo (gate to SSO+MFA in prod)
      </div>
    </aside>
  );
}
