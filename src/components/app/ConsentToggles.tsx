"use client";

import { useState } from "react";

export type ConsentScope = "watchHistory" | "chatMessages" | "tipsPurchases" | "marketingEmail";

export interface ConsentRow {
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  brand: string;
  brand2: string;
  watchHistory: boolean;
  chatMessages: boolean;
  tipsPurchases: boolean;
  marketingEmail: boolean;
}

const SCOPES: { id: ConsentScope; label: string; desc: string; required?: boolean }[] = [
  { id: "watchHistory", label: "watch history", desc: "what you watched, when, for how long" },
  { id: "chatMessages", label: "chat messages", desc: "your messages in their live rooms" },
  {
    id: "tipsPurchases",
    label: "tips & purchases",
    desc: "what you spent CAST on (required for receipts)",
    required: true,
  },
  {
    id: "marketingEmail",
    label: "marketing email",
    desc: "creator can email you about drops, shows, courses",
  },
];

function Row({ initial }: { initial: ConsentRow }) {
  const [state, setState] = useState<Record<ConsentScope, boolean>>({
    watchHistory: initial.watchHistory,
    chatMessages: initial.chatMessages,
    tipsPurchases: initial.tipsPurchases,
    marketingEmail: initial.marketingEmail,
  });
  const [pending, setPending] = useState<ConsentScope | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function flip(scope: ConsentScope) {
    if (pending) return;
    const next = !state[scope];
    setState((s) => ({ ...s, [scope]: next })); // optimistic
    setPending(scope);
    setError(null);
    try {
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ creatorId: initial.creatorId, scope, value: next }),
      });
      if (!res.ok) throw new Error("save failed");
    } catch {
      setState((s) => ({ ...s, [scope]: !next })); // revert
      setError("couldn't save — try again");
    } finally {
      setPending(null);
    }
  }

  const onCount = SCOPES.filter((s) => state[s.id]).length;

  return (
    <div style={{ borderTop: "1px solid var(--hairline)" }}>
      <div style={{ padding: "14px 18px", display: "flex", gap: 12, alignItems: "center" }}>
        <span
          aria-hidden
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            flex: "0 0 38px",
            background: `linear-gradient(135deg, ${initial.brand}, ${initial.brand2})`,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{initial.creatorHandle}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">
            {onCount} of {SCOPES.length} permissions on · {initial.creatorName}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {SCOPES.map((k) => (
          <div
            key={k.id}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              padding: "10px 14px",
              background: "var(--surface-2)",
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }} className="lower">
                {k.label}
                {k.required && (
                  <span
                    className="mono"
                    style={{
                      fontSize: 9,
                      color: "var(--ink-4)",
                      marginLeft: 8,
                      padding: "2px 6px",
                      border: "1px solid var(--hairline)",
                      borderRadius: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    required
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{k.desc}</div>
            </div>
            <button
              type="button"
              aria-pressed={state[k.id]}
              aria-label={`${state[k.id] ? "disable" : "enable"} ${k.label} for ${initial.creatorHandle}`}
              disabled={k.required || pending === k.id}
              onClick={() => !k.required && flip(k.id)}
              className={`tg${state[k.id] ? " on" : ""}`}
              style={{
                border: "none",
                padding: 0,
                opacity: k.required ? 0.6 : pending === k.id ? 0.7 : 1,
                cursor: k.required ? "not-allowed" : "pointer",
              }}
            />
          </div>
        ))}
        {error && (
          <div style={{ fontSize: 11, color: "var(--live)" }} className="lower">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Per-creator consent toggles. Each scope flip POSTs /api/consent (optimistic, reverts on
 * error). Consent is owned by the viewer and scoped per creator — the prototype's privacy model.
 */
export function ConsentToggles({ rows }: { rows: ConsentRow[] }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: "28px 18px", color: "var(--ink-3)", fontSize: 13 }} className="lower">
        no creators yet. follow a creator to manage what you share with them.
      </div>
    );
  }
  return (
    <div>
      {rows.map((r) => (
        <Row key={r.creatorId} initial={r} />
      ))}
    </div>
  );
}
