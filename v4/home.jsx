/* v4 Home — YouTube-style uniform grid + ONE secondary rail */
(() => {
const { useState, useMemo, useEffect, useRef } = React;
const { Icon, Avatar, LiveBadge, ViewerBadge, Thumb, formatNum,
        HERO, LIVE, SOON, FOLLOWED_LATEST, DROPS, CONTINUE } = window;

// Map sidebar category id → live tile filter
const FILTER_MAP = {
  "cat-music":     l => l.cat === "music",
  "cat-gaming":    l => l.cat === "gaming",
  "cat-sports":    l => l.cat === "sports",
  "cat-talk":      l => l.cat === "talk",
  "cat-education": l => l.cat === "education",
  "cat-drops":     () => false, // handled separately
  "cat-faith":     l => l.cat === "talk",  // demo fallback
  "cat-esports":   l => l.cat === "esports",
  "cat-live":      () => true,
};
const FILTER_LABEL = {
  "cat-music": "music", "cat-gaming": "gaming", "cat-sports": "sports",
  "cat-talk": "talk", "cat-education": "education", "cat-drops": "drops",
  "cat-faith": "faith", "cat-esports": "esports", "cat-live": "live now",
};

// Unified entertainment tile (16:9) — with creator brand-color strip + size variants
const GTile = ({ post, onOpen, featured }) => {
  const isLive = post.viewers != null && !post.in && !post.dur;
  const isSoon = !!post.in;
  return (
    <div className={`gtile tile ${featured ? "gtile-feat" : ""}`} onClick={() => onOpen?.(post)} role="button" tabIndex={0}>
      <Thumb src={post.thumb}>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {isLive && <LiveBadge />}
          {isLive && <ViewerBadge n={post.viewers} />}
          {isSoon && (
            <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum">
              <Icon name="clock" size={11} stroke={2.4} style={{ marginRight: 4, verticalAlign: -1 }} />in {post.in}
            </span>
          )}
          {!isLive && !isSoon && post.dur && (
            <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum">{post.dur}</span>
          )}
        </div>
        {/* Brand color strip — thin bottom edge tinted with creator brand */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: `linear-gradient(90deg, ${post.creator.brand}, ${post.creator.brand2})`, opacity: 0.95 }} />
      </Thumb>
      <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
        <Avatar creator={post.creator} size={featured ? 44 : 36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: featured ? 17 : 14, fontWeight: 800, lineHeight: 1.25, color: "var(--ink-1)", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>{post.title}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }} className="lower">{post.creator.handle}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>
            {isLive  && <span className="tnum">{formatNum(post.viewers)} watching</span>}
            {isSoon  && <span>starts {post.ago || `in ${post.in}`}</span>}
            {!isLive && !isSoon && (post.ago ? <span>{post.ago}</span> : null)}
          </div>
        </div>
      </div>
      <style>{`
        .gtile-feat { grid-column: span 2; grid-row: span 2; }
        @media (max-width: 639px) { .gtile-feat { grid-column: span 2; grid-row: span 1; } }
      `}</style>
    </div>
  );
};

