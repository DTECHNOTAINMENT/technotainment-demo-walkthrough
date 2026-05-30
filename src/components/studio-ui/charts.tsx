// Studio/Admin charts — pure dependency-free SVG, brand-aligned.
// Ported verbatim from prototype/v4/studio-shared.jsx (AreaSpark, Spark, Bars, SegBar).
// Server-safe: no client hooks beyond useId (RSC-compatible) for stable gradient ids.
import { useId } from "react";
import type { CSSProperties } from "react";

/** Area sparkline with gradient fill. Large hero chart. */
export function AreaSpark({
  data,
  w = 560,
  h = 160,
  stroke = "#8b5cf6",
  fill = "rgba(139,92,246,0.18)",
  pad = 6,
}: {
  data: number[];
  w?: number;
  h?: number;
  stroke?: string;
  fill?: string;
  pad?: number;
}) {
  const reactId = useId();
  const gid = "ag" + reactId.replace(/[:]/g, "");
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const dx = (w - pad * 2) / (data.length - 1);
  const pts: [number, number][] = data.map((v, i) => [
    pad + i * dx,
    pad + (h - pad * 2) * (1 - (v - min) / span),
  ]);
  const line = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pts[0][0].toFixed(1)} ${h - pad} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) =>
        i === pts.length - 1 ? <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={stroke} /> : null,
      )}
    </svg>
  );
}

/** Tiny inline sparkline used inside KPI StatCards. */
export function Spark({
  data,
  w = 96,
  h = 30,
  stroke = "#8b5cf6",
  up = true,
}: {
  data: number[];
  w?: number;
  h?: number;
  stroke?: string;
  up?: boolean;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const dx = w / (data.length - 1);
  const line = data
    .map(
      (v, i) =>
        (i ? "L" : "M") +
        (i * dx).toFixed(1) +
        " " +
        ((h - 3) * (1 - (v - min) / span) + 1.5).toFixed(1),
    )
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: "visible" }}>
      <path
        d={line}
        fill="none"
        stroke={up ? stroke : "#ef4444"}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Vertical bar chart with optional axis labels; highlights the last bar by default. */
export function Bars({
  data,
  labels,
  h = 180,
  color = "var(--brand-gradient)",
  fmt = (v: number) => String(v),
  highlightLast = true,
}: {
  data: number[];
  labels?: string[];
  h?: number;
  color?: string;
  fmt?: (v: number) => string;
  highlightLast?: boolean;
}) {
  const max = Math.max(...data) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h, padding: "0 2px" }}>
      {data.map((v, i) => {
        const last = i === data.length - 1;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              height: "100%",
              justifyContent: "flex-end",
            }}
            title={fmt(v)}
          >
            <div
              style={{
                width: "100%",
                borderRadius: "5px 5px 2px 2px",
                height: `${Math.max(4, (v / max) * (h - 22))}px`,
                background: last && highlightLast ? color : "var(--surface-3)",
                transition: "height 0.4s cubic-bezier(.2,.8,.2,1)",
              }}
            />
            {labels && (
              <span
                style={{
                  fontSize: 9,
                  color: last ? "var(--ink-2)" : "var(--ink-4)",
                  fontWeight: last ? 800 : 600,
                }}
                className="mono"
              >
                {labels[i]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface SegBarSegment {
  id: string;
  label: string;
  cast: number;
  color: string;
}

/** Stacked horizontal segment bar (e.g. revenue split). */
export function SegBar({ segments, total }: { segments: SegBarSegment[]; total: number }) {
  const style: CSSProperties = {
    display: "flex",
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
    background: "var(--surface-2)",
  };
  return (
    <div style={style}>
      {segments.map((s) => (
        <div
          key={s.id}
          style={{ width: `${(s.cast / total) * 100}%`, background: s.color }}
          title={`${s.label} · ${Math.round((s.cast / total) * 100)}%`}
        />
      ))}
    </div>
  );
}
