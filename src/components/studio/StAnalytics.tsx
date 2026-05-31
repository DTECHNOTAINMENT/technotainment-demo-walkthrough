"use client";

/**
 * StAnalytics — client analytics body. Owns the date-range Seg (30d/3m/6m/12m) which
 * re-scopes the demo revenue/views series, plus the revenue + minutes-watched charts,
 * a top-performing-content table, a traffic-sources breakdown (Meters) and a retention
 * chart. Server-derived KPIs (revenue-by-kind / SegBar) stay on the page; this part is
 * the trend + breakdown surface. Mirrors prototype/v4/studio-analytics.jsx.
 */
import { useState } from "react";
import { formatCast } from "@/lib/cast";
import { StudioCard, Bars, AreaSpark, Meter } from "@/components/studio-ui";

interface TopRow {
  id: string;
  title: string;
  views: number;
  castEarned: number;
}

const RANGES = [
  { id: "30d", label: "30d" },
  { id: "3m", label: "3m" },
  { id: "6m", label: "6m" },
  { id: "12m", label: "12m" },
];

const TRAFFIC: [string, number][] = [
  ["microcast page", 46],
  ["live + notifications", 28],
  ["small rooms metacast", 14],
  ["search & explore", 8],
  ["external links", 4],
];

// retention curve (% watched across the timeline) — demo shape, spike highlighted.
const RETENTION = [100, 96, 92, 88, 85, 83, 80, 78, 76, 74, 71, 69, 67, 70, 66, 63, 61, 58, 55, 52];

export function StAnalytics({
  months,
  earnSeries,
  viewSeries,
  topContent,
}: {
  months: string[];
  earnSeries: number[];
  viewSeries: number[];
  topContent: TopRow[];
}) {
  const [range, setRange] = useState("12m");
  const n = range === "30d" ? 1 : range === "3m" ? 3 : range === "6m" ? 6 : 12;
  const earn = earnSeries.slice(-n);
  const views = viewSeries.slice(-n);
  const labels = months.slice(-n);
  const avgPct = [68, 54, 72, 41];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -52, marginBottom: 18 }}>
        <div style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hairline)" }}>
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className="lower"
              style={{
                padding: "7px 14px",
                borderRadius: 9,
                fontSize: 12.5,
                fontWeight: 700,
                background: range === r.id ? "var(--surface)" : "transparent",
                color: range === r.id ? "var(--ink-1)" : "var(--ink-3)",
                boxShadow: range === r.id ? "var(--shadow-card)" : "none",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="st-split-even">
        <StudioCard title="revenue" sub="CAST gross by month">
          <Bars data={earn} labels={labels} h={190} fmt={(v) => formatCast(v) + " CAST"} />
        </StudioCard>
        <StudioCard title="minutes watched" sub="all surfaces">
          <AreaSpark data={views} h={190} stroke="#06b6d4" fill="rgba(6,182,212,0.2)" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {labels
              .filter((_, i) => i % Math.ceil(labels.length / 6) === 0)
              .map((m, i) => (
                <span key={`${m}-${i}`} className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>
                  {m}
                </span>
              ))}
          </div>
        </StudioCard>
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        {/* LEFT — top content + retention */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="top performing content" sub="by CAST earned" pad={false}>
            <div className="st-row head" style={{ gridTemplateColumns: "1fr 90px 90px 110px" }}>
              <span>title</span>
              <span style={{ textAlign: "right" }}>views</span>
              <span style={{ textAlign: "right" }}>avg %</span>
              <span style={{ textAlign: "right" }}>CAST</span>
            </div>
            {topContent.length === 0 ? (
              <div className="lower" style={{ padding: 18, fontSize: 13, color: "var(--ink-3)" }}>
                no published content yet.
              </div>
            ) : (
              topContent.map((c, i) => (
                <div key={c.id} className="st-row" style={{ gridTemplateColumns: "1fr 90px 90px 110px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span className="mono" style={{ color: "var(--ink-4)", fontSize: 12, fontWeight: 800, width: 14 }}>
                      {i + 1}
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.title}
                    </div>
                  </div>
                  <div className="tnum" style={{ textAlign: "right", fontSize: 12.5 }}>
                    {formatCast(c.views)}
                  </div>
                  <div className="tnum" style={{ textAlign: "right", fontSize: 12.5, color: "var(--ink-3)" }}>
                    {avgPct[i] ?? 50}%
                  </div>
                  <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                    {formatCast(c.castEarned)}
                  </div>
                </div>
              ))
            )}
          </StudioCard>

          <StudioCard title="audience retention" sub="avg. % watched across last stream">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, marginBottom: 8 }}>
              {RETENTION.map((v, i) => (
                <div
                  key={i}
                  style={{ flex: 1, height: `${v}%`, background: i === 12 ? "var(--brand-gradient)" : "var(--surface-3)", borderRadius: "3px 3px 0 0" }}
                  title={`${v}%`}
                />
              ))}
            </div>
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-4)" }}>
              <span>0:00</span>
              <span>spike at 1:02 · the bass drop</span>
              <span>2:03</span>
            </div>
          </StudioCard>
        </div>

        {/* RIGHT — traffic sources */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="traffic sources" sub="where viewers come from">
            {TRAFFIC.map(([k, v]) => (
              <div key={k} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span className="lower" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                    {k}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {v}%
                  </span>
                </div>
                <Meter value={v / 100} />
              </div>
            ))}
          </StudioCard>

          <StudioCard title="top regions">
            {[
              ["united kingdom", 38],
              ["germany", 19],
              ["united states", 14],
              ["france", 9],
              ["rest of world", 20],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--hairline)" }}>
                <span className="lower" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                  {k}
                </span>
                <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>
                  {v}%
                </span>
              </div>
            ))}
          </StudioCard>
        </div>
      </div>
    </>
  );
}
