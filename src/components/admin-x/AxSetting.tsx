"use client";

/**
 * AxSetting — editable control-center form that persists one Setting row. Each field maps
 * to a key on the value object; saving POSTs { resource:'setting', key, value } where value
 * is the assembled object. The server writes the Setting and an AuditEvent, so changes take
 * effect at runtime without a deploy ("configure, don't code", CLAUDE.md §4b).
 */
import { useState } from "react";
import { useAxAction } from "./useAxAction";
import { AX_INPUT, AX_LABEL } from "./AxPrimitives";

export interface AxField {
  name: string;
  label: string;
  hint?: string;
  kind?: "text" | "number";
  suffix?: string;
}

export function AxSetting({
  settingKey,
  fields,
  initial,
  saveLabel = "save",
}: {
  settingKey: string;
  fields: AxField[];
  initial: Record<string, string | number>;
  saveLabel?: string;
}) {
  const { run, busy, error } = useAxAction();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, String(initial[f.name] ?? "")])),
  );
  const [saved, setSaved] = useState(false);

  function setField(name: string, v: string) {
    setSaved(false);
    setValues((s) => ({ ...s, [name]: v }));
  }

  async function save() {
    const value: Record<string, string | number> = {};
    for (const f of fields) {
      const raw = values[f.name] ?? "";
      value[f.name] = f.kind === "number" ? Number(raw) : raw;
    }
    const res = await run({ resource: "setting", key: settingKey, value });
    if (res?.ok) setSaved(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        {fields.map((f) => (
          <div key={f.name}>
            <label style={AX_LABEL}>{f.label}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                className={f.kind === "number" ? "tnum" : undefined}
                style={AX_INPUT}
                type={f.kind === "number" ? "number" : "text"}
                value={values[f.name] ?? ""}
                onChange={(e) => setField(f.name, e.target.value)}
              />
              {f.suffix && (
                <span style={{ color: "var(--ink-3)", fontWeight: 700, flex: "0 0 auto" }}>{f.suffix}</span>
              )}
            </div>
            {f.hint && <div className="lower" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }}>{f.hint}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        {error && (
          <span className="lower" style={{ fontSize: 12, color: "#ef4444" }}>
            {error}
          </span>
        )}
        {saved && !error && (
          <span className="lower" style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>
            saved · audited · live now
          </span>
        )}
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="btn btn-grad lower"
          style={{ padding: "11px 18px", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}

export default AxSetting;
