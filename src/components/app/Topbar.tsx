"use client";

// Viewer top bar — search, theme toggle, notification bell, CAST balance pill, avatar.
// Ported in spirit from the prototype's top strip.
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/theme";
import { Avatar, formatNum, type CreatorLike } from "@/components/ui/primitives";
import { SearchBox } from "@/components/app/SearchBox";
import { NotificationsBell } from "@/components/app/NotificationsBell";

export function Topbar({
  balance,
  user,
}: {
  /** CAST balance, or null for an anonymous visitor. */
  balance: number | null;
  user?: CreatorLike | null;
}) {
  const anon = balance === null;

  return (
    <header
      className="topbar"
      style={{ position: "sticky", top: 0, zIndex: 26 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
        <SearchBox />

        <div style={{ flex: 1 }} />

        <ThemeToggle />

        <NotificationsBell />

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
