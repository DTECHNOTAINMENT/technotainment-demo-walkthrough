"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Live chat + viewer counter (Phase 5). Polls /api/live/:streamId for messages + count and
// sends a presence heartbeat; posts messages back. Polling keeps it portable (no WS server);
// the same API can be upgraded to SSE/WebSocket later with no UI change.
interface Msg {
  id: string;
  user: string;
  text: string;
  at: number;
}

export function LiveChat({ streamId, signedIn: signedInProp }: { streamId: string; signedIn?: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [viewers, setViewers] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean>(signedInProp ?? false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Self-determine auth when not told, so SEO/ISR pages can embed this without going dynamic.
  useEffect(() => {
    if (signedInProp !== undefined) return;
    fetch("/api/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { signedIn?: boolean }) => setSignedIn(!!d.signedIn))
      .catch(() => {});
  }, [signedInProp]);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${streamId}`, { cache: "no-store" });
      const data = (await res.json()) as { messages: Msg[]; viewers: number };
      setMessages(data.messages ?? []);
      setViewers(data.viewers ?? 0);
    } catch {
      /* transient */
    }
  }, [streamId]);

  useEffect(() => {
    poll();
    const t = setInterval(poll, 3000);
    // presence heartbeat (also bumps the live viewer count)
    const beat = () =>
      signedIn &&
      fetch(`/api/live/${streamId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ heartbeat: true }),
      }).catch(() => {});
    beat();
    const h = setInterval(beat, 15000);
    return () => {
      clearInterval(t);
      clearInterval(h);
    };
  }, [poll, streamId, signedIn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    const res = await fetch(`/api/live/${streamId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setText("");
      poll();
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "couldn't send");
    }
  }

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: 360, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <span className="lower" style={{ fontWeight: 800, fontSize: 13 }}>
          live chat
        </span>
        <span className="live-pill">
          <span className="tnum">{viewers}</span> watching
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.length === 0 && <div style={{ color: "var(--ink-4)", fontSize: 13 }}>be the first to say something.</div>}
        {messages.map((m) => (
          <div key={m.id} style={{ fontSize: 13, lineHeight: 1.4 }}>
            <span className="brand-grad-text" style={{ fontWeight: 700 }}>
              {m.user}
            </span>{" "}
            <span style={{ color: "var(--ink-2)" }}>{m.text}</span>
          </div>
        ))}
      </div>

      {error && <div style={{ color: "var(--bg-red)", fontSize: 12, padding: "0 14px 6px" }}>{error}</div>}

      {signedIn ? (
        <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid var(--hairline)" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="say something…"
            maxLength={280}
            style={{
              flex: 1,
              background: "var(--surface-2)",
              border: "1px solid var(--hairline)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              outline: "none",
            }}
          />
          <button type="submit" className="btn btn-grad" style={{ padding: "8px 14px" }}>
            send
          </button>
        </form>
      ) : (
        <div style={{ padding: 12, borderTop: "1px solid var(--hairline)", textAlign: "center", fontSize: 13 }}>
          <a href="/sign-in" className="brand-grad-text" style={{ fontWeight: 700 }}>
            sign in
          </a>{" "}
          to chat
        </div>
      )}
    </div>
  );
}
