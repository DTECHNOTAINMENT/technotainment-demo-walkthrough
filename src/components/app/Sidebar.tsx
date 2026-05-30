"use client";

// Viewer left nav — ported from prototype/v4/sidebar.jsx. Twitch-style persistent rail:
// logo, primary nav, BROWSE categories, FOLLOWING list (with live dots), YOU, become-a-creator.
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar, type CreatorLike } from "@/components/ui/primitives";

export interface SidebarCreator extends CreatorLike {
  id: string;
  category?: string | null;
  live?: boolean;
}

const PRIMARY = [
  { href: "/home", label: "home", icon: "home" },
  { href: "/live", label: "live now", icon: "flame" },
  { href: "/library", label: "library", icon: "film" },
];

const CATEGORIES = [
  { id: "music", label: "music", icon: "play" },
  { id: "gaming", label: "gaming", icon: "trend" },
  { id: "sports", label: "sports", icon: "flame" },
  { id: "talk", label: "talk", icon: "chat" },
  { id: "education", label: "education", icon: "bookmark" },
  { id: "drops", label: "drops", icon: "bag" },
  { id: "faith", label: "faith", icon: "sparkle" },
  { id: "esports", label: "esports", icon: "trend" },
];

const YOU = [
  { href: "/following", label: "following", icon: "heart" },
  { href: "/explore/all", label: "explore", icon: "grid" },
  { href: "/explore/drops", label: "drops", icon: "bag" },
  { href: "/wallet", label: "wallet", icon: "wallet" },
  { href: "/profile", label: "profile", icon: "user" },
];

export function Sidebar({
  following = [],
  isAnon = false,
  isCreator = false,
}: {
  following?: SidebarCreator[];
  isAnon?: boolean;
  isCreator?: boolean;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? following : following.slice(0, 7);

  return (
    <aside className="sidebar">
      <div className="sb-head">
        <Link
          href={isAnon ? "/" : "/home"}
          aria-label="technotainment home"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/butterfly-t.png" alt="" className="logo-blend" style={{ height: 24, width: "auto", display: "block" }} />
          <span className="lower" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: "var(--ink-1)" }}>
            technotainment
          </span>
        </Link>
      </div>

      <div style={{ paddingBottom: 8 }}>
        {PRIMARY.map((p) => {
          const active = pathname === p.href;
          return (
            <Link key={p.href} href={p.href} className={`sb-item ${active ? "active" : ""}`}>
              <Icon name={p.icon} size={18} stroke={active ? 2.4 : 1.8} /> {p.label}
            </Link>
          );
        })}
      </div>

      <div className="sb-divider" />

      <div className="sb-section">browse</div>
      <div>
        {CATEGORIES.map((c) => {
          const href = `/explore/${c.id}`;
          const active = pathname === href;
          return (
            <Link key={c.id} href={href} className={`sb-item ${active ? "active" : ""}`}>
              <Icon name={c.icon} size={18} stroke={1.8} /> {c.label}
            </Link>
          );
        })}
      </div>

      <div className="sb-divider" />

      {isAnon ? (
        <>
          <div className="sb-section">following</div>
          <div style={{ padding: "4px 22px 8px" }}>
            <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
              <Link href="/sign-in" className="brand-grad-text" style={{ fontWeight: 700 }}>
                sign in
              </Link>{" "}
              to follow creators and build your feed.
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="sb-section">following · {following.length}</div>
          <div>
            {visible.map((c) => (
              <Link key={c.id} href={`/c/${c.handle.replace(/^@/, "")}`} className="sb-creator">
                <Avatar creator={c} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sb-handle">{c.handle}</div>
                  <div className="sb-sub">
                    {c.live ? <span style={{ color: "var(--live)", fontWeight: 700 }}>· live now</span> : c.category}
                  </div>
                </div>
                {c.live && <span className="sb-live-dot" />}
              </Link>
            ))}
            {following.length === 0 && (
              <div className="lower" style={{ padding: "4px 22px 8px", fontSize: 12, color: "var(--ink-3)" }}>
                follow creators to fill this list.
              </div>
            )}
            {following.length > 7 && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="sb-item"
                style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500, width: "calc(100% - 16px)" }}
              >
                <Icon name="chevD" size={16} stroke={2} style={{ transform: expanded ? "rotate(180deg)" : "none" }} />
                {expanded ? "show less" : `show ${following.length - 7} more`}
              </button>
            )}
          </div>
        </>
      )}

      <div className="sb-divider" />

      <div className="sb-section">you</div>
      <div>
        {YOU.map((p) => {
          const active = pathname === p.href;
          return (
            <Link key={p.href} href={isAnon ? "/sign-in" : p.href} className={`sb-item ${active ? "active" : ""}`}>
              <Icon name={p.icon} size={18} stroke={active ? 2.4 : 1.8} /> {p.label}
            </Link>
          );
        })}
      </div>

      <div className="sb-divider" />

      <Link href={isAnon ? "/sign-in" : "/studio"} className="mode-switch">
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "var(--brand-gradient)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flex: "0 0 34px",
          }}
        >
          <Icon name="cast" size={17} stroke={2.2} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span className="lower" style={{ display: "block", fontSize: 13, fontWeight: 700 }}>
            {isCreator ? "creator studio" : "become a creator"}
          </span>
          <span className="lower" style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)" }}>
            go live · upload · earn
          </span>
        </span>
      </Link>

      <div style={{ padding: "16px 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="mono" style={{ fontSize: 10, color: "var(--ink-4)", opacity: 0.7 }}>
          © 2026 technotainment
        </div>
      </div>
    </aside>
  );
}
