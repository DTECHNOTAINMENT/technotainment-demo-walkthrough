"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { NavItem } from "./NavLinks";

/**
 * Mobile bottom-nav (`.bn`). The `.bn` class hides itself at >=1024px (globals.css),
 * so this only shows on phone/tablet where the sidebar is collapsed.
 * Mirrors the sidebar's primary destinations, with active-state from usePathname.
 */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="bn" aria-label="primary">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`bn-item lower${active ? " active" : ""}`}
          >
            {item.icon ? (
              <Icon name={item.icon} size={22} stroke={active ? 2.4 : 1.8} />
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
