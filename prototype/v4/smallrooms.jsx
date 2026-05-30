/* v3 Small Rooms — operator MetaCast destination */
(() => {
const { Icon, Avatar, LiveBadge, ViewerBadge, Tile, formatNum, SMALLROOMS, findC } = window;

const SmallRoomsScreen = ({ onBack, onOpenLive, onOpenMicroCast, onOpenTip, toast }) => {
  const sr = SMALLROOMS;
  return (
    <div style={{ paddingBottom: 96 }}>
      {/* You-are-inside pill (sits above hero) */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "12px 16px 0", display: "flex", justifyContent: "center" }}>
        <button onClick={onBack} className="btn btn-glass" style={{ padding: "8px 14px", fontSize: 12 }}>
          <Icon name="chevL" size={14} stroke={2.4} /> <span className="lower">you are inside small rooms · back to metascape</span>
        </button>
      </div>

      {/* Hero — Small Rooms-branded, no Technotainment colors */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "21/9", backgroundImage: `url(${sr.hero.img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${sr.brand}cc 0%, ${sr.brand2}99 40%, rgba(0,0,0,0.5) 100%), linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)` }} />
          <div style={{ position: "absolute", inset: 0, padding: "clamp(20px, 4vw, 44px)", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <SmallRoomsLogo />
              <span style={{ padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.14em", fontWeight: 800, textTransform: "uppercase" }}>{sr.hero.eyebrow}</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05, maxWidth: 760 }} className="lower">{sr.hero.headline}</h1>
              <div style={{ marginTop: 8, fontSize: "clamp(13px, 1.4vw, 16px)", opacity: 0.85 }}>{sr.hero.sub}</div>
              <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
                <button onClick={() => onOpenLive(sr.liveNow[0])} className="btn" style={{ background: sr.accent, color: "#0B0B12", fontWeight: 800, padding: "12px 20px", fontSize: 14 }}>
                  <Icon name="play" size={14} stroke={2.6} /> watch live
                </button>
                <button onClick={() => toast("notified · we'll ping when small rooms drop a show")} className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 18px", fontSize: 13 }}>
                  <Icon name="bell" size={14} stroke={2.4} /> notify me
                </button>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="tnum" style={{ fontSize: 32, fontWeight: 800, color: sr.accent }}>{formatNum(sr.liveNow.reduce((a, r) => a + r.viewers, 0))}</span>
                  <span style={{ fontSize: 12, opacity: 0.85 }}>watching across rooms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section: live across rooms */}
      <section style={{ marginTop: 28 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>tonight · live</div>
            <h2 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }} className="lower">across {sr.liveNow.length} rooms</h2>
          </div>
          <span className="chip" style={{ background: `${sr.brand}22`, border: `1px solid ${sr.brand}55`, color: sr.brand2 }}>small rooms curated</span>
        </div>
        <div className="rail" style={{ padding: "0 16px" }}>
          {sr.liveNow.map(p => <Tile key={p.id} post={p} onOpen={onOpenLive} size="sm" />)}
        </div>
      </section>

      {/* Section: upcoming */}
      <section style={{ marginTop: 36 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 16px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>this week</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }} className="lower">upcoming on the network</h2>
        </div>
        <div className="rail" style={{ padding: "0 16px" }}>
          {sr.upcoming.map(p => <Tile key={p.id} post={p} onOpen={onOpenLive} size="sm" />)}
        </div>
      </section>

      {/* Section: microcasts on this metacast */}
      <section style={{ marginTop: 36 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 16px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>independent · creator-owned</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }} className="lower">microcasts in small rooms</h2>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>these creators run their own microcast on metascape. small rooms hosts them in the venue feed.</div>
        </div>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {sr.microcasts.map(id => {
            const c = findC(id);
            return (
              <button key={id} onClick={() => onOpenMicroCast(c)} className="card" style={{ background: "var(--surface)", padding: 16, display: "flex", gap: 14, alignItems: "center", textAlign: "left" }}>
                <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})` }}>
                  <Avatar creator={c} size={48} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{c.handle} · {c.category}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 4 }}><span className="tnum">{formatNum(c.followers)}</span> followers</div>
                </div>
                <span className="btn btn-glass" style={{ padding: "6px 10px", fontSize: 11 }}>visit</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Operator info card */}
      <section style={{ marginTop: 48, maxWidth: 1440, margin: "48px auto 0", padding: "0 16px" }}>
        <div className="card" style={{ padding: 22, background: "var(--surface)", display: "grid", gap: 18 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <SmallRoomsLogo dark />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{sr.operator.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="mono">{sr.operator.founded} · {sr.operator.venues} venues · {sr.operator.site}</div>
            </div>
            <span style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid var(--hairline)", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>operator</span>
          </div>
          <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14, lineHeight: 1.6, maxWidth: 720 }}>{sr.operator.bio}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="chip">on the same technotainment backend</span>
            <span className="chip">CAST chrome shared with metascape</span>
            <span className="chip">microcasts portable</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => toast(`opening ${sr.operator.site}`)} className="btn btn-glass">visit smallrooms.fm</button>
            <button onClick={onBack} className="btn btn-glass"><Icon name="chevL" size={14} stroke={2.4} /> back to metascape</button>
          </div>
        </div>
      </section>
    </div>
  );
};

const SmallRoomsLogo = ({ dark }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: dark ? "#581c87" : "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 900 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
    </div>
    <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", color: dark ? "var(--ink-1)" : "white" }}>small rooms</span>
  </div>
);

Object.assign(window, { SmallRoomsScreen });
})();
