"use client";

// Settings interactive bits — timezone + region/jurisdiction selects and a "data & privacy"
// section (export my data / delete account). There's no settings-persistence API in scope, so
// selects keep local state and the data actions are honest confirm-dialog stubs (no destructive
// call). Matches the prototype's lowercase voice and card styling.
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const TIMEZONES = [
  "Europe/London",
  "Europe/Berlin",
  "Europe/Madrid",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const REGIONS: [string, string][] = [
  ["gb", "united kingdom"],
  ["eu", "european union"],
  ["us", "united states"],
  ["ca", "canada"],
  ["au", "australia"],
  ["other", "elsewhere"],
];

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  background: "var(--surface-2)",
  border: "1px solid var(--hairline)",
  color: "var(--ink-1)",
  fontSize: 13,
};

export function SettingsControls() {
  const [tz, setTz] = useState("Europe/London");
  const [region, setRegion] = useState("gb");
  const [exported, setExported] = useState(false);

  function requestExport() {
    setExported(true);
    window.setTimeout(() => setExported(false), 4000);
  }

  function confirmDelete() {
    const ok = window.confirm(
      "delete account?\n\nthis would permanently remove your profile, library and wallet history. (demo: no data is actually deleted.)"
    );
    if (ok) window.alert("account deletion requested. our team will confirm by email within 7 days.");
  }

  return (
    <>
      <section className="card" style={{ padding: 18, background: "var(--surface)" }}>
        <div className="lower" style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
          preferences
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "block" }}>
            <span className="mono lower" style={{ fontSize: 10, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>
              timezone
            </span>
            <select value={tz} onChange={(e) => setTz(e.target.value)} className="lower" style={selectStyle} aria-label="timezone">
              {TIMEZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "block" }}>
            <span className="mono lower" style={{ fontSize: 10, color: "var(--ink-3)", display: "block", marginBottom: 6 }}>
              region / jurisdiction
            </span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="lower" style={selectStyle} aria-label="region / jurisdiction">
              {REGIONS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="lower" style={{ fontSize: 11, color: "var(--ink-4)", margin: 0 }}>
            sets your local times and the rules &amp; taxes we apply. demo only — not yet persisted.
          </p>
        </div>
      </section>

      <section className="card" style={{ padding: 18, background: "var(--surface)" }}>
        <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
          data &amp; privacy
        </div>
        <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, marginBottom: 12 }}>
          you control your data. export a copy any time, or close your account.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" onClick={requestExport} className="btn btn-glass lower" style={{ padding: "9px 14px", fontSize: 12 }}>
            <Icon name="share" size={13} stroke={2.2} /> {exported ? "export requested" : "export my data"}
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="lower"
            style={{ padding: "9px 14px", fontSize: 12, borderRadius: 10, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Icon name="close" size={13} stroke={2.2} /> delete account
          </button>
        </div>
        {exported && (
          <p className="lower" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 10 }}>
            we&rsquo;ll email you a download link when your export is ready.
          </p>
        )}
      </section>
    </>
  );
}
