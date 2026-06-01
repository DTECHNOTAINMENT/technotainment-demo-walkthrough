"use client";

// Creator row + action row, ported from prototype/v4/live.jsx (lines ~345–379).
// avatar + name + verified check + sub line + subscribe button, then a row of actions:
// tip (real spend via SupportBar), gift / share / save / more (client confirmations).
import { useState } from "react";
import Link from "next/link";
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

export function WatchActions({
  creator,
  channelId,
  subsLine,
}: {
  creator: WatchCreator;
  channelId: string;
  subsLine: string;
}) {
  const [following, setFollowing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote((n) => (n === msg ? null : n)), 2000);
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

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* real CAST spend lives here — the tip button */}
          <SupportBar channelId={channelId} tiers={[]} compact />
          <button onClick={() => flash("gift sent")} style={secondary} className="lower">
            <Icon name="gift" size={15} stroke={2.2} /> gift
          </button>
          <button onClick={() => flash("link copied")} style={secondary} className="lower">
            <Icon name="share" size={15} stroke={2.2} /> share
          </button>
          <button onClick={() => flash("saved to library")} style={secondary} className="lower">
            <Icon name="bookmark" size={15} stroke={2.2} /> save
          </button>
          <button
            onClick={() => flash("copy link · embed · report")}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--surface-2)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-1)",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="more"
          >
            <Icon name="settings" size={16} stroke={2.2} />
          </button>
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
