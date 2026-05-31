"use client";

// Right-column aside, ported from prototype/v4/live.jsx (lines ~540–625):
// a dismissible "live drop" card, a row of filter chips, and a vertical up-next list of
// 140x80 thumbnails with a coloured overlay badge + live/duration badge, title, @handle and
// a watching/views meta line. Items are passed in from the server page (real fixtures/DB).
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { UpNextItem, WatchDrop } from "./types";

function fmtViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
}

export function WatchUpNext({
  drop,
  chips,
  items,
}: {
  drop: WatchDrop | null;
  chips: string[];
  items: UpNextItem[];
}) {
  const [dropOpen, setDropOpen] = useState(true);
  const [active, setActive] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote((n) => (n === msg ? null : n)), 2000);
  };

  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
      {/* live drop card */}
      {drop && dropOpen && (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              live drop
            </span>
            <button
              onClick={() => setDropOpen(false)}
              aria-label="dismiss"
              style={{ width: 20, height: 20, color: "var(--ink-4)", background: "transparent", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <Icon name="close" size={12} />
            </button>
          </div>
          <div
            style={{
              aspectRatio: "16/10",
              borderRadius: 10,
              backgroundImage: `url(${drop.imgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              marginBottom: 10,
            }}
          />
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-1)" }}>{drop.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }} className="tnum">
            {drop.edition}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span className="tnum" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>
              {drop.priceCast.toLocaleString()} <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 400 }}>CAST</span>
            </span>
            <button
              onClick={() => flash(`buying ${drop.name}`)}
              className="lower"
              style={{
                padding: "0 14px",
                height: 32,
                borderRadius: 999,
                background: "var(--brand-gradient)",
                color: "#fff",
                fontWeight: 500,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              buy now
            </button>
          </div>
        </div>
      )}

      {/* filter chips */}
      <div className="rail" style={{ gap: 6, paddingBottom: 2 }}>
        {chips.map((c, i) => (
          <button
            key={c}
            onClick={() => setActive(i)}
            className="lower"
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: i === active ? "var(--surface-3)" : "transparent",
              color: i === active ? "var(--ink-1)" : "var(--ink-3)",
              border: "none",
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* up-next list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              textAlign: "left",
              textDecoration: "none",
              background: "transparent",
              padding: 4,
              margin: -4,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 140,
                height: 80,
                borderRadius: 8,
                overflow: "hidden",
                backgroundImage: `url(${p.thumbUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                flex: "0 0 140px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  padding: "3px 7px",
                  borderRadius: 4,
                  background: p.overlayBg,
                  color: p.overlayColor || "#fff",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {p.overlay}
              </span>
              {p.live ? (
                <span
                  style={{
                    position: "absolute",
                    bottom: 6,
                    right: 6,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "#ef2b3d",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white" }} /> live
                </span>
              ) : (
                p.dur && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 6,
                      right: 6,
                      background: "rgba(0,0,0,0.85)",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                    className="tnum"
                  >
                    {p.dur}
                  </span>
                )
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 500,
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  color: "var(--ink-1)",
                }}
              >
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "#7E7E8A", marginTop: 4 }} className="lower">
                {p.handle}
              </div>
              <div style={{ fontSize: 12, color: "#7E7E8A", display: "flex", alignItems: "center", gap: 6 }}>
                {p.live && typeof p.viewers === "number" ? (
                  <>
                    <span className="tnum">{p.viewers.toLocaleString()}</span> watching
                  </>
                ) : (
                  typeof p.views === "number" && (
                    <>
                      <span className="tnum">{fmtViews(p.views)}</span> views{p.ago ? ` · ${p.ago}` : ""}
                    </>
                  )
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {note && (
        <div className="lower" style={{ fontSize: 12, color: "#10b981" }}>
          {note} ✓
        </div>
      )}
    </aside>
  );
}

export default WatchUpNext;
