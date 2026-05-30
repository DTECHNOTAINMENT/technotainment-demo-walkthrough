/* v2 Live Watch — theatre-dark surface, chat, commerce rail, live ledger pulse */
(() => {
const { useState, useEffect, useRef } = React;
const { Icon, Avatar, LiveBadge, ViewerBadge, Thumb, CastGlyph, formatNum, LIVE_PAGE } = window;

const LiveWatchScreen = ({ wallet, ledger, onLedgerAdd, onOpenTip, onOpenCompete, onOpenMicroCast, onOpenDrop, onOpenGift, setRoute, toast }) => {
  const data = LIVE_PAGE;
  const [following, setFollowing] = useState(false);
  const [draft, setDraft] = useState("");
  const [fs, setFs] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chat, setChat] = useState([
    { who: "@oren",   text: "holding their line beautifully, ref needs to call that next one"},
    { who: "@hibah",  text: "SUB THE RIGHT BACK ALREADY" },
    { who: "@theo",   text: "2-1 atlas, calling it now, who's in?" },
    { who: "@nia",    text: "that third kit looks UNREAL on stream" },
    { who: "@aaron",  text: "TACKLE OF THE SEASON HOLY" },
    { who: "@bea",    text: "counter incoming, watch the left wing" },
    { who: "@jules",  text: "northgate keeper is shaking lol" },
    { who: "@mira",   text: "who's coming up to the away end for next week?" },
  ]);
  const tipBtnRef = useRef(null);
  const fsTipRef  = useRef(null);
  const fsSubRef  = useRef(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeTimer = useRef(null);
  const [dropPeek, setDropPeek] = useState(true);
  // Normal-mode auto-fade chrome (player + top bar fade together on idle)
  const [playerChrome, setPlayerChrome] = useState(true);
  const playerChromeTimer = useRef(null);
  // Description collapse
  const [descExpanded, setDescExpanded] = useState(false);
  // Chat header controls
  const [chatSort, setChatSort] = useState("live");
  const [chatSortOpen, setChatSortOpen] = useState(false);

  // Auto-fade page chrome (top bar + player chrome) on idle when NOT fullscreen
  useEffect(() => {
    if (fs) return;
    const wake = () => {
      setPlayerChrome(true);
      clearTimeout(playerChromeTimer.current);
      playerChromeTimer.current = setTimeout(() => setPlayerChrome(false), 2500);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      clearTimeout(playerChromeTimer.current);
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("touchstart", wake);
    };
  }, [fs]);

  // Native fullscreen sync — mirror ESC-driven exit
  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement && fs) setFs(false); };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [fs]);

  // Chrome auto-fade in fullscreen
  useEffect(() => {
    if (!fs) return;
    setChromeVisible(true); setDropPeek(true);
    const wake = () => {
      setChromeVisible(true);
      clearTimeout(chromeTimer.current);
      chromeTimer.current = setTimeout(() => setChromeVisible(false), 2500);
    };
    wake();
    const peekTimer = setTimeout(() => setDropPeek(false), 9000);
    document.addEventListener("mousemove", wake);
    document.addEventListener("touchstart", wake);
    return () => {
      clearTimeout(chromeTimer.current);
      clearTimeout(peekTimer);
      document.removeEventListener("mousemove", wake);
      document.removeEventListener("touchstart", wake);
    };
  }, [fs]);

  const toggleFs = async () => {
    if (!fs) {
      setFs(true);
      try { await document.documentElement.requestFullscreen?.(); } catch {}
    } else {
      try { if (document.fullscreenElement) await document.exitFullscreen?.(); } catch {}
      setFs(false);
    }
  };

  // Periodic synthetic ledger pulse — keeps the room alive
  useEffect(() => {
    const handles = ["@bea","@quinn","@mira","@jules","@axel","@romy","@samir","@dev","@kira","@theo"];
    const amounts = [5, 10, 10, 25, 25, 50, 100, 250];
    const t = setInterval(() => {
      if (Math.random() > 0.4) {
        const amt = amounts[Math.floor(Math.random() * amounts.length)];
        const who = handles[Math.floor(Math.random() * handles.length)];
        onLedgerAdd({ who, amount: amt, kind: amt > 100 && Math.random() > 0.7 ? "gift" : "tip", note: amt > 100 ? "subs gifted" : undefined });
      }
    }, 2800);
    return () => clearInterval(t);
  }, [onLedgerAdd]);
  const sendChat = (e) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    setChat(c => [...c, { who: "@you", text: draft.trim() }]);
    setDraft("");
  };

  // Theatre-dark — force dark vars on this screen even when day theme is on (with override).
  const [matchTheme, setMatchTheme] = useState(false);
  const themeStyle = matchTheme ? {} : {
    "--bg": "#0B0B12", "--surface": "#15151F", "--surface-2": "#1F1F2C", "--surface-3": "#2A2A38",
    "--hairline": "rgba(255,255,255,0.08)", "--hairline-2": "rgba(255,255,255,0.14)",
    "--ink-1": "#FFFFFF", "--ink-2": "#D2D2DE", "--ink-3": "#A1A1B0", "--ink-4": "#6E6E80",
    "--shadow-card": "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
    "--thumb-overlay": "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(11,11,18,0.85) 100%)",
  };

  return (
    <>
    {fs && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000", color: "white",
        display: "grid",
        gridTemplateColumns: chatOpen ? "1fr 320px" : "1fr 0",
        transition: "grid-template-columns 0.2s ease",
        cursor: chromeVisible ? "default" : "none",
      }}>
        {/* Player area */}
        <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
          <div style={{ width: "100%", height: "100%", backgroundImage: `url(${data.thumb})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
            {/* Subtle vignette only — no permanent gradient overlay competing with content */}

            {/* TOP CHROME (fades) */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "linear-gradient(180deg, rgba(0,0,0,0.55), transparent)", opacity: chromeVisible ? 1 : 0, transition: "opacity 0.25s ease", pointerEvents: chromeVisible ? "auto" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={toggleFs} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: "rgba(0,0,0,0.45)", color: "white", backdropFilter: "blur(8px)", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="chevL" size={14} stroke={2.4} /> exit fullscreen
                </button>
                <button onClick={() => onOpenMicroCast(data.creator)} style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 10px 4px 4px", borderRadius: 999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
                  <Avatar creator={data.creator} size={22} />
                  <span style={{ fontWeight: 700, fontSize: 12 }}>{data.creator.handle}</span>
                </button>
                <span className="live-pill">live</span>
                <span style={{ background: "rgba(0,0,0,0.45)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, backdropFilter: "blur(8px)" }} className="tnum">
                  <Icon name="eye" size={11} stroke={2.4} style={{ verticalAlign: -1, marginRight: 4 }} />{formatNum(data.viewers)}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setChatOpen(c => !c)} style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(0,0,0,0.45)", color: "white", fontSize: 12, fontWeight: 600, backdropFilter: "blur(8px)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="chat" size={13} stroke={2.4} /> {chatOpen ? "hide chat" : "show chat"}
                </button>
                <button onClick={() => toast("settings · quality / captions / chat density")} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                  <Icon name="settings" size={14} />
                </button>
              </div>
            </div>

            {/* DISMISSIBLE DROP PEEK — auto-dismisses after 9s, not parked permanently */}
            {dropPeek && (
              <div style={{ position: "absolute", right: 22, top: 80, width: 280, borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.7)", border: "1px solid var(--hairline)", backdropFilter: "blur(12px)", display: "flex", gap: 10, padding: 10, alignItems: "center", animation: "peekIn 0.3s ease-out", opacity: chromeVisible ? 1 : 0.65, transition: "opacity 0.25s ease" }}>
                <style>{`@keyframes peekIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }`}</style>
                <div style={{ width: 46, height: 46, borderRadius: 8, backgroundImage: `url(${data.drop.img})`, backgroundSize: "cover", flex: "0 0 46px" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>live drop</div>
                  <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.drop.name}</div>
                  <div className="tnum" style={{ fontSize: 11, color: "var(--ink-2)" }}>{formatNum(data.drop.price)} CAST</div>
                </div>
                <button onClick={() => { setDropPeek(false); onOpenDrop({ ...data.drop, creator: data.creator }, data.creator); }} className="btn btn-grad" style={{ padding: "6px 10px", fontSize: 11 }}>buy</button>
                <button onClick={() => setDropPeek(false)} style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="dismiss"><Icon name="close" size={11} /></button>
              </div>
            )}

            {/* BOTTOM CHROME (fades) — ledger strip + drop strip + actions + scrubber */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.85), transparent)", paddingTop: 60, opacity: chromeVisible ? 1 : 0, transition: "opacity 0.25s ease", pointerEvents: chromeVisible ? "auto" : "none" }}>
              {/* Live ledger thin strip (32px) */}
              <div style={{ height: 32, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.4))", borderTop: "1px solid var(--hairline)", overflow: "hidden" }}>
                <CastGlyph size={13} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", flex: "0 0 auto" }}>ledger</span>
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)" }}>
                  <div style={{ display: "inline-flex", gap: 24, animation: "marquee 32s linear infinite" }}>
                    {[...ledger.slice(-12), ...ledger.slice(-12)].map((e, i) => (
                      <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.9)" }}>
                        <strong className="tnum" style={{ color: "white" }}>+{e.amount} CAST</strong> from <strong>{e.who}</strong>{e.kind === "gift" && e.note ? ` · ${e.note}` : ""}
                      </span>
                    ))}
                  </div>
                  <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, flex: "0 0 auto", color: "var(--ink-2)" }} className="tnum mono">
                  {formatNum(ledger.reduce((a, e) => a + e.amount, 0))} CAST · 1h
                </span>
              </div>

              {/* Drop pinned strip (thin) */}
              <button onClick={() => onOpenDrop({ ...data.drop, creator: data.creator }, data.creator)}
                style={{ width: "100%", height: 44, display: "flex", alignItems: "center", gap: 10, padding: "0 22px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "left", color: "white", transition: "background 0.15s ease" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.55)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}>
                <Icon name="bag" size={14} stroke={2.4} style={{ color: "var(--bg-magenta)" }} />
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>live drop</span>
                <span style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.drop.name}</span>
                <span className="tnum mono" style={{ fontSize: 11, color: "var(--ink-2)" }}>{data.drop.edition}</span>
                <span className="tnum" style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{formatNum(data.drop.price)} CAST</span>
                <Icon name="chevR" size={14} stroke={2.4} style={{ color: "var(--ink-3)" }} />
              </button>

              {/* Action row — ONE primary (tip) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)" }}>
                <button onClick={() => { setFollowing(f => !f); toast(following ? "unfollowed" : `following ${data.creator.handle}`); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", color: "white", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="heart" size={14} stroke={2.4} fill={following ? "currentColor" : "none"} /> {following ? "following" : "follow"}
                </button>
                <button ref={fsSubRef} onClick={() => toast("subscribe · 750 CAST/mo")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--surface-3)", color: "white", border: "1px solid rgba(255,255,255,0.12)", fontSize: 12, fontWeight: 600 }}>
                  <CastGlyph size={14} /> subscribe · 750/mo
                </button>
                <button onClick={() => onOpenGift(data.creator)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--surface-3)", color: "white", border: "1px solid rgba(255,255,255,0.12)", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="gift" size={14} stroke={2.4} /> gift
                </button>
                <button onClick={(e) => onOpenCompete(data.competition, e.currentTarget)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "var(--surface-3)", color: "white", border: "1px solid rgba(255,255,255,0.12)", fontSize: 12, fontWeight: 600 }}>
                  <Icon name="ticket" size={14} stroke={2.4} /> predict · 50 CAST
                </button>
                <div style={{ flex: 1 }} />
                <button ref={fsTipRef} onClick={() => onOpenTip(data.creator, fsTipRef.current)} className="btn btn-grad" style={{ padding: "10px 18px", fontSize: 13 }}>
                  <Icon name="tip" size={14} stroke={2.4} /> tip with CAST
                </button>
              </div>

              {/* Scrubber + play + fs exit */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 22px 14px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.55)" }}>
                <button style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="play" size={15} fill="currentColor" />
                </button>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: "0 0 0 0", width: "100%", background: "var(--live-gradient)", borderRadius: 2 }} />
                  <div style={{ position: "absolute", right: -4, top: -4, width: 12, height: 12, borderRadius: "50%", background: "white", boxShadow: "0 0 0 3px rgba(239,68,68,0.5)" }} />
                </div>
                <span className="mono" style={{ fontSize: 11 }}>live · 67' in</span>
                <button onClick={toggleFs} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.12)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="exit fullscreen">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4H4v5"/><path d="M15 4h5v5"/><path d="M9 20H4v-5"/><path d="M15 20h5v-5"/></svg>
                </button>
              </div>
            </div>

            {/* Low-opacity scrubber peek when chrome is hidden (cursor proximity to bottom) */}
            {!chromeVisible && (
              <div style={{ position: "absolute", left: 22, right: 22, bottom: 16, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.18)", opacity: 0.6 }}>
                <div style={{ width: "100%", height: "100%", background: "var(--live-gradient)", borderRadius: 2 }} />
              </div>
            )}
          </div>
        </div>

        {/* CHAT RAIL — single chrome treatment, no CTAs in header */}
        {chatOpen && (
          <aside style={{ background: "#0B0B12", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }} className="lower">chat</div>
              <div style={{ fontSize: 10, color: "var(--ink-3)", flex: 1 }} className="mono">{chat.length + ledger.length} active</div>
              <button onClick={() => setChatOpen(false)} style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--surface-3)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-label="hide chat">
                <Icon name="close" size={12} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "6px 4px" }}>
              {chat.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "5px 12px", fontSize: 13, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 800 }}>{line.who}</span>
                  <span style={{ color: "var(--ink-2)" }}>{line.text}</span>
                </div>
              ))}
              {ledger.slice(-4).map((e, i) => (
                <div key={"L" + i} style={{ display: "flex", gap: 8, padding: "6px 10px 6px 12px", fontSize: 12, background: "linear-gradient(90deg, rgba(236,72,153,0.12), transparent)", borderLeft: "2px solid #ec4899", margin: "2px 0" }}>
                  <CastGlyph size={14} />
                  <span><strong>{e.who}</strong> {e.kind === "gift" ? "gifted" : "tipped"} <strong className="tnum">{e.amount} CAST</strong></span>
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 8 }}>
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="say something to the room"
                style={{ flex: 1, background: "var(--surface-2)", border: "1px solid var(--hairline)", borderRadius: 999, padding: "10px 14px", fontSize: 13, outline: "none", color: "white" }} />
              <button className="btn" style={{ padding: "8px 14px", background: "rgba(255,255,255,0.16)", color: "white" }}><Icon name="send" size={14} stroke={2.4} fill="currentColor" /></button>
            </form>
          </aside>
        )}
      </div>
    )}

    <div style={{ background: "var(--bg)", color: "var(--ink-1)", minHeight: "100vh", paddingBottom: 96, visibility: fs ? "hidden" : "visible" }}>
      <div className="yt-layout" style={{ maxWidth: 1700, margin: "0 auto", padding: "28px 32px 0", display: "grid", gap: 40, gridTemplateColumns: "1fr" }}>
        <style>{`
          @media (min-width: 1024px) { .yt-layout { grid-template-columns: minmax(0, 1fr) 380px !important; gap: 48px !important; } }
          @media (min-width: 1280px) { .yt-layout { grid-template-columns: minmax(0, 1.95fr) 400px !important; padding-right: 6%; } }
          @media (min-width: 1600px) { .yt-layout { padding-right: 9%; } }
        `}</style>

        {/* LEFT COLUMN */}
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Ambient glow behind player */}
          <div style={{ position: "relative" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: "-60px -60px -90px -60px", background: "radial-gradient(60% 60% at 50% 50%, rgba(139,92,246,0.10), transparent 70%)", filter: "blur(90px)", pointerEvents: "none", zIndex: 0 }} />
            {/* PLAYER */}
            <div style={{ position: "relative", aspectRatio: "16/9", background: "#000", borderRadius: 18, overflow: "hidden", backgroundImage: `url(${data.thumb})`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 40px 80px -32px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)", zIndex: 1 }}>
            {/* Bottom controls bar */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0 12px 8px", background: "linear-gradient(0deg, rgba(0,0,0,0.9), transparent)", opacity: playerChrome ? 1 : 0, transition: "opacity 0.25s ease", pointerEvents: playerChrome ? "auto" : "none" }}>
              {/* Scrubber — red live */}
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.25)", position: "relative", marginBottom: 6 }}>
                <div style={{ position: "absolute", inset: 0, width: "100%", background: "#ef2b3d", borderRadius: 2 }} />
                <div style={{ position: "absolute", right: -3, top: -3, width: 9, height: 9, borderRadius: "50%", background: "#ef2b3d" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "white", height: 36 }}>
                <button aria-label="play" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "white" }}>
                  <Icon name="play" size={16} fill="currentColor" />
                </button>
                <button aria-label="volume" style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "white" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z"/></svg>
                </button>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", background: "#ef2b3d", borderRadius: 4, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 800 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "white", animation: "liveDot 2s ease-out infinite" }} /> live
                  </span>
                  <span className="tnum" style={{ color: "var(--ink-2)" }}>{data.viewers.toLocaleString()} watching · 1:07:42 in</span>
                </span>
                <div style={{ flex: 1 }} />
                <button onClick={() => toast("captions on")} title="captions" style={{ width: 32, height: 32, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM6 17v-2h4v2H6zm7 0v-2h5v2h-5zM6 11V9h8v2H6zm9 0V9h3v2h-3z"/></svg>
                </button>
                <button onClick={() => toast("settings · quality 1080p · playback speed 1x · captions")} title="settings" style={{ width: 32, height: 32, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
                  <Icon name="settings" size={18} />
                </button>
                <button onClick={toggleFs} title="fullscreen" style={{ width: 32, height: 32, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/></svg>
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* TITLE */}
          <h1 style={{ margin: "28px 0 0", fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>{data.title}</h1>

          {/* CREATOR + ACTIONS ROW */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => onOpenMicroCast(data.creator)} style={{ display: "flex", gap: 10, alignItems: "center", textAlign: "left" }}>
                <Avatar creator={data.creator} size={40} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-1)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {data.creator.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-label="verified" style={{ flex: "0 0 14px" }}><path d="M12 2l2.39 2.05L17.5 3.5l.78 3.07 3 1.18-1.5 2.78 1.5 2.78-3 1.18-.78 3.07-3.11-.55L12 19.05l-2.39-2.05-3.11.55-.78-3.07-3-1.18 1.5-2.78-1.5-2.78 3-1.18.78-3.07 3.11.55L12 2z" fill="#3ea6ff"/><path d="M10.5 14.5l-3-3 1.41-1.41L10.5 11.67l5.09-5.09L17 8l-6.5 6.5z" fill="#fff"/></svg>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="tnum">988,453 subscribers · 1.2K joined this week</div>
                </div>
              </button>
              <button onClick={() => { setFollowing(f => !f); toast(following ? "unsubscribed" : `subscribed · ${data.creator.handle}`); }} style={{ padding: "9px 18px", fontSize: 14, fontWeight: 600, borderRadius: 999, background: following ? "var(--surface-2)" : "var(--ink-1)", color: following ? "var(--ink-1)" : "var(--bg)", border: "none", height: 36 }}>
                {following ? "subscribed" : "subscribe"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button ref={tipBtnRef} onClick={() => onOpenTip(data.creator, tipBtnRef.current)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 18px", height: 36, borderRadius: 999, background: "var(--brand-gradient)", color: "white", fontWeight: 600, fontSize: 14, boxShadow: "0 0 24px -8px rgba(139,92,246,0.5)" }}>
                <Icon name="tip" size={15} stroke={2.4} /> tip with CAST
              </button>
              <button onClick={() => onOpenGift(data.creator)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 16px", height: 36, borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-1)", fontWeight: 500, fontSize: 14, border: "none" }}>
                <Icon name="gift" size={15} stroke={2.2} /> gift
              </button>
              <button onClick={() => toast("link copied")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 16px", height: 36, borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-1)", fontWeight: 500, fontSize: 14, border: "none" }}>
                <Icon name="share" size={15} stroke={2.2} /> share
              </button>
              <button onClick={() => toast("saved to library")} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 16px", height: 36, borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-1)", fontWeight: 500, fontSize: 14, border: "none" }}>
                <Icon name="bookmark" size={15} stroke={2.2} /> save
              </button>
              <button onClick={() => toast("copy link · embed · report · not interested")} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-1)", border: "none" }} aria-label="more">
                <Icon name="more" size={18} stroke={2.2} />
              </button>
            </div>
          </div>

          {/* DESCRIPTION BOX */}
          <div onClick={() => setDescExpanded(v => !v)} style={{ marginTop: 20, background: "var(--surface-2)", borderRadius: 12, padding: "12px 14px", color: "var(--ink-1)", cursor: "pointer" }}>
            <div style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 6 }}>
              <span className="tnum">47,213 watching</span> · 1:07:42 in · <span style={{ color: "rgba(98,178,255,0.85)" }}>#nonleaguecup #atlasfc #awayday</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", whiteSpace: "pre-wrap", display: descExpanded ? "block" : "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: descExpanded ? "unset" : 2, overflow: "hidden" }}>
              non-league cup · matchday 18. every away match streamed by atlas fc — members watch the post-match unfiltered. tips become next week's away travel.
              {descExpanded && (
                <>
                  {"\n\n"}atlas fc is a community-owned non-league club playing out of the borough sports ground. founded in 1922 by a coalition of dock workers and printers. promotion this season would push them into the national league south for the first time in 60 years.
                  {"\n\n"}member benefits include full access to the post-match unfiltered show, the away pass for traveling matches, the third-kit drop archive, and behind-the-scenes training feeds.
                  {"  "}<span style={{ color: "var(--ink-3)", fontWeight: 500 }}>show less</span>
                </>
              )}
              {!descExpanded && <span style={{ color: "var(--ink-3)", fontWeight: 500 }}>{"  "}…more</span>}
            </div>
          </div>

          {/* TABS ROW */}
          <div style={{ marginTop: 32, borderBottom: "1px solid var(--hairline)" }}>
            <Tabs initial="chat" labelColor="var(--ink-1)" mutedColor="var(--ink-3)" tabs={[
              { id: "chat",        label: "chat" },
              { id: "about",       label: "about" },
              { id: "drops",       label: "live drops" },
              { id: "competition", label: "competition" },
              { id: "members",     label: "members" },
            ]}>
              {(active) => (
                <div style={{ paddingTop: 20, color: "var(--ink-1)" }}>
                  {active === "about" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--ink-1)" }}>
                      <div><span style={{ color: "var(--ink-3)", display: "inline-block", width: 100 }}>category</span> sports · lower-league football</div>
                      <div><span style={{ color: "var(--ink-3)", display: "inline-block", width: 100 }}>tags</span> non-league cup · matchday · away</div>
                      <div><span style={{ color: "var(--ink-3)", display: "inline-block", width: 100 }}>schedule</span> saturdays + cup nights</div>
                      <div><span style={{ color: "var(--ink-3)", display: "inline-block", width: 100 }}>language</span> english</div>
                    </div>
                  )}

                  {active === "drops" && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                      {[
                        { name: "atlas '78 retro third kit", price: 1240, edition: "247 / 500 sold", img: data.drop.img },
                        { name: "matchday scarf · away red", price: 400, edition: "limited", img: data.drop.img },
                        { name: "matchday programme · pdf", price: 80, edition: "instant", img: data.drop.img },
                        { name: "away ticket bundle · 3-pack", price: 1800, edition: "200 left", img: data.drop.img },
                      ].map((d, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ aspectRatio: "4/3", borderRadius: 10, backgroundImage: `url(${d.img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{d.edition}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                            <span className="tnum" style={{ fontSize: 16, fontWeight: 700 }}>{formatNum(d.price)} <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>CAST</span></span>
                            <button onClick={() => onOpenDrop({ ...d, creator: data.creator }, data.creator)} style={{ padding: "0 14px", height: 32, fontSize: 12, fontWeight: 500, borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-1)" }}>buy</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {active === "competition" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { name: "predict full-time score", entry: 50, ends: "ends 90'" },
                        { name: "first scorer next half", entry: 25, ends: "ends 60'" },
                        { name: "match man-of-the-match vote", entry: 10, ends: "ends 95'" },
                      ].map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid #2A2A2A" : "none" }}>
                          <Icon name="ticket" size={20} stroke={2} style={{ color: "var(--ink-3)", flex: "0 0 20px" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">{c.ends} · {c.entry} CAST entry</div>
                          </div>
                          <button onClick={(e) => onOpenCompete(c, e.currentTarget)} style={{ padding: "0 16px", height: 36, fontSize: 13, fontWeight: 500, borderRadius: 999, background: "var(--surface-2)", color: "var(--ink-1)" }}>enter</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {active === "members" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <div>
                          <div className="tnum" style={{ fontSize: 28, fontWeight: 700 }}>142</div>
                          <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">subs gifted in this stream</div>
                        </div>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => onOpenGift(data.creator)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 16px", height: 36, fontSize: 14, fontWeight: 500, borderRadius: 999, background: "var(--brand-gradient)", color: "white" }}>
                          <Icon name="gift" size={14} stroke={2.4} /> gift a sub · 250 CAST
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                        {[{ name: "tier 1 · stand", cast: 250, perks: ["live chat colour", "members-only post-match", "early kit drops"] }, { name: "tier 2 · away pass", cast: 750, perks: ["everything in stand", "every away match feed", "tactics breakdown weekly"], popular: true }, { name: "tier 3 · away travel", cast: 2200, perks: ["everything in away pass", "training session feeds", "credit on every drop"] }].map((t, i) => (
                          <div key={i} style={{ padding: 14, borderRadius: 12, background: "var(--surface-2)", border: t.popular ? "1.5px solid transparent" : "none", backgroundImage: t.popular ? "linear-gradient(#272727, #272727), var(--brand-gradient)" : undefined, backgroundOrigin: "border-box", backgroundClip: t.popular ? "padding-box, border-box" : undefined }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{t.name}</div>
                            <div className="tnum" style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{t.cast}<span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}> CAST/mo</span></div>
                            <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none", fontSize: 12, color: "var(--ink-2)", display: "flex", flexDirection: "column", gap: 4 }}>
                              {t.perks.map((p, j) => <li key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}><Icon name="check" size={13} stroke={2.4} style={{ marginTop: 2, flex: "0 0 13px" }} />{p}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {active === "chat" && (
                    <div style={{ display: "flex", flexDirection: "column", height: 640, minHeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--hairline)" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-1)" }} className="lower">live chat</span>
                        <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="tnum">· {chat.length + ledger.length} active</span>
                        <span style={{ flex: 1 }} />
                        <button onClick={() => setChatSortOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, background: "var(--surface-2)", fontSize: 12, fontWeight: 700, color: "var(--ink-1)" }}>
                          <span className="lower">{chatSort === "live" ? "live chat" : "top chat"}</span>
                          <Icon name="chevD" size={12} stroke={2.4} />
                        </button>
                        <button onClick={() => toast("chat settings · slow mode · filters")} aria-label="chat settings" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}>
                          <Icon name="settings" size={13} stroke={2} />
                        </button>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
                        {/* Pinned creator message — quieter */}
                        <div style={{ display: "flex", gap: 8, padding: "6px 0", marginBottom: 8, alignItems: "flex-start", color: "var(--ink-2)" }}>
                          <span style={{ flex: "0 0 14px", display: "inline-flex", color: "var(--ink-4)", marginTop: 2 }} title="pinned">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 9V4h1V2H7v2h1v5l-2 2v2h5v7l1 1 1-1v-7h5v-2l-2-2z"/></svg>
                          </span>
                          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>
                            <span style={{ color: "var(--ink-3)" }}>pinned by </span><strong style={{ color: "var(--ink-1)", fontWeight: 600 }}>{data.creator.handle}</strong><span style={{ color: "var(--ink-3)" }}> — </span>tonight's tips become next week's away travel fund. up the lads.
                          </div>
                        </div>
                        {chat.map((line, i) => {
                          const isMember = ["@oren","@theo","@nia"].includes(line.who);
                          const isLight = document.documentElement.getAttribute("data-theme") === "light";
                          const handleColor = (isLight ? ["#BE185D","#0E7490","#6D28D9","#A16207","#047857","#1D4ED8"] : ["#fda4af","#67e8f9","#d8b4fe","#fcd34d","#6ee7b7","#93c5fd"])[i % 6];
                          return (
                            <div key={i} style={{ display: "flex", gap: 6, padding: "5px 0", fontSize: 13, lineHeight: 1.4, alignItems: "baseline" }}>
                              {isMember && <CastGlyph size={11} />}
                              <span style={{ fontWeight: 700, color: handleColor }}>{line.who}</span>
                              <span style={{ color: "var(--ink-2)" }}>{line.text}</span>
                            </div>
                          );
                        })}
                        {ledger.slice(-12).map((e, i) => (
                          <div key={"L" + i} style={{ display: "flex", gap: 10, padding: "8px 10px 8px 12px", fontSize: 12.5, background: "linear-gradient(90deg, rgba(236,72,153,0.10), transparent 80%)", borderLeft: "2px solid #ec4899", borderRadius: "0 8px 8px 0", margin: "4px 0", color: "var(--ink-1)", alignItems: "center" }}>
                            <CastGlyph size={14} />
                            <span><strong>{e.who}</strong> {e.kind === "gift" ? "gifted" : "tipped"} <strong className="tnum">{e.amount} CAST</strong>{e.note ? ` · ${e.note}` : ""}</span>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={sendChat} style={{ paddingTop: 12, borderTop: "1px solid var(--hairline)", display: "flex", gap: 8 }}>
                        <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="say something to the room" style={{ flex: 1, background: "var(--surface-2)", border: "none", borderRadius: 999, padding: "12px 18px", fontSize: 13, outline: "none", color: "var(--ink-1)" }} />
                        <button className="btn" style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--brand-gradient)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="send" size={16} stroke={2.4} fill="currentColor" /></button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </Tabs>
          </div>
        </div>

        {/* RIGHT COLUMN — Live Drop card, chips, vertical Up Next list */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
          {/* Live Drop card — quieter, less designed */}
          {dropPeek && (
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>live drop</span>
                <button onClick={() => setDropPeek(false)} aria-label="dismiss" style={{ width: 20, height: 20, color: "var(--ink-4)", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="close" size={12} />
                </button>
              </div>
              <div style={{ aspectRatio: "16/10", borderRadius: 10, backgroundImage: `url(${data.drop.img})`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 10 }} />
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-1)" }}>{data.drop.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }} className="tnum">{data.drop.edition}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <span className="tnum" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)" }}>{formatNum(data.drop.price)} <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 400 }}>CAST</span></span>
                <button onClick={() => onOpenDrop({ ...data.drop, creator: data.creator }, data.creator)} style={{ padding: "0 14px", height: 32, borderRadius: 999, background: "var(--brand-gradient)", color: "var(--ink-1)", fontWeight: 500, fontSize: 13 }}>buy now</button>
              </div>
            </div>
          )}

          {/* Shelf chips */}
          <div className="rail" style={{ gap: 6, paddingBottom: 2 }}>
            {["all", "from atlas", "sports", "non-league", "matchday", "live now"].map((c, i) => (
              <button key={c} style={{ padding: "6px 12px", borderRadius: 999, background: i === 0 ? "var(--surface-3)" : "transparent", color: i === 0 ? "var(--ink-1)" : "var(--ink-3)", border: "none", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }} className="lower">{c}</button>
            ))}
          </div>

          {/* Vertical Up Next list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(() => {
              // Curated up-next list with face-focused thumbnails + colored overlays + specific meta
              const items = [
                { id: "un1", title: "post-match · away coach unfiltered", handle: "@atlasfc", thumb: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=336", overlay: "UNFILTERED", overlayBg: "#ef2b3d", live: true, viewers: 8123 },
                { id: "un2", title: "training session · open feed", handle: "@atlasfc", thumb: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=336", overlay: "OPEN FEED", overlayBg: "#fbbf24", overlayColor: "#000", soon: "live in 6h 47m" },
                { id: "un3", title: "tactics breakdown · 4-2-3-1 away", handle: "@atlasfc", thumb: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=336", overlay: "TACTICS", overlayBg: "rgba(0,0,0,0.85)", views: 847000, ago: "3 days ago", dur: "21:14" },
                { id: "un4", title: "barcelona · gothic quarter session", handle: "@inesskates", thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=336", overlay: "LIVE", overlayBg: "#ec4899", live: true, viewers: 9842 },
                { id: "un5", title: "patagonia · day 14 base camp", handle: "@rhettclimbs", thumb: "https://images.unsplash.com/photo-1502740479091-635887520276?w=336", overlay: "DAY 14", overlayBg: "rgba(0,0,0,0.85)", live: true, viewers: 18230 },
                { id: "un6", title: "trail 17 · pre-dawn run", handle: "@wrenruns", thumb: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=336", overlay: "PRE-DAWN", overlayBg: "#f97316", views: 0, ago: "6 hours ago", isNew: true, dur: "48:12" },
                { id: "un7", title: "sunday roast · you pick the bird", handle: "@kavikitchen", thumb: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=336", overlay: "YOU PICK", overlayBg: "#ef2b3d", live: true, viewers: 4218 },
                { id: "un8", title: "buchla patch · night session #13", handle: "@nyxsynth", thumb: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=336", overlay: "NIGHT #13", overlayBg: "#a855f7", live: true, viewers: 892 },
                { id: "un9", title: "valorant — grand finals · map 3", handle: "@saberesports", thumb: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=336", overlay: "GRAND FINALS", overlayBg: "#22c55e", overlayColor: "#000", live: true, viewers: 184320 },
                { id: "un10", title: "open chord-building room", handle: "@riverssings", thumb: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=336", overlay: "WRITE LIVE", overlayBg: "#3ea6ff", live: true, viewers: 318 },
                { id: "un11", title: "reviving a 1978 marantz 2245", handle: "@tolafixes", thumb: "https://images.unsplash.com/photo-1486365227551-f3f90034a57c?w=336", overlay: "1978", overlayBg: "rgba(0,0,0,0.85)", live: true, viewers: 1607 },
                { id: "un12", title: "non-league cup · highlights", handle: "@atlasfc", thumb: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=336", overlay: "HIGHLIGHTS", overlayBg: "#ef2b3d", views: 247000, ago: "1 week ago", dur: "8:42" },
              ];
              const fmtViews = (n) => n >= 1000000 ? (n/1000000).toFixed(1).replace(/\.0$/,"") + "M" : n >= 1000 ? (n/1000).toFixed(0) + "K" : n.toString();
              return items.map(p => (
                <button key={p.id} onClick={() => toast(`opening ${p.title}`)} style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", background: "transparent", padding: 4, margin: -4, borderRadius: 8, transition: "background 0.15s ease" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 140, height: 80, borderRadius: 8, overflow: "hidden", backgroundImage: `url(${p.thumb})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative", flex: "0 0 140px" }}>
                    {/* Bold colored overlay text — YouTube thumbnail style */}
                    <span style={{ position: "absolute", top: 8, left: 8, padding: "3px 7px", borderRadius: 4, background: p.overlayBg, color: p.overlayColor || "#fff", fontSize: 10, fontWeight: 900, letterSpacing: "0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>{p.overlay}</span>
                    {p.live && (
                      <span style={{ position: "absolute", bottom: 6, right: 6, display: "inline-flex", alignItems: "center", gap: 4, background: "#ef2b3d", color: "white", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white" }} /> live
                      </span>
                    )}
                    {!p.live && p.soon && (
                      <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.85)", color: "white", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700 }} className="tnum">{p.soon.replace("live in ", "in ")}</span>
                    )}
                    {!p.live && !p.soon && p.dur && (
                      <span style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.85)", color: "white", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700 }} className="tnum">{p.dur}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.35, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden", color: "var(--ink-1)" }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#7E7E8A", marginTop: 4 }} className="lower">{p.handle}</div>
                    <div style={{ fontSize: 12, color: "#7E7E8A", display: "flex", alignItems: "center", gap: 6 }}>
                      {p.live && <><span className="tnum">{p.viewers.toLocaleString()}</span> watching</>}
                      {!p.live && p.soon && p.soon}
                      {!p.live && !p.soon && p.views != null && (
                        <>{p.views === 0 ? <span>0 views</span> : <><span className="tnum">{fmtViews(p.views)}</span> views</>} · {p.ago}</>
                      )}
                      {p.isNew && <span style={{ marginLeft: 4, padding: "1px 6px", background: "#fbbf24", color: "#000", borderRadius: 3, fontSize: 9, fontWeight: 900, letterSpacing: "0.06em" }}>NEW</span>}
                    </div>
                  </div>
                  <span onClick={(e) => { e.stopPropagation(); toast("save · not interested · hide"); }} aria-label="more" role="button" tabIndex={0} style={{ width: 24, height: 24, color: "var(--ink-3)", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                    <Icon name="more" size={14} stroke={2.2} />
                  </span>
                </button>
              ));
            })()}
          </div>
        </aside>
      </div>
    </div>
    </>
  );
};

// Lightweight tabs — brand-gradient underline on active, explicit colors
const Tabs = ({ tabs, initial, children, labelColor, mutedColor }) => {
  const [active, setActive] = useState(initial || tabs[0].id);
  const onColor = labelColor || "var(--ink-1)";
  const offColor = mutedColor || "var(--ink-3)";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 32, borderBottom: "1px solid #2A2A2A" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            padding: "14px 0",
            fontSize: 14, fontWeight: 500,
            color: active === t.id ? onColor : offColor,
            position: "relative",
            background: "transparent",
          }} className="lower">
            {t.label}
            {active === t.id && <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "var(--brand-gradient)", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
      {typeof children === "function" ? children(active) : children}
    </div>
  );
};

Object.assign(window, { LiveWatchScreen });
})();
