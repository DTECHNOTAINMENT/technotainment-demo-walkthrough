/* v4 extras — Following / Explore / Library / Drops dedicated pages */
(() => {
const { useState } = React;
const { Icon, Avatar, LiveBadge, ViewerBadge, Thumb, formatNum,
        CREATORS, METACASTS, LIVE, SOON, FOLLOWED_LATEST, DROPS, CONTINUE,
        FEATURED_MICROS, SMALLROOMS, findC } = window;

// Reuse the gtile pattern
const GTile = ({ post, onOpen }) => {
  const isLive = post.viewers != null && !post.in && !post.dur;
  const isSoon = !!post.in;
  return (
    <div className="gtile tile" onClick={() => onOpen?.(post)} role="button" tabIndex={0}>
      <Thumb src={post.thumb}>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {isLive && <LiveBadge />}
          {isLive && <ViewerBadge n={post.viewers} />}
          {isSoon && <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum"><Icon name="clock" size={11} stroke={2.4} style={{ marginRight: 4, verticalAlign: -1 }} />in {post.in}</span>}
          {!isLive && !isSoon && post.dur && <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum">{post.dur}</span>}
        </div>
      </Thumb>
      <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
        <Avatar creator={post.creator} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: "var(--ink-1)", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>{post.title}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }} className="lower">{post.creator.handle}</div>
        </div>
      </div>
    </div>
  );
};

const PageHeader = ({ eyebrow, title, sub, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 18, borderBottom: "1px solid var(--hairline)", marginBottom: 24, gap: 12 }}>
    <div>
      {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>{eyebrow}</div>}
      <h1 style={{ margin: "6px 0 0", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.04 }} className="lower">{title}</h1>
      {sub && <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

// ----- Following page ---------------------------------------------------
const FollowingScreen = ({ followingIds, onOpenLive, onOpenMicroCast, toast, setRoute }) => {
  const followed = CREATORS.filter(c => followingIds.includes(c.id));
  const liveSet = new Set(LIVE.map(l => l.creator.id));
  const liveFromFollowed = LIVE.filter(l => followingIds.includes(l.creator.id));
  const vodFromFollowed = FOLLOWED_LATEST.filter(v => followingIds.includes(v.creator.id));

  return (
    <div className="page-pad">
      <PageHeader eyebrow="your follows" title={`following · ${followed.length} creators`} sub="live + recent uploads from creators you follow." />

      {liveFromFollowed.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }} className="lower">live right now · {liveFromFollowed.length}</h2>
          <div className="grid-tiles">
            {liveFromFollowed.map(l => <GTile key={l.id} post={l} onOpen={onOpenLive} />)}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }} className="lower">recent uploads</h2>
        <div className="grid-tiles">
          {vodFromFollowed.map(v => <GTile key={v.id} post={v} onOpen={() => onOpenMicroCast(v.creator)} />)}
        </div>
      </section>

      <section>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }} className="lower">all creators</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {followed.map(c => (
            <button key={c.id} onClick={() => onOpenMicroCast(c)} className="card" style={{ background: "var(--surface)", padding: 14, display: "flex", gap: 12, alignItems: "center", textAlign: "left" }}>
              <Avatar creator={c} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: liveSet.has(c.id) ? "var(--live)" : "var(--ink-3)", fontWeight: liveSet.has(c.id) ? 700 : 500 }} className="lower">{liveSet.has(c.id) ? "· live now" : c.category}</div>
              </div>
              {liveSet.has(c.id) && <span className="sb-live-dot" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

// ----- Explore (MetaCasts) ----------------------------------------------
const ExploreScreen = ({ onOpenMetaCast, toast }) => {
  const all = METACASTS;
  return (
    <div className="page-pad">
      <PageHeader eyebrow="operator destinations" title="explore metacasts" sub="branded zones on the same backend. each runs its own audience and curation." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {all.map(mc => (
          <button key={mc.id} onClick={() => mc.id === "smallrooms" ? onOpenMetaCast("smallrooms") : toast(`hop into ${mc.name} · metacast destination`)}
            className="tile" style={{ textAlign: "left" }}>
            <div className="thumb" style={{ backgroundImage: `url(${mc.img})`, aspectRatio: "16/9" }}>
              <div className="thumb-overlay" />
              <div style={{ position: "absolute", inset: 0, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "white" }}>
                <span style={{ alignSelf: "flex-start", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.92, background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: 6, backdropFilter: "blur(6px)" }}>metacast</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }} className="lower">{mc.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{mc.tag}</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ----- Library (Continue watching + History) ----------------------------
const LibraryScreen = ({ onOpenLive, onOpenMicroCast, toast }) => {
  return (
    <div className="page-pad">
      <PageHeader eyebrow="your library" title="library" sub="continue where you left off · watch later · your purchases." />

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }} className="lower">continue watching</h2>
        <div className="grid-tiles">
          {CONTINUE.map(c => (
            <div key={c.id} className="gtile tile" onClick={() => onOpenLive(c)} role="button" tabIndex={0}>
              <div className="thumb" style={{ backgroundImage: `url(${c.thumb})` }}>
                <div className="thumb-overlay" />
                <div style={{ position: "absolute", top: 10, right: 10 }}>
                  <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum">{c.left}</span>
                </div>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", backdropFilter: "blur(6px)" }}><Icon name="play" size={18} fill="currentColor" /></span>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.18)" }}>
                  <div style={{ width: c.pct + "%", height: "100%", background: "var(--brand-gradient)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
                <Avatar creator={c.creator} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{c.creator.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 36 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }} className="lower">recently watched</h2>
        <div className="grid-tiles">
          {FOLLOWED_LATEST.map(v => <GTile key={v.id} post={v} onOpen={() => onOpenMicroCast(v.creator)} />)}
        </div>
      </section>
    </div>
  );
};

// ----- Drops dedicated page ---------------------------------------------
const DropsScreen = ({ onOpenDrop, toast }) => {
  const [kind, setKind] = useState("all");
  const kinds = ["all", "physical", "music", "course", "ppv"];
  return (
    <div className="page-pad">
      <PageHeader eyebrow="live commerce" title="drops" sub="creator-priced. paid in CAST. limited or open editions." />
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {kinds.map(k => <button key={k} onClick={() => setKind(k)} className={`chip ${kind === k ? "active" : ""}`}>{k}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
        {DROPS.map(d => (
          <div key={d.id} className="tile" style={{ width: "100%" }}>
            <div className="thumb" style={{ aspectRatio: "4/5", backgroundImage: `url(${d.img})` }}>
              <div className="thumb-overlay" />
              <div style={{ position: "absolute", top: 10, left: 10 }}>
                <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}>{d.edition}</span>
              </div>
              <div style={{ position: "absolute", left: 10, bottom: 10, right: 10, color: "white" }}>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{d.name}</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }} className="lower">{d.creator.handle}</div>
              </div>
            </div>
            <div style={{ padding: "10px 2px 2px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="tnum" style={{ fontSize: 17, fontWeight: 800 }}>{formatNum(d.price)}</span>
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
              </div>
              <button onClick={() => onOpenDrop({ ...d, creator: d.creator }, d.creator)} className="btn btn-grad" style={{ padding: "7px 12px", fontSize: 11 }}>buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { FollowingScreen, ExploreScreen, LibraryScreen, DropsScreen });
})();
