/**
 * AxPrimitives — shared building blocks for the admin (operations) pages I own:
 * finance, connectors, growth, settings/control-center, signin. Server-safe (no hooks,
 * no "use client") so server components can render them directly; the interactive
 * Ax* components import the style tokens / Pill from here.
 *
 * Voice is lowercase; visuals reuse the global token classes (card, chip, btn,
 * brand-hairline, tnum, lower, stat-num) defined in globals.css.
 */
import type { CSSProperties, ReactNode } from "react";

export type Tone = "ok" | "warn" | "info" | "neutral" | "live";

const TONE_STYLE: Record<Tone, CSSProperties> = {
  ok: { background: "rgba(16,185,129,0.14)", color: "#10b981" },
  warn: { background: "rgba(245,158,11,0.14)", color: "#f59e0b" },
  info: { background: "rgba(139,92,246,0.16)", color: "#8b5cf6" },
  live: { background: "rgba(239,68,68,0.14)", color: "#ef4444" },
  neutral: { background: "var(--surface-3)", color: "var(--ink-3)" },
};

/** Small status pill. Mirrors the prototype `Pill`. */
export function AxPill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className="lower"
      style={{
        ...TONE_STYLE[tone],
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** Page wrapper + header (eyebrow / title / sub / actions). */
export function AxPageHead({
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
        gap: 16,
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginBottom: 18,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          className="lower"
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          {eyebrow}
        </div>
        <h1 className="lower" style={{ fontSize: "clamp(26px,4vw,34px)", fontWeight: 800, margin: "6px 0 0" }}>
          {title}
        </h1>
        <p className="lower" style={{ fontSize: 14, color: "var(--ink-3)", margin: "8px 0 0", maxWidth: 720, lineHeight: 1.5 }}>
          {sub}
        </p>
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

/** Card with optional brand hairline + header. */
export function AxCard({
  title,
  sub,
  action,
  pad = true,
  children,
  style,
}: {
  title?: string;
  sub?: string;
  action?: ReactNode;
  pad?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="card" style={{ background: "var(--surface)", overflow: "hidden", ...style }}>
      {(title || action) && (
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "16px 18px",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <div className="lower" style={{ fontSize: 14, fontWeight: 800 }}>
                {title}
              </div>
            )}
            {sub && (
              <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                {sub}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      <div style={pad ? { padding: 18 } : undefined}>{children}</div>
    </div>
  );
}

/** Compact stat tile. */
export function AxStat({
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
        style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)" }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <span className={`tnum stat-num${grad ? " brand-grad-text" : ""}`} style={{ fontSize: 26, fontWeight: 800 }}>
          {value}
        </span>
        {unit && (
          <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700 }}>
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/** Empty / error state. */
export function AxEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={{ padding: "28px 18px", textAlign: "center" }}>
      <div className="lower" style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink-2)" }}>
        {title}
      </div>
      {hint && (
        <div className="lower" style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 6, maxWidth: 360, marginInline: "auto", lineHeight: 1.5 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

/** Quiet inline note. */
export function AxHint({ children }: { children: ReactNode }) {
  return (
    <div
      className="lower"
      style={{
        fontSize: 12,
        color: "var(--ink-3)",
        lineHeight: 1.55,
        padding: "12px 14px",
        border: "1px solid var(--hairline)",
        borderRadius: 12,
        background: "var(--surface-2)",
      }}
    >
      {children}
    </div>
  );
}

/** Generic row used for table-like lists. `cols` is a grid-template-columns string. */
export function AxRow({
  cols,
  head = false,
  first = false,
  children,
  style,
}: {
  cols: string;
  head?: boolean;
  first?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={head ? "lower" : undefined}
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        gap: 12,
        alignItems: "center",
        padding: "12px 18px",
        borderTop: first ? undefined : "1px solid var(--hairline)",
        fontSize: head ? 10.5 : 13,
        fontWeight: head ? 800 : undefined,
        letterSpacing: head ? "0.06em" : undefined,
        textTransform: head ? "uppercase" : undefined,
        color: head ? "var(--ink-4)" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Shared input style for control-center forms. */
export const AX_INPUT: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--hairline)",
  background: "var(--surface-2)",
  color: "var(--ink-1)",
  fontSize: 13.5,
  outline: "none",
};

export const AX_LABEL: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--ink-4)",
  marginBottom: 7,
};

export const AX_PAGE: CSSProperties = { maxWidth: 1300, margin: "0 auto", padding: "8px 0 64px" };
