"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Sidebar nav links with active-state highlighting (usePathname). Token-styled to match
 * the prototype's `.sb-item`: gradient-text + tinted surface when active.
 */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="lower"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 14px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: active ? 800 : 600,
              color: active ? "var(--ink-1)" : "var(--ink-3)",
              background: active ? "var(--surface-2)" : "transparent",
              borderLeft: active ? "2px solid transparent" : "2px solid transparent",
              borderImage: active ? "var(--brand-gradient) 1" : undefined,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                flex: "0 0 8px",
                background: active ? "var(--brand-gradient)" : "var(--surface-3)",
              }}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
