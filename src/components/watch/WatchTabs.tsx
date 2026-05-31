"use client";

// Tabs row + panels, ported from prototype/v4/live.jsx (lines ~399–537 + the Tabs helper).
// brand-gradient underline on the active tab. Panels: chat / about / live drops /
// competition / members. chat renders the live <LiveChat/> when the stream is live,
// otherwise a "chat available during live streams" note.
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { LiveChat } from "@/components/LiveChat";
import { formatNum } from "@/components/ui/primitives";
import type { WatchAbout, WatchCompetition, WatchDrop, WatchTier } from "./types";

type TabId = "chat" | "about" | "drops" | "competition" | "members";

const TABS: { id: TabId; label: string }[] = [
  { id: "chat", label: "chat" },
  { id: "about", label: "about" },
  { id: "drops", label: "live drops" },
  { id: "competition", label: "competition" },
  { id: "members", label: "members" },
];

export function WatchTabs({
  live,
  streamId,
  about,
  drops,
  competitions,
  tiers,
  giftedSubs,
}: {
  live: boolean;
  streamId?: string;
  about: WatchAbout;
  drops: WatchDrop[];
  competitions: WatchCompetition[];
  tiers: WatchTier[];
  giftedSubs: number;
}) {
  const [active, setActive] = useState<TabId>(live ? "chat" : "about");
  const [note, setNote] = useState<string | null>(null);

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote((n) => (n === msg ? null : n)), 2000);
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid var(--hairline)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="lower"
            style={{
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 500,
              color: active === t.id ? "var(--ink-1)" : "var(--ink-3)",
              position: "relative",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.label}
            {active === t.id && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -1,
                  height: 2,
                  background: "var(--brand-gradient)",
                  borderRadius: 2,
                }}
              />
            )}
          </button>
        ))}
      </div>

      <div style={{ paddingTop: 20, color: "var(--ink-1)" }}>
        {active === "chat" &&
          (live && streamId ? (
            <div style={{ minHeight: 600 }}>
              <LiveChat streamId={streamId} />
            </div>
          ) : (
            <div
              style={{
                padding: "40px 16px",
                textAlign: "center",
                color: "var(--ink-3)",
                fontSize: 14,
                background: "var(--surface-2)",
                borderRadius: 12,
              }}
              className="lower"
            >
              chat is available during live streams.
            </div>
          ))}

        {active === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--ink-1)" }}>
            <AboutRow label="category" value={about.category} />
            <AboutRow label="tags" value={about.tags} />
            <AboutRow label="schedule" value={about.schedule} />
            <AboutRow label="language" value={about.language} />
          </div>
        )}

        {active === "drops" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {drops.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    aspectRatio: "4/3",
                    borderRadius: 10,
                    backgroundImage: `url(${d.imgUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">
                  {d.edition}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                  <span className="tnum" style={{ fontSize: 16, fontWeight: 700 }}>
                    {formatNum(d.priceCast)}{" "}
                    <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>CAST</span>
                  </span>
                  <button
                    onClick={() => flash(`buying ${d.name}`)}
                    className="lower"
                    style={{
                      padding: "0 14px",
                      height: 32,
                      fontSize: 12,
                      fontWeight: 500,
                      borderRadius: 999,
                      background: "var(--surface-3)",
                      color: "var(--ink-1)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "competition" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {competitions.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderTop: i ? "1px solid var(--hairline)" : "none",
                }}
              >
                <Icon name="sparkle" size={20} stroke={2} style={{ color: "var(--ink-3)", flex: "0 0 20px" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">
                    {c.ends} · {c.entry} CAST entry
                  </div>
                </div>
                <button
                  onClick={() => flash(`entering ${c.name}`)}
                  className="lower"
                  style={{
                    padding: "0 16px",
                    height: 36,
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 999,
                    background: "var(--surface-3)",
                    color: "var(--ink-1)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  enter
                </button>
              </div>
            ))}
          </div>
        )}

        {active === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div className="tnum" style={{ fontSize: 28, fontWeight: 700 }}>
                  {giftedSubs}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">
                  subs gifted in this stream
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => flash("gifting a sub · 250 CAST")}
                className="lower"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0 16px",
                  height: 36,
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 999,
                  background: "var(--brand-gradient)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Icon name="gift" size={14} stroke={2.4} /> gift a sub · 250 CAST
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {tiers.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "var(--surface-2)",
                    border: t.popular ? "1.5px solid transparent" : "1px solid var(--hairline)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                    }}
                  >
                    {t.name}
                  </div>
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                    {t.cast}
                    <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}> CAST/mo</span>
                  </div>
                  <ul
                    style={{
                      marginTop: 8,
                      paddingLeft: 0,
                      listStyle: "none",
                      fontSize: 12,
                      color: "var(--ink-2)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {t.perks.map((p, j) => (
                      <li key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <Icon name="check" size={13} stroke={2.4} style={{ marginTop: 2, flex: "0 0 13px" }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {note && (
        <div className="lower" style={{ marginTop: 10, fontSize: 12, color: "#10b981" }}>
          {note} ✓
        </div>
      )}
    </div>
  );
}

function AboutRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "var(--ink-3)", display: "inline-block", width: 100 }}>{label}</span> {value}
    </div>
  );
}

export default WatchTabs;
