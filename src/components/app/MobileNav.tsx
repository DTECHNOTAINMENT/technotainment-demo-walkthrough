"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Global mobile bottom-nav. Rendered once in the root layout so it appears on EVERY page
 * (including standalone routes like /live, /wallet, /watch, /c/:handle that don't use the
 * (app) shell) — fixing the "trapped, no way back" bug on mobile. Uses the `.bn` class which
 * auto-hides at ≥1024px. Hidden on /studio and /admin (those have their own mobile drawer).
 * Reads the session from /api/session so it shows signed-in vs signed-out destinations.
 */
type Item = { href: string; label: string; icon: string };

const SIGNED_IN: Item[] = [
  { href: "/home", label: "home", icon: "home" },
  { href: "/live", label: "live", icon: "flame" },
  { href: "/library", label: "library", icon: "film" },
  { href: "/wallet", label: "wallet", icon: "wallet" },
  { href: "/profile", label: "you", icon: "user" },
];

const SIGNED_OUT: Item[] = [
  { href: "/", label: "home", icon: "home" },
  { href: "/live", label: "live", icon: "flame" },
  { href: "/explore", label: "explore", icon: "grid" },
  { href: "/sign-in", label: "sign in", icon: "user" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { signedIn?: boolean }) => alive && setSignedIn(!!d.signedIn))
      .catch(() => alive && setSignedIn(false));
    return () => {
      alive = false;
    };
  }, [pathname]); // re-check after navigation (e.g. sign in/out)

  // Studio + admin own their mobile nav (hamburger drawer) — don't double up.
  if (pathname.startsWith("/studio") || pathname.startsWith("/admin") || pathname === "/sign-in") return null;

  const items = signedIn ? SIGNED_IN : SIGNED_OUT;

  return (
    <nav className="bn" aria-label="primary">
      {items.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link key={it.href} href={it.href} className={`bn-item${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon name={it.icon} size={20} stroke={active ? 2.4 : 1.9} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
