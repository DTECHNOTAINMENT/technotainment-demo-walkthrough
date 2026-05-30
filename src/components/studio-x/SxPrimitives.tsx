"use client";

/**
 * Shared studio presentational primitives (client). Studio.css tokens (page-pad, st-*,
 * meter, etc.) live in the prototype only, so these reproduce them with inline token
 * styles drawn from globals.css CSS variables. Used across the Phase-3 studio pages I own.
 */
import type { CSSProperties, ReactNode } from "react";

const TONE: Record<string, { fg: string; bg: string }> = {
  ok: { fg: "#10b981", bg: "rgba(16,185,129,0.12)" },
  info: { fg: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  warn: { fg: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  bad: { fg: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  neutral: { fg: "var(--ink-3)", bg: "var(--surface-2)" },
};

export function SxPill({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof TONE }) {
  const t = TONE[tone] ?? TONE.neutral;
  return (
    <span
      className="lower"
      style={{
        display: "inline-block",
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        color: t.fg,
        background: t.bg,
        padding: "3px 9px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function SxPageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 22,
      }}
    >
      <div>
        <div
          className="lower"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
          }}
        >
          creator studio
        </div>
        <h1
          className="lower"
          style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "4px 0 0", color: "var(--ink-1)" }}
        >
          {title}
        </h1>
        {sub && <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "var(--ink-3)", maxWidth: 640 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function SxCard({
  title,
  sub,
  action,
  children,
  pad = true,
  style,
}: {
  title?: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  pad?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden", ...style }}>
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "16px 18px",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div>
            {title && (
              <div className="lower" style={{ fontSize: 14, fontWeight: 800, color: "var(--ink-1)" }}>
                {title}
              </div>
            )}
            {sub && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: pad ? 18 : 0 }}>{children}</div>
    </div>
  );
}

export function SxStat({
  label,
  value,
  unit,
  sub,
  grad = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  grad?: boolean;
}) {
  return (
    <div className="card" style={{ background: "var(--surface)", padding: 16 }}>
      <div
        className="lower"
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-3)",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span className={`tnum stat-num ${grad ? "brand-grad-text" : ""}`} style={{ fontSize: 28, fontWeight: 800 }}>
          {value}
        </span>
        {unit && (
          <span className="lower" style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 3 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/** Simple labelled progress bar (studio.css .meter equivalent). */
export function SxMeter({ pct, color = "var(--brand-gradient)" }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 7, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
      <span
        style={{ display: "block", height: "100%", width: `${Math.max(0, Math.min(100, pct))}%`, background: color }}
      />
    </div>
  );
}

export function SxEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div
      className="card"
      style={{
        background: "var(--surface)",
        padding: 40,
        textAlign: "center",
        border: "1px dashed var(--hairline-2)",
      }}
    >
      <div className="lower" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
        {title}
      </div>
      {hint && <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

export const SX_INPUT: CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: "1px solid var(--hairline)",
  background: "var(--surface-2)",
  color: "var(--ink-1)",
  fontSize: 14,
  outline: "none",
};

export const SX_LABEL: CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  marginBottom: 7,
};

export const SX_PAGE: CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "24px 22px 56px" };
