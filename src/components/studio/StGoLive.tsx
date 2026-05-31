"use client";

/**
 * StGoLive — the go-live control room. Owns encoder settings (rtmp url + stream key
 * with copy + rotate), the go-live / end-stream toggle, and a simulated live monitor
 * (viewer count + elapsed timer; realtime chat is Phase 5). Calls the streams API:
 *   POST /api/studio/streams { action:'start' | 'stop' | 'rotate', ... }
 * Mirrors prototype/v4/studio-golive.jsx.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Seg, Pill } from "@/components/studio-ui";

interface ChatMsg {
  who: string;
  msg: string;
  tier: "patch" | "lab" | "host" | null;
}

const CHAT_SEED: ChatMsg[] = [
  { who: "@oren", msg: "that low end is unreal tonight", tier: "patch" },
  { who: "@mira", msg: "what's the filter cutoff on the buchla?", tier: "lab" },
  { who: "@nia", msg: "first time catching you live", tier: null },
  { who: "@theo", msg: "patch sheet please", tier: "patch" },
  { who: "@dev", msg: "the feedback loop at 12:40", tier: "lab" },
  { who: "@hibah", msg: "tipped — keep it going!", tier: "patch" },
];
const TIER_COLOR: Record<string, string> = { patch: "#8b5cf6", lab: "#ec4899", host: "#06b6d4" };

const QUICK_ACTIONS: { label: string; icon: string }[] = [
  { label: "drop a poll", icon: "trend" },
  { label: "launch drop", icon: "bag" },
  { label: "pin a message", icon: "bookmark" },
  { label: "start raid", icon: "share" },
];

interface StreamState {
  streamId: string;
  rtmpUrl: string;
  streamKey: string;
  live: boolean;
}

interface StartResponse {
  streamId: string;
  streamKey: string;
  rtmpUrl: string;
  error?: string;
}
interface StopResponse {
  recordingVideoId: string;
  slug: string;
  error?: string;
}
interface RotateResponse {
  streamKey: string;
  error?: string;
}

export interface StGoLiveProps {
  initial: StreamState | null;
}

const inputRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  border: "1px solid var(--hairline)",
  borderRadius: 10,
  background: "var(--surface-2)",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  marginBottom: 8,
};

export function StGoLive({ initial }: StGoLiveProps) {
  const router = useRouter();
  const [stream, setStream] = useState<StreamState | null>(initial);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [visibility, setVisibility] = useState<"public" | "members" | "ppv">("public");

  // Simulated live metrics + chat (broadcaster view — local-only; realtime arrives in phase 5).
  const [viewers, setViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [earned, setEarned] = useState(0);
  const [chat, setChat] = useState<ChatMsg[]>(CHAT_SEED.slice(0, 3));
  const [draft, setDraft] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef<number>(0);

  const live = stream?.live ?? false;

  useEffect(() => {
    if (!live) {
      setViewers(0);
      setElapsed(0);
      setEarned(0);
      setChat(CHAT_SEED.slice(0, 3));
      return;
    }
    startedRef.current = Date.now();
    setViewers(840);
    const t = setInterval(() => {
      setViewers((v) => Math.max(600, v + Math.round((Math.random() - 0.4) * 60)));
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
      if (Math.random() > 0.55) {
        setChat((c) => [...c.slice(-40), CHAT_SEED[Math.floor(Math.random() * CHAT_SEED.length)]]);
      }
      if (Math.random() > 0.7) {
        setEarned((e) => e + [25, 50, 100, 250, 750][Math.floor(Math.random() * 5)]);
      }
    }, 1400);
    return () => clearInterval(t);
  }, [live]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  function copy(text: string, label: string) {
    void navigator.clipboard?.writeText(text);
    setMsg(`${label} copied`);
    setError(null);
  }

  function sendChat() {
    const text = draft.trim();
    if (!text) return;
    setChat((c) => [...c.slice(-40), { who: "@nyx", msg: text, tier: "host" }]);
    setDraft("");
  }

  async function start() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/studio/streams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "start", title: title.trim() || "live", category: category.trim() || "live" }),
      });
      const data = (await res.json()) as StartResponse;
      if (!res.ok || !data.streamId) {
        setError(data.error ?? "could not go live");
        return;
      }
      setStream({ streamId: data.streamId, rtmpUrl: data.rtmpUrl, streamKey: data.streamKey, live: true });
      setMsg("you're live!");
      router.refresh();
    } catch {
      setError("network error");
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    if (busy || !stream) return;
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/studio/streams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "stop", streamId: stream.streamId }),
      });
      const data = (await res.json()) as StopResponse;
      if (!res.ok || !data.recordingVideoId) {
        setError(data.error ?? "could not end stream");
        return;
      }
      setStream({ ...stream, live: false });
      setMsg("stream ended · recording saved to content");
      router.refresh();
    } catch {
      setError("network error");
    } finally {
      setBusy(false);
    }
  }

  async function rotate() {
    if (busy || !stream) return;
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/studio/streams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "rotate", streamId: stream.streamId }),
      });
      const data = (await res.json()) as RotateResponse;
      if (!res.ok || !data.streamKey) {
        setError(data.error ?? "could not rotate key");
        return;
      }
      setStream({ ...stream, streamKey: data.streamKey });
      setMsg("stream key rotated · update your encoder");
    } catch {
      setError("network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* header / primary action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>
            creator studio
          </div>
          <h1 className="lower" style={{ margin: 0, fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, display: "flex", alignItems: "center", gap: 12 }}>
            {live ? "live control room" : "go live"}
            {live && <span className="live-pill">live</span>}
          </h1>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>
            {live ? "you're broadcasting. monitor health and earnings here." : "set up your stream, then start broadcasting from your encoder."}
          </div>
        </div>
        {live ? (
          <button type="button" onClick={() => void stop()} disabled={busy} className="btn btn-glass lower" style={{ padding: "12px 18px", color: "var(--bg-red)", borderColor: "rgba(239,68,68,0.3)", opacity: busy ? 0.5 : 1 }}>
            {busy ? "ending…" : "end stream"}
          </button>
        ) : (
          <button type="button" onClick={() => void start()} disabled={busy} className="btn btn-grad lower" style={{ padding: "12px 22px", opacity: busy ? 0.5 : 1 }}>
            {busy ? "starting…" : "go live"}
          </button>
        )}
      </div>

      {(msg || error) && (
        <div className="lower" style={{ marginBottom: 14, fontSize: 12.5, color: error ? "var(--bg-red)" : "var(--ink-3)" }}>
          {error ?? msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 360px)", gap: 16, alignItems: "start" }}>
        {/* LEFT — preview + setup */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* preview / monitor */}
          <div
            style={{
              position: "relative",
              aspectRatio: "16 / 9",
              borderRadius: 14,
              overflow: "hidden",
              background: "linear-gradient(135deg, #1a1730, #0e0c1a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--hairline)",
            }}
          >
            {live ? (
              <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
                <span className="live-pill">live</span>
                <span className="tnum" style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                  {viewers.toLocaleString("en-GB")} watching
                </span>
                <span className="mono tnum" style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                  {mmss}
                </span>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.85)" }}>
                <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
                  preview · waiting for signal
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>connect your encoder, then go live</div>
              </div>
            )}
            {live && (
              <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span className="lower" style={{ fontSize: 12, fontWeight: 700, color: "white" }}>
                  {title || "your stream"}
                </span>
                <span className="lower" style={{ marginLeft: "auto", fontSize: 11, color: "white", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} /> 1080p60 · healthy
                </span>
              </div>
            )}
          </div>

          {!live && (
            <section className="card" style={{ background: "var(--surface)" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
                <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                  stream setup
                </div>
              </div>
              <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle} className="lower">
                    title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="tonight's stream"
                    style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid var(--hairline)", background: "var(--surface-2)", color: "var(--ink-1)", fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={labelStyle} className="lower">
                    category
                  </label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. modular synth"
                    style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: "1px solid var(--hairline)", background: "var(--surface-2)", color: "var(--ink-1)", fontSize: 13.5, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle} className="lower">
                    visibility
                  </label>
                  <Seg
                    items={[
                      { id: "public", label: "public" },
                      { id: "members", label: "members only" },
                      { id: "ppv", label: "ppv ticket" },
                    ]}
                    value={visibility}
                    onChange={(v) => setVisibility(v as "public" | "members" | "ppv")}
                  />
                </div>
              </div>
            </section>
          )}

          {/* encoder connection */}
          <section className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                encoder connection
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>point OBS / Streamlabs at these</div>
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle} className="lower">
                  server (rtmp)
                </label>
                <div style={inputRow}>
                  <span className="mono" style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {stream?.rtmpUrl ?? "available once you go live"}
                  </span>
                  {stream && (
                    <button type="button" onClick={() => copy(stream.rtmpUrl, "server url")} className="btn btn-glass lower" style={{ padding: "6px 11px", fontSize: 12 }}>
                      copy
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle} className="lower">
                  stream key
                </label>
                <div style={inputRow}>
                  <span className="mono" style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {stream ? (showKey ? stream.streamKey : "•••• •••• •••• ••••") : "available once you go live"}
                  </span>
                  {stream && (
                    <>
                      <button type="button" onClick={() => setShowKey((k) => !k)} className="btn btn-glass lower" style={{ padding: "6px 11px", fontSize: 12 }}>
                        {showKey ? "hide" : "show"}
                      </button>
                      <button type="button" onClick={() => copy(stream.streamKey, "stream key")} className="btn btn-glass lower" style={{ padding: "6px 11px", fontSize: 12 }}>
                        copy
                      </button>
                    </>
                  )}
                </div>
                {stream && (
                  <button type="button" onClick={() => void rotate()} disabled={busy} className="btn btn-glass lower" style={{ marginTop: 10, padding: "8px 13px", fontSize: 12, opacity: busy ? 0.5 : 1 }}>
                    rotate key
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT — live stats + chat placeholder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {live && (
            <section className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
              <div className="brand-hairline" />
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div className="lower" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                    watching now
                  </div>
                  <div className="tnum" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                    {viewers.toLocaleString("en-GB")}
                  </div>
                </div>
                <div>
                  <div className="lower" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                    earned this stream
                  </div>
                  <div className="tnum" style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: "#10b981" }}>
                    {earned.toLocaleString("en-GB")} <span className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
                  </div>
                </div>
                <div>
                  <div className="lower" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                    uptime
                  </div>
                  <div className="tnum mono" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                    {mmss}
                  </div>
                </div>
                <div>
                  <div className="lower" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                    new followers
                  </div>
                  <div className="tnum" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                    +{Math.floor(elapsed / 4)}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* live chat */}
          <section className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                  live chat
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {live ? `${viewers.toLocaleString("en-GB")} watching` : "starts when you go live"}
                </div>
              </div>
              {live && <Pill tone="live">live</Pill>}
            </div>
            <div
              ref={chatRef}
              style={{ padding: "10px 14px", height: live ? 360 : 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9 }}
            >
              {!live && (
                <div className="st-hint" style={{ margin: 8 }}>
                  your chat will appear here. moderators, slow-mode and members-only chat are
                  configurable in <strong>settings → moderation</strong>.
                </div>
              )}
              {live &&
                chat.map((m, i) => (
                  <div key={i} style={{ fontSize: 12.5, lineHeight: 1.4, animation: "slideIn 0.25s ease-out" }}>
                    <span style={{ fontWeight: 800, color: m.tier ? TIER_COLOR[m.tier] : "var(--ink-2)" }}>{m.who}</span>
                    {m.tier && (
                      <span
                        style={{ fontSize: 9, marginLeft: 5, padding: "1px 5px", borderRadius: 4, background: TIER_COLOR[m.tier], color: "white", fontWeight: 800, textTransform: "uppercase" }}
                      >
                        {m.tier}
                      </span>
                    )}
                    <span style={{ color: "var(--ink-2)", marginLeft: 6 }}>{m.msg}</span>
                  </div>
                ))}
            </div>
            {live && (
              <div style={{ padding: 12, borderTop: "1px solid var(--hairline)", display: "flex", gap: 8 }}>
                <input
                  className="st-input"
                  placeholder="say something to your room…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendChat();
                  }}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={sendChat} className="btn btn-grad" style={{ padding: "0 14px" }} aria-label="send">
                  <Icon name="arrowR" size={15} stroke={2.4} />
                </button>
              </div>
            )}
          </section>

          {/* quick actions */}
          {live && (
            <section className="card" style={{ background: "var(--surface)" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
                <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                  quick actions
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>run the room without leaving the stream</div>
              </div>
              <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => {
                      setMsg(`${a.label} · coming up`);
                      setError(null);
                    }}
                    className="btn btn-glass lower"
                    style={{ padding: 12, justifyContent: "flex-start", fontSize: 12.5 }}
                  >
                    <Icon name={a.icon} size={15} stroke={2.2} /> {a.label}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
