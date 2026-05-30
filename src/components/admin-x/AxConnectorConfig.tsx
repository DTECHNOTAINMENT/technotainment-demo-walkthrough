"use client";

import { useState } from "react";
import { useAxAction } from "./useAxAction";

/**
 * Add-keys / enable form for one connector (configure, don't code). The owner pastes the
 * provider's keys here and toggles it on; they're saved to the DB and read at runtime, so the
 * connector goes live with no env var and no redeploy. Keys already on file show as "set".
 */
export function AxConnectorConfig({
  id,
  envKeys,
  enabled,
  filled,
  status,
}: {
  id: string;
  envKeys: string[];
  enabled: boolean;
  filled: string[];
  status: "live" | "mock";
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [on, setOn] = useState(enabled);
  const { run, busy, error } = useAxAction();

  async function save() {
    await run({ resource: "connector", action: "configure", id, enabled: on, credentials: values });
    setValues({});
  }

  return (
    <div style={{ marginTop: 8 }}>
      <button
        type="button"
        className="btn btn-glass lower"
        style={{ padding: "6px 10px", fontSize: 12 }}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? "hide keys" : status === "live" ? "edit keys" : "add keys"}
      </button>

      {open && (
        <div className="card" style={{ marginTop: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {envKeys.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>no keys required — just enable.</div>
          )}
          {envKeys.map((k) => (
            <label key={k} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {k} {filled.includes(k) && <span style={{ color: "var(--ink-4)" }}>· set</span>}
              </span>
              <input
                type="password"
                autoComplete="off"
                placeholder={filled.includes(k) ? "•••••• (leave blank to keep)" : "paste key"}
                value={values[k] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 8,
                  padding: "7px 10px",
                  fontSize: 12,
                  outline: "none",
                }}
              />
            </label>
          ))}

          <label className="lower" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginTop: 2 }}>
            <span className={`tg${on ? " on" : ""}`} onClick={() => setOn((v) => !v)} role="switch" aria-checked={on} />
            enable this connector (go live)
          </label>

          {error && <div style={{ color: "var(--bg-red)", fontSize: 12 }}>{error}</div>}

          <button type="button" className="btn btn-grad" style={{ padding: "8px 12px" }} disabled={busy} onClick={save}>
            {busy ? "saving…" : "save"}
          </button>
        </div>
      )}
    </div>
  );
}
