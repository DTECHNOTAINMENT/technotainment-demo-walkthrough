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

  // Simulated live metrics (realtime chat & stats are Phase 5).
  const [viewers, setViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef<number>(0);

  const live = stream?.live ?? false;

  useEffect(() => {
    if (!live) {
      setViewers(0);
      setElapsed(0);
      return;
    }
    startedRef.current = Date.now();
    setViewers(640);
    const t = setInterval(() => {
      setViewers((v) => Math.max(420, v + Math.round((Math.random() - 0.4) * 50)));
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
    }, 1500);
    return () => clearInterval(t);
  }, [live]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  function copy(text: string, label: string) {
    void navigator.clipboard?.writeText(text);
    setMsg(`${label} copied`);
    setError(null);
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
                    uptime
                  </div>
                  <div className="tnum mono" style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                    {mmss}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                live chat
              </div>
              {live && <span className="live-pill">live</span>}
            </div>
            <div style={{ padding: 18 }}>
              <p className="lower" style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
                realtime chat and viewer stats arrive in <strong>phase 5</strong>. for now this room
                shows a simulated viewer count so you can rehearse the go-live flow end to end.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
