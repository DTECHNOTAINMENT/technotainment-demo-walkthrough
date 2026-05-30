"use client";

/**
 * SxSettings — channel identity form (name, handle, category, bio, brand colours). There's no
 * settings-write endpoint in this phase's contract, so the form is presentational: it shows the
 * current channel values and a disabled "save" (CRUD lands in a later phase).
 */
import { useState } from "react";
import { SxCard, SX_INPUT, SX_LABEL } from "./SxPrimitives";

interface Props {
  name: string;
  handle: string;
  category: string;
  bio: string;
  brand: string;
  brand2: string;
}

export function SxSettings(initial: Props) {
  const [name, setName] = useState(initial.name);
  const [handle, setHandle] = useState(initial.handle);
  const [category, setCategory] = useState(initial.category);
  const [bio, setBio] = useState(initial.bio);
  const [brand, setBrand] = useState(initial.brand);
  const [brand2, setBrand2] = useState(initial.brand2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SxCard title="brand">
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${brand}, ${brand2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: 26,
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
            <div className="lower" style={{ fontSize: 13, color: "var(--ink-3)" }}>
              {handle} · {category}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ColorPick value={brand} onChange={setBrand} />
            <ColorPick value={brand2} onChange={setBrand2} />
          </div>
        </div>
      </SxCard>

      <SxCard title="channel details">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="display name">
            <input style={SX_INPUT} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="handle">
            <input style={SX_INPUT} value={handle} onChange={(e) => setHandle(e.target.value)} />
          </Field>
          <Field label="category">
            <input style={SX_INPUT} value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <Field label="bio">
            <textarea
              style={{ ...SX_INPUT, resize: "vertical" }}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="tell people what your channel is about…"
            />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-grad lower"
              style={{ padding: "11px 20px" }}
              disabled
              title="editing channel settings lands in a later phase"
            >
              save changes
            </button>
          </div>
        </div>
      </SxCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={SX_LABEL}>{label}</label>
      {children}
    </div>
  );
}

function ColorPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="brand colour"
      style={{ width: 40, height: 40, border: "1px solid var(--hairline)", borderRadius: 10, background: "none", cursor: "pointer" }}
    />
  );
}

export default SxSettings;
