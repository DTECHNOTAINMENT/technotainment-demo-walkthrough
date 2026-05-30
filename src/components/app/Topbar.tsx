"use client";

// Viewer top bar — search, theme toggle, notification bell, CAST balance pill, avatar.
// Ported in spirit from the prototype's top strip.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/theme";
import { Avatar, formatNum, type CreatorLike } from "@/components/ui/primitives";

export function Topbar({
  balance,
  user,
}: {
  /** CAST balance, or null for an anonymous visitor. */
  balance: number | null;
  user?: CreatorLike | null;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const anon = balance === null;

  return (
    <header
      className="topbar"
      style={{ position: "sticky", top: 0, zIndex: 26 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
        <form onSubmit={submit} style={{ flex: 1, maxWidth: 560, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }}>
            <Icon name="search" size={17} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search creators, microcasts, drops…"
            aria-label="search"
            className="lower"
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              borderRadius: 10,
              background: "var(--surface-2)",
              border: "1px solid var(--hairline)",
              color: "var(--ink-1)",
              fontSize: 13,
            }}
          />
        </form>

        <div style={{ flex: 1 }} />

        <ThemeToggle />

        <button type="button" className="theme-toggle" aria-label="notifications" style={{ transform: "none" }}>
          <Icon name="bell" size={17} />
        </button>

        {anon ? (
          <Link href="/sign-in" className="btn btn-grad" style={{ padding: "8px 16px", fontSize: 13 }}>
            sign in
          </Link>
        ) : (
          <>
            <Link href="/wallet/topup" className="cast-pill" aria-label="cast balance, top up">
              <span className="cast-glyph">C</span>
              <span className="tnum">{formatNum(balance)}</span>
              <Icon name="plus" size={14} stroke={2.4} />
            </Link>
            <Link href="/profile" aria-label="profile">
              {user ? <Avatar creator={user} size={34} ring /> : <Icon name="user" size={20} />}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
