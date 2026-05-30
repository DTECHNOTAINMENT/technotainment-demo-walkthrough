// Studio/Admin presentational primitives — server-safe (no client hooks).
// Ported verbatim from prototype/v4/studio-shared.jsx (StatCard, StudioCard,
// StudioPageHead, Pill) plus a small Meter helper used across studio/admin screens.
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Spark } from "./charts";

/** KPI stat card with `.stat-num`. label + value + optional unit/delta/spark/fiat/icon. */
export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaUp = true,
  spark,
  sparkColor = "#8b5cf6",
  icon,
  fiat,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: ReactNode;
  deltaUp?: boolean;
  spark?: number[];
  sparkColor?: string;
  icon?: string;
  fiat?: ReactNode;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          {icon && <Icon name={icon} size={13} stroke={2.4} />}
          {label}
        </span>
        {delta != null && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: deltaUp ? "#10b981" : "#ef4444",
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}
            className="tnum"
          >
            <Icon
              name="trend"
              size={12}
              stroke={2.6}
              style={{ transform: deltaUp ? "none" : "scaleY(-1)" }}
            />
            {delta}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="tnum stat-num" style={{ fontSize: 30 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 700 }} className="lower">
            {unit}
          </span>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        {fiat ? (
          <span style={{ fontSize: 11, color: "var(--ink-4)" }} className="mono">
            {fiat}
          </span>
        ) : (
          <span />
        )}
        {spark && <Spark data={spark} stroke={sparkColor} up={deltaUp} />}
      </div>
    </div>
  );
}

/** Section card with optional header (title, sub, action) and padded body. */
export function StudioCard({
  title,
  sub,
  action,
  children,
  pad = true,
  style,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  pad?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className="card" style={{ background: "var(--surface)", ...style }}>
      {(title || action) && (
        <div
          style={{
            padding: "16px 18px",
            borderBottom: children ? "1px solid var(--hairline)" : "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div style={{ fontWeight: 800, fontSize: 15 }} className="lower">
                {title}
              </div>
            )}
            {sub && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      {children && <div style={pad ? { padding: 18 } : undefined}>{children}</div>}
    </div>
  );
}

/** Page header strip used across studio/admin screens. */
export function StudioPageHead({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 22,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink-3)",
              marginBottom: 7,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(26px, 3vw, 34px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
          className="lower"
        >
          {title}
        </h1>
        {sub && (
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6, maxWidth: 620 }}>
            {sub}
          </div>
        )}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export type PillTone = "neutral" | "ok" | "warn" | "live" | "info";

/** Status badge / pill. */
export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: PillTone }) {
  const tones: Record<PillTone, { bg: string; fg: string; bd: string }> = {
    neutral: { bg: "var(--surface-2)", fg: "var(--ink-2)", bd: "var(--hairline)" },
    live: { bg: "rgba(239,68,68,0.12)", fg: "#ef4444", bd: "rgba(239,68,68,0.3)" },
    ok: { bg: "rgba(16,185,129,0.12)", fg: "#10b981", bd: "rgba(16,185,129,0.3)" },
    warn: { bg: "rgba(245,158,11,0.14)", fg: "#f59e0b", bd: "rgba(245,158,11,0.3)" },
    info: { bg: "rgba(139,92,246,0.14)", fg: "#a78bfa", bd: "rgba(139,92,246,0.3)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
      }}
    >
      {children}
    </span>
  );
}

/** Progress meter (`.meter`). Pass a 0..1 value and an optional fill color/gradient. */
export function Meter({
  value,
  color = "var(--brand-gradient)",
  style,
}: {
  value: number;
  color?: string;
  style?: CSSProperties;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="meter" style={style}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
