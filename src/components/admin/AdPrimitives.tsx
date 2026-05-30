/**
 * AdPrimitives — small presentational building blocks shared across the admin
 * pages (pills, page head, stat cards, table shells). Server-safe (no client
 * hooks). studio.css/admin classes are not in globals.css, so layout uses
 * design-token inline styles where a class is missing, and reuses the available
 * token classes (card, chip, stat-num, tnum, lower) elsewhere.
 */
import type { CSSProperties, ReactNode } from "react";

export type PillTone = "ok" | "warn" | "live" | "info" | "neutral";

const TONE: Record<PillTone, { bg: string; fg: string; bd: string }> = {
  ok: { bg: "rgba(16,185,129,0.14)", fg: "#10b981", bd: "rgba(16,185,129,0.3)" },
  warn: { bg: "rgba(245,158,11,0.14)", fg: "#f59e0b", bd: "rgba(245,158,11,0.3)" },
  live: { bg: "rgba(239,68,68,0.14)", fg: "#ef4444", bd: "rgba(239,68,68,0.3)" },
  info: { bg: "rgba(6,182,212,0.14)", fg: "#06b6d4", bd: "rgba(6,182,212,0.3)" },
  neutral: { bg: "var(--surface-2)", fg: "var(--ink-3)", bd: "var(--hairline)" },
};

export function AdPill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  const t = TONE[tone];
  return (
    <span
      className="lower tnum"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function AdPageHead({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
          }}
        >
          {eyebrow}
        </div>
        <h1 className="lower stat-num" style={{ fontSize: 28, margin: "6px 0 0" }}>
          {title}
        </h1>
        <p className="lower" style={{ fontSize: 13.5, color: "var(--ink-3)", margin: "8px 0 0", maxWidth: 640 }}>
          {sub}
        </p>
      </div>
      {actions ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{actions}</div> : null}
    </div>
  );
}

export function AdStatCard({
  label,
  value,
  unit,
  hint,
  accent = "#8b5cf6",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card" style={{ background: "var(--surface)", padding: 16, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent, opacity: 0.85 }} />
      <div
        className="lower"
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-4)",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 8 }}>
        <span className="tnum stat-num" style={{ fontSize: 26 }}>
          {value}
        </span>
        {unit ? (
          <span className="lower" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? (
        <div className="lower" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export const adPagePad: CSSProperties = { padding: "24px 24px 64px", maxWidth: 1400, margin: "0 auto" };

export const adKpiGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 14,
};

/** A card used as a table/list shell with a hairline border. */
export function AdCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="card" style={{ background: "var(--surface)", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

/** Empty-state row inside a card. */
export function AdEmpty({ children }: { children: ReactNode }) {
  return (
    <div
      className="lower"
      style={{ padding: "32px 20px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}
    >
      {children}
    </div>
  );
}
