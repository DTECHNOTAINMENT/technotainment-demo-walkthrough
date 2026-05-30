"use client";

/**
 * AxConnectorToggle — set a connector's status (live / beta / off). A segmented
 * 3-way control; each pick POSTs { resource:'connector', id, status } and re-reads.
 */
import { useState } from "react";
import { useAxAction } from "./useAxAction";

type Status = "live" | "beta" | "off";
const ORDER: Status[] = ["live", "beta", "off"];
const TONE: Record<Status, string> = { live: "#10b981", beta: "#8b5cf6", off: "var(--ink-4)" };

export function AxConnectorToggle({ id, status }: { id: string; status: Status }) {
  const { run, busy, error } = useAxAction();
  const [current, setCurrent] = useState<Status>(status);

  async function set(next: Status) {
    if (next === current || busy) return;
    const prev = current;
    setCurrent(next); // optimistic
    const res = await run({ resource: "connector", id, status: next });
    if (!res) setCurrent(prev);
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <span
        role="group"
        aria-label="connector status"
        style={{
          display: "inline-flex",
          padding: 2,
          borderRadius: 999,
          background: "var(--surface-2)",
          border: "1px solid var(--hairline)",
          opacity: busy ? 0.65 : 1,
        }}
      >
        {ORDER.map((s) => {
          const active = current === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => void set(s)}
              disabled={busy}
              className="lower"
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                cursor: busy ? "default" : "pointer",
                background: active ? "var(--surface)" : "transparent",
                color: active ? TONE[s] : "var(--ink-4)",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.18)" : undefined,
              }}
            >
              {s}
            </button>
          );
        })}
      </span>
      {error && (
        <span className="lower" style={{ fontSize: 10, color: "#ef4444" }}>
          {error}
        </span>
      )}
    </span>
  );
}

export default AxConnectorToggle;