// Hero marquee with ambient color bleed + editorial kicker
const Hero = ({ onWatch }) => {
  const [liveViewers, setLiveViewers] = useState(HERO.viewers);
  useEffect(() => {
    const t = setInterval(() => setLiveViewers(v => v + Math.floor(Math.random() * 23) - 8), 2400);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    document.body.style.backgroundImage = `radial-gradient(70% 40% at 50% 0%, ${HERO.creator.brand}33, transparent 70%)`;
    document.body.style.backgroundAttachment = "fixed";
    return () => { document.body.style.backgroundImage = ""; document.body.style.backgroundAttachment = ""; };
  }, []);
  return (
    <>
      <div className="marquee" style={{ backgroundImage: `url(${HERO.img})`, position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 2, padding: "clamp(20px, 3.6vw, 40px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(255,255,255,0.85)" }}>
            <LiveBadge />
            <span>matchday</span><span style={{ opacity: 0.5 }}>·</span><span>non-league cup</span><span style={{ opacity: 0.5 }}>·</span><span style={{ fontStyle: "italic", letterSpacing: "0.04em", textTransform: "none", fontWeight: 500, opacity: 0.85 }}>second half</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 60px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.0, maxWidth: 880 }} className="lower">
            {HERO.title}
          </h1>
          <div style={{ marginTop: 8, fontSize: "clamp(13px, 1.2vw, 16px)", opacity: 0.85, maxWidth: 640 }}>{HERO.sub}</div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <button onClick={onWatch} className="btn btn-grad" style={{ padding: "13px 22px", fontSize: 14 }}>
              <Icon name="play" size={14} stroke={2.4} fill="currentColor" /> watch live
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar creator={HERO.creator} size={34} />
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700 }}>{HERO.creator.name}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }} className="lower">{HERO.creator.handle}</div>
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="tnum" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", color: "white" }}>{formatNum(liveViewers)}</span>
              <span style={{ fontSize: 12, opacity: 0.75, fontStyle: "italic" }}>watching now</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Drops rail — the ONE secondary stream (Shorts-equivalent)
const DropTile = ({ d, onBuy }) => (
  <div className="tile" style={{ width: 200, flex: "0 0 auto" }}>
    <div className="thumb" style={{ aspectRatio: "4/5", backgroundImage: `url(${d.img})` }}>
      <div className="thumb-overlay" />
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}>{d.edition}</span>
      </div>
      <div style={{ position: "absolute", left: 10, bottom: 10, right: 10, color: "white" }}>
        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{d.name}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }} className="lower">{d.creator.handle}</div>
      </div>
    </div>
    <div style={{ padding: "10px 2px 2px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="tnum" style={{ fontSize: 16, fontWeight: 800 }}>{formatNum(d.price)}</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
      </div>
      <button onClick={() => onBuy(d)} className="btn btn-glass" style={{ padding: "6px 12px", fontSize: 11 }}>buy</button>
    </div>
  </div>
);

const HomeScreen = ({ onOpenLive, onOpenMicroCast, toast, setRoute, onOpenMetaCast, onOpenDrop, category }) => {
  const railRef = useRef(null);
  const scrollRail = () => { railRef.current?.scrollBy({ left: 600, behavior: "smooth" }); };

  // Compose the main grid: live + soon + recent VOD, optionally category-filtered
  const baseGrid = useMemo(() => {
    const live = LIVE.map(l => ({ ...l }));
    const soon = SOON.map(s => ({ ...s }));
    const vod  = FOLLOWED_LATEST.map(v => ({ ...v }));
    return [...live, ...soon, ...vod];
  }, []);

  const tiles = useMemo(() => {
    if (!category || category === "all") return baseGrid;
    if (category === "cat-drops") return []; // grid hidden; Drops gets its own page
    const fn = FILTER_MAP[category] || (() => true);
    return baseGrid.filter(t => t.cat ? fn(t) : false);
  }, [baseGrid, category]);

  const isCategoryView = category && category !== "all";

  return (
    <div className="page-pad">
      {!isCategoryView && <Hero onWatch={onOpenLive} />}

      {/* Category header (when filtering) */}
      {isCategoryView && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>category</div>
          <h1 style={{ margin: "4px 0 0", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em" }} className="lower">{FILTER_LABEL[category]}</h1>
        </div>
      )}

      {/* PRIMARY STREAM — uniform grid all the way */}
      <section style={{ marginTop: isCategoryView ? 0 : 28 }}>
        <div className="grid-tiles">
          {tiles.map(t => <GTile key={t.id} post={t} onOpen={t.viewers != null && !t.in && !t.dur ? onOpenLive : onOpenMicroCast} />)}
        </div>
        {tiles.length === 0 && (
          <div style={{ padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }} className="lower">nothing live in this category right now</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>check back later or browse other verticals.</div>
          </div>
        )}
      </section>
    </div>
  );
};

Object.assign(window, { HomeScreen });
})();
