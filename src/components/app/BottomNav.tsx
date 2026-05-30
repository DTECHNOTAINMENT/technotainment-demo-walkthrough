"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./NavLinks";

/**
 * Mobile bottom-nav (`.bn`). Shown below the `md` breakpoint via the layout's wrapper.
 * Mirrors the sidebar's primary destinations, with active-state from usePathname.
 */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
        background: "var(--surface)",
        borderTop: "1px solid var(--hairline)",
        boxShadow: "var(--shadow-pop)",
      }}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="lower"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "10px 4px",
              fontSize: 11,
              fontWeight: active ? 800 : 600,
              color: active ? "var(--ink-1)" : "var(--ink-3)",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
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
