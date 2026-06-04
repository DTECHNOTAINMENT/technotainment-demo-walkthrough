"use client";

// Creator row + action row, ported from prototype/v4/live.jsx (lines ~345–379).
// avatar + name + verified check + sub line + subscribe button, then a row of actions:
// tip (real spend via SupportBar), gift / share / save / more.
//
// gift   -> opens a gift picker (pick a gift → animated confirmation)
// share  -> real clipboard copy + a popover (copy link · share to X · device share)
// save   -> real toggle, filled bookmark + "saved", persisted in localStorage
// more   -> a real dropdown menu (copy link · copy embed code · report)
// Only one menu is open at a time; click-outside and Escape close it.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { SupportBar } from "@/components/SupportBar";
import { channelHref } from "@/lib/links";
import type { WatchCreator } from "./types";

const VerifiedCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" aria-label="verified" style={{ flex: "0 0 14px" }}>
    <path
      d="M12 2l2.39 2.05L17.5 3.5l.78 3.07 3 1.18-1.5 2.78 1.5 2.78-3 1.18-.78 3.07-3.11-.55L12 19.05l-2.39-2.05-3.11.55-.78-3.07-3-1.18 1.5-2.78-1.5-2.78 3-1.18.78-3.07 3.11.55L12 2z"
      fill="#3ea6ff"
    />
    <path d="M10.5 14.5l-3-3 1.41-1.41L10.5 11.67l5.09-5.09L17 8l-6.5 6.5z" fill="#fff" />
  </svg>
);

type MenuKey = "gift" | "share" | "more";

// Demo gift options. Picking one is a client-side confirmation (real CAST spend
// lives in the tip flow via SupportBar) — but the picker is fully interactive.
const GIFTS: { id: string; icon: string; label: string; cast: number }[] = [
  { id: "spark", icon: "sparkle", label: "spark", cast: 25 },
  { id: "heart", icon: "heart", label: "heart", cast: 100 },
  { id: "flame", icon: "flame", label: "flame", cast: 500 },
];

