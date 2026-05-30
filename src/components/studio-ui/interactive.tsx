"use client";

// Studio/Admin interactive primitives (client components).
// Seg ported verbatim from prototype/v4/studio-shared.jsx; Toggle/CopyField/Dropzone
// are faithful ports of the `.tg` / `.copy-field` / `.dropzone` markup used by
// admin-settings.jsx, admin-controls.jsx, studio upload/stream-key screens.
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export interface SegItem {
  id: string;
  label: ReactNode;
}

/** Segmented control / tabs. Controlled: pass value + onChange(id). */
export function Seg({
  items,
  value,
  onChange,
}: {
  items: SegItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 3,
        background: "var(--surface-2)",
        borderRadius: 12,
        border: "1px solid var(--hairline)",
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          style={{
            padding: "7px 14px",
            borderRadius: 9,
            fontSize: 12.5,
            fontWeight: 700,
            transition: "all 0.15s ease",
            background: value === it.id ? "var(--surface)" : "transparent",
            color: value === it.id ? "var(--ink-1)" : "var(--ink-3)",
            boxShadow: value === it.id ? "var(--shadow-card)" : "none",
          }}
          className="lower"
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Toggle switch using the `.tg` class. Controlled: on + onChange(next). */
export function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange?: (next: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      className={`tg${on ? " on" : ""}`}
      onClick={() => onChange?.(!on)}
      style={{ border: "none", padding: 0 }}
    />
  );
}

/** Read-only copy field (stream key, API key, webhook secret) using `.copy-field`. */
export function CopyField({
  value,
  mono = true,
  style,
}: {
  value: string;
  mono?: boolean;
  style?: CSSProperties;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="copy-field" style={style}>
      <span className={mono ? "val mono" : "val"}>{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label="copy"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          color: copied ? "#10b981" : "var(--ink-3)",
          fontSize: 11,
          fontWeight: 700,
          flex: "0 0 auto",
        }}
        className="lower"
      >
        <Icon name={copied ? "check" : "share"} size={13} stroke={2.4} />
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

/** Upload dropzone placeholder using `.dropzone`. Calls onFiles with the picked files. */
export function Dropzone({
  title = "drop a file or click to upload",
  sub,
  icon = "film",
  accept,
  onFiles,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  icon?: string;
  accept?: string;
  onFiles?: (files: FileList) => void;
}) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      className={`dropzone${drag ? " drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files?.length) onFiles?.(e.dataTransfer.files);
      }}
      style={{ display: "block" }}
    >
      <input
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles?.(e.target.files);
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          color: "var(--ink-3)",
        }}
      >
        <Icon name={icon} size={28} stroke={2} />
        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--ink-2)" }} className="lower">
          {title}
        </div>
        {sub && <div style={{ fontSize: 12, color: "var(--ink-4)" }}>{sub}</div>}
      </div>
    </label>
  );
}
