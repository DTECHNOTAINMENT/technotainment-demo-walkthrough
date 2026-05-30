/* Creator Studio — Go Live control room */
(() => {
const { useState, useEffect, useRef } = React;
const { Icon, Avatar, formatNum, STUDIO, StudioCard, StudioPageHead, Pill } = window;

const CHAT_SEED = [
  { who: "@oren",  msg: "that low end is unreal tonight", tier: "patch" },
  { who: "@mira",  msg: "what's the filter cutoff on the buchla?", tier: "lab" },
  { who: "@nia",   msg: "first time catching you live 👋", tier: null },
  { who: "@theo",  msg: "patch sheet please 🙏", tier: "patch" },
  { who: "@dev",   msg: "the feedback loop at 12:40 😮", tier: "lab" },
  { who: "@hibah", msg: "tipped — keep it going!", tier: "patch" },
];
const TIER_COLOR = { patch: "#8b5cf6", lab: "#ec4899" };

const GoLiveScreen = ({ live, setLive, toast }) => {
  const s = STUDIO;
  const [title, setTitle] = useState("night session #14 · modular");
  const [cat, setCat] = useState("modular synth");
  const [vis, setVis] = useState("public");
  const [showKey, setShowKey] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [chat, setChat] = useState(CHAT_SEED.slice(0, 3));
  const [earned, setEarned] = useState(0);
  const chatRef = useRef(null);

  // Simulate live metrics
  useEffect(() => {
    if (!live) { setViewers(0); setElapsed(0); setEarned(0); return; }
    setViewers(840);
    const t = setInterval(() => {
      setViewers(v => Math.max(600, v + Math.round((Math.random() - 0.4) * 60)));
      setElapsed(e => e + 1);
      if (Math.random() > 0.55) {
        setChat(c => [...c.slice(-40), CHAT_SEED[Math.floor(Math.random() * CHAT_SEED.length)]]);
      }
      if (Math.random() > 0.7) setEarned(e => e + [25, 50, 100, 250, 750][Math.floor(Math.random() * 5)]);
    }, 1400);
    return () => clearInterval(t);
  }, [live]);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chat]);

  const mmss = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  const copy = (text, label) => { navigator.clipboard?.writeText(text); toast(`${label} copied`); };

  return (
    <div className="page-pad" style={{ maxWidth: 1500, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title={live ? "live control room" : "go live"}
        sub={live ? "you're broadcasting. monitor chat, health and earnings in real time." : "set up your stream, then start broadcasting from your encoder or in-browser."}
        actions={live
          ? <button onClick={() => { setLive(false); toast("stream ended · recording saved to content"); }} className="btn btn-glass" style={{ padding: "12px 18px", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}><Icon name="close" size={15} stroke={2.6} /> end stream</button>
          : <button onClick={() => { setLive(true); toast("you're live!", { icon: true }); }} className="btn btn-grad" style={{ padding: "12px 22px" }}><Icon name="flame" size={15} stroke={2.4} /> start broadcast</button>}
      />

      <div className="st-split">
        {/* LEFT — preview + setup */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="stream-preview">
            <div className="bars">{Array.from({ length: 13 }).map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.08}s`, height: `${20 + (i % 5) * 14}%` }} />)}</div>
            {live ? (
              <>
                <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
                  <span className="onair">on air</span>
                  <span style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800, backdropFilter: "blur(6px)", display: "inline-flex", alignItems: "center", gap: 6 }} className="tnum"><Icon name="eye" size={13} stroke={2.4} /> {formatNum(viewers)}</span>
                  <span style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 11px", borderRadius: 999, fontSize: 12, fontWeight: 800, backdropFilter: "blur(6px)" }} className="mono tnum">{mmss}</span>
                </div>
                <div className="player-bar" style={{ background: "linear-gradient(180deg,transparent,rgba(0,0,0,0.7))" }}>
                  <Icon name="cast" size={18} /> <span style={{ fontSize: 12, fontWeight: 700 }} className="lower">{title}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, display: "inline-flex", alignItems: "center", gap: 6 }} className="lower"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} /> 1080p60 · 6.2 mbps · healthy</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.85)", position: "relative", zIndex: 2 }}>
                <Icon name="cast" size={40} stroke={1.6} />
                <div style={{ fontWeight: 800, fontSize: 16, marginTop: 10 }} className="lower">preview · waiting for signal</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>connect your encoder or start in-browser capture</div>
              </div>
            )}
          </div>

          {!live && (
            <StudioCard title="stream setup">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="st-label">title</label>
                  <input className="st-input" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="st-split-even">
                  <div>
                    <label className="st-label">category</label>
                    <input className="st-input" value={cat} onChange={(e) => setCat(e.target.value)} />
                  </div>
                  <div>
                    <label className="st-label">visibility</label>
                    <select className="st-input" value={vis} onChange={(e) => setVis(e.target.value)}>
                      <option value="public">public</option>
                      <option value="members">members only</option>
                      <option value="ppv">ppv ticket</option>
                    </select>
                  </div>
                </div>
              </div>
            </StudioCard>
          )}

          <StudioCard title="encoder connection" sub="point OBS / Streamlabs here, or capture in-browser">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="st-label">server (rtmp)</label>
                <div className="copy-field">
                  <span className="val">rtmp://ingest.technotainment.fm/live</span>
                  <button onClick={() => copy("rtmp://ingest.technotainment.fm/live", "server url")} style={{ color: "var(--ink-2)" }}><Icon name="share" size={15} /></button>
                </div>
              </div>
              <div>
                <label className="st-label">stream key</label>
                <div className="copy-field">
                  <span className="val">{showKey ? "live_nyx_8f3a-21bd-44ce-9920" : "•••• •••• •••• ••••"}</span>
                  <button onClick={() => setShowKey(k => !k)} style={{ color: "var(--ink-2)" }}><Icon name="eye" size={15} /></button>
                  <button onClick={() => copy("live_nyx_8f3a-21bd-44ce-9920", "stream key")} style={{ color: "var(--ink-2)" }}><Icon name="share" size={15} /></button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toast("stream key reset · update your encoder")} className="btn btn-glass" style={{ padding: "9px 13px", fontSize: 12 }}>reset key</button>
                <button onClick={() => toast("in-browser capture · camera & mic")} className="btn btn-glass" style={{ padding: "9px 13px", fontSize: 12 }}><Icon name="cast" size={13} /> capture in browser</button>
              </div>
            </div>
          </StudioCard>
        </div>

        {/* RIGHT — live stats + chat */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {live && (
            <div className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
              <div className="brand-hairline" />
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { l: "watching now", v: formatNum(viewers), c: "var(--ink-1)" },
                  { l: "earned this stream", v: formatNum(earned), c: "#10b981", suf: "CAST" },
                  { l: "new followers", v: "+" + Math.floor(elapsed / 4), c: "var(--ink-1)" },
                  { l: "chat / min", v: Math.round(28 + Math.random() * 20), c: "var(--ink-1)" },
                ].map((k, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{k.l}</div>
                    <div className="tnum" style={{ fontSize: 24, fontWeight: 800, color: k.c, marginTop: 4 }}>{k.v} {k.suf && <span style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{k.suf}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <StudioCard
            title="live chat"
            sub={live ? `${formatNum(viewers)} watching` : "starts when you go live"}
            action={live && <Pill tone="live">live</Pill>}
            pad={false}>
            <div ref={chatRef} style={{ padding: "10px 14px", height: live ? 420 : 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9 }}>
              {!live && <div className="st-hint" style={{ margin: 8 }}>your chat will appear here. moderators, slow-mode and members-only chat are configurable in <strong>settings → moderation</strong>.</div>}
              {live && chat.map((m, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.4, animation: "slideIn 0.25s ease-out" }}>
                  <span style={{ fontWeight: 800, color: m.tier ? TIER_COLOR[m.tier] : "var(--ink-2)" }}>{m.who}</span>
                  {m.tier && <span style={{ fontSize: 9, marginLeft: 5, padding: "1px 5px", borderRadius: 4, background: TIER_COLOR[m.tier], color: "white", fontWeight: 800, textTransform: "uppercase" }}>{m.tier}</span>}
                  <span style={{ color: "var(--ink-2)", marginLeft: 6 }}>{m.msg}</span>
                </div>
              ))}
            </div>
            {live && (
              <div style={{ padding: 12, borderTop: "1px solid var(--hairline)", display: "flex", gap: 8 }}>
                <input className="st-input" placeholder="say something to your room…" style={{ flex: 1 }} />
                <button onClick={() => toast("sent")} className="btn btn-grad" style={{ padding: "0 14px" }}><Icon name="send" size={15} /></button>
              </div>
            )}
          </StudioCard>

          {live && (
            <StudioCard title="quick actions" sub="run the room without leaving the stream">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { l: "drop a poll", i: "trend" },
                  { l: "launch drop", i: "bag" },
                  { l: "pin a message", i: "bookmark" },
                  { l: "start raid", i: "share" },
                ].map(a => (
                  <button key={a.l} onClick={() => toast(`${a.l} · coming up`)} className="btn btn-glass" style={{ padding: "12px", justifyContent: "flex-start", fontSize: 12.5 }}>
                    <Icon name={a.i} size={15} stroke={2.2} /> {a.l}
                  </button>
                ))}
              </div>
            </StudioCard>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { GoLiveScreen });
})();