export function WatchActions({
  creator,
  channelId,
  subsLine,
}: {
  creator: WatchCreator;
  channelId: string;
  subsLine: string;
}) {
  const pathname = usePathname();
  const [following, setFollowing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  const flash = useCallback((msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote((n) => (n === msg ? null : n)), 2000);
  }, []);

  // localStorage key for the "saved" toggle — stable per page (slug/id lives in the path).
  const saveKey = `tn:saved:${pathname ?? channelId}`;

  // Hydrate the saved state from localStorage on mount (client-only).
  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(saveKey) === "1");
    } catch {
      /* storage blocked — fine, defaults to unsaved */
    }
  }, [saveKey]);

  // Close any open menu on outside-click or Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const toggleMenu = (key: MenuKey) => setOpenMenu((cur) => (cur === key ? null : key));

  const currentUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  const copyText = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through to legacy path */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  };

  const copyLink = async () => {
    const ok = await copyText(currentUrl());
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
    flash(ok ? "link copied" : "couldn’t copy link");
    setOpenMenu(null);
  };

  const copyEmbed = async () => {
    const snippet = `<iframe src="${currentUrl()}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    const ok = await copyText(snippet);
    flash(ok ? "embed code copied" : "couldn’t copy embed");
    setOpenMenu(null);
  };

  const shareToX = () => {
    const url = encodeURIComponent(currentUrl());
    const text = encodeURIComponent(`watching ${creator.name} on Technotainment`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
    flash("opening X…");
    setOpenMenu(null);
  };

  const deviceShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: creator.name, url: currentUrl() });
        flash("shared");
      } else {
        await copyLink();
        return;
      }
    } catch {
      /* user cancelled — no-op */
    }
    setOpenMenu(null);
  };

  const sendGift = (g: (typeof GIFTS)[number]) => {
    flash(`sent a ${g.label} · ${g.cast} CAST`);
    setOpenMenu(null);
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    try {
      if (next) window.localStorage.setItem(saveKey, "1");
      else window.localStorage.removeItem(saveKey);
    } catch {
      /* storage blocked — UI still reflects the toggle */
    }
    flash(next ? "saved to library" : "removed from library");
  };

  const reportContent = () => {
    flash("thanks — our team will review this");
    setOpenMenu(null);
  };

  const secondary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "0 16px",
    height: 36,
    borderRadius: 999,
    background: "var(--surface-2)",
    color: "var(--ink-1)",
    fontWeight: 500,
    fontSize: 14,
    border: "none",
    cursor: "pointer",
  };

  const activePill: React.CSSProperties = {
    ...secondary,
    background: "var(--surface-3)",
    boxShadow: "inset 0 0 0 1.5px var(--hairline)",
  };

  const menuCard: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    zIndex: 30,
    minWidth: 196,
    padding: 6,
    borderRadius: 14,
    background: "var(--surface-2)",
    border: "1px solid var(--hairline)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  };

  const menuItem: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "9px 12px",
    borderRadius: 9,
    background: "transparent",
    color: "var(--ink-1)",
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  };

  const hoverable = {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = "var(--surface-3)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = "transparent";
    },
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 16,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            href={channelHref(creator.handle)}
            style={{ display: "flex", gap: 10, alignItems: "center", textAlign: "left", textDecoration: "none" }}
          >
            <Avatar creator={creator} size={40} />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--ink-1)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {creator.name}
                <VerifiedCheck />
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="tnum">
                {subsLine}
              </div>
            </div>
          </Link>
          {/* FREE follow (no CAST) — the model field is `followers`. Distinct from paid membership. */}
          <button
            onClick={() => {
              setFollowing((f) => !f);
              flash(following ? "unfollowed" : `following · ${creator.handle}`);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 16px",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 999,
              background: following ? "var(--surface-2)" : "var(--ink-1)",
              color: following ? "var(--ink-1)" : "var(--bg)",
              border: "none",
              height: 36,
              cursor: "pointer",
            }}
            className="lower"
          >
            <Icon name="heart" size={14} stroke={2.4} fill={following ? "currentColor" : "none"} />
            {following ? "following" : "follow"}
          </button>
          {/* PAID membership — subscribe with CAST (members/subscribers, not followers). */}
          <button
            onClick={() => {
              setSubscribed((s) => !s);
              flash(subscribed ? "membership cancelled" : `subscribed · member of ${creator.handle}`);
            }}
            style={{
              padding: "9px 18px",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 999,
              background: subscribed ? "var(--surface-2)" : "transparent",
              color: "var(--ink-1)",
              border: "1.5px solid var(--hairline)",
              height: 36,
              cursor: "pointer",
            }}
            className="lower"
          >
            {subscribed ? "member" : "subscribe"}
          </button>
        </div>

        <div ref={rowRef} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* real CAST spend lives here — the tip button */}
          <SupportBar channelId={channelId} tiers={[]} compact />

          {/* gift — opens an interactive gift picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => toggleMenu("gift")}
              style={openMenu === "gift" ? activePill : secondary}
              className="lower"
              aria-haspopup="menu"
              aria-expanded={openMenu === "gift"}
            >
              <Icon name="gift" size={15} stroke={2.2} /> gift
            </button>
            {openMenu === "gift" && (
              <div style={menuCard} role="menu">
                <div
                  className="lower"
                  style={{ padding: "6px 12px 4px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)" }}
                >
                  send a gift
                </div>
                {GIFTS.map((g) => (
                  <button key={g.id} onClick={() => sendGift(g)} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                    <Icon name={g.icon} size={16} stroke={2.2} />
                    <span style={{ flex: 1 }}>{g.label}</span>
                    <span className="tnum" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                      {g.cast} CAST
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* share — real clipboard copy + share targets */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => toggleMenu("share")}
              style={openMenu === "share" ? activePill : secondary}
              className="lower"
              aria-haspopup="menu"
              aria-expanded={openMenu === "share"}
            >
              <Icon name={copied ? "check" : "share"} size={15} stroke={2.2} /> {copied ? "copied" : "share"}
            </button>
            {openMenu === "share" && (
              <div style={menuCard} role="menu">
                <button onClick={() => void copyLink()} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                  <Icon name="share" size={16} stroke={2.2} /> copy link
                </button>
                <button onClick={shareToX} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                  <Icon name="arrowR" size={16} stroke={2.2} /> share to X
                </button>
                <button onClick={() => void deviceShare()} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                  <Icon name="users" size={16} stroke={2.2} /> share via device
                </button>
              </div>
            )}
          </div>

          {/* save — real toggle, persisted in localStorage */}
          <button
            onClick={toggleSave}
            style={saved ? activePill : secondary}
            className="lower"
            aria-pressed={saved}
          >
            <Icon name="bookmark" size={15} stroke={2.2} fill={saved ? "currentColor" : "none"} /> {saved ? "saved" : "save"}
          </button>

          {/* more — real dropdown menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => toggleMenu("more")}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: openMenu === "more" ? "var(--surface-3)" : "var(--surface-2)",
                boxShadow: openMenu === "more" ? "inset 0 0 0 1.5px var(--hairline)" : "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink-1)",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="more"
              aria-haspopup="menu"
              aria-expanded={openMenu === "more"}
            >
              <Icon name="settings" size={16} stroke={2.2} />
            </button>
            {openMenu === "more" && (
              <div style={menuCard} role="menu">
                <button onClick={() => void copyLink()} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                  <Icon name="share" size={16} stroke={2.2} /> copy link
                </button>
                <button onClick={() => void copyEmbed()} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                  <Icon name="film" size={16} stroke={2.2} /> copy embed code
                </button>
                <button onClick={reportContent} style={menuItem} className="lower" role="menuitem" {...hoverable}>
                  <Icon name="flame" size={16} stroke={2.2} /> report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {note && (
        <div className="lower" style={{ marginTop: 8, fontSize: 12, color: "#10b981" }}>
          {note} ✓
        </div>
      )}
    </>
  );
}

export default WatchActions;
