/* v2 MicroCast page — creator hero + tabs + dense library/store */
(() => {
const { useState } = React;
const { Icon, Avatar, LiveBadge, ViewerBadge, Thumb, Tile, CastGlyph, formatNum,
        NYX_TIERS, NYX_STORE, NYX_LIBRARY, CREATORS, pic } = window;

const MicroCastScreen = ({ creator, onSubscribe, onOpenTip, onOpenLive, onOpenDrop, onOpenPPV, setRoute, toast, isOwnChannel, onOpenStudio }) => {
  const c = creator || CREATORS[0];
  const [tab, setTab] = useState("live");
  const [following, setFollowing] = useState(false);

  const BANNER = pic(`${c.id}-banner-${c.brand}`);

  return (
    <div style={{ paddingBottom: 96 }}>
      {/* HERO */}
      <div style={{ position: "relative", height: "clamp(220px, 32vw, 380px)", backgroundImage: `url(${BANNER})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 70%, var(--bg) 100%), linear-gradient(135deg, ${c.brand}88, transparent 60%)` }} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 0, transform: "translateY(40%)", maxWidth: 1440, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-end", flexWrap: "wrap" }}>
            <span style={{ padding: 4, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand}, ${c.brand2})`, boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)" }}>
              <span style={{ display: "block", padding: 3, borderRadius: "50%", background: "var(--bg)" }}>
                <Avatar creator={c} size={110} />
              </span>
            </span>
            <div style={{ flex: 1, minWidth: 240, color: "white" }}>
              <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 800, opacity: 0.85 }}>microcast · creator destination</div>
              <h1 style={{ margin: "6px 0 4px", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{c.name}</h1>
              <div style={{ fontSize: 13, opacity: 0.9 }} className="lower">{c.handle} · {c.category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + actions */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "80px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", color: "var(--ink-1)" }}>
            <div><div className="tnum stat-num" style={{ fontSize: 22 }}>{formatNum(c.followers)}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">followers</div></div>
            <div><div className="tnum stat-num brand-grad-text" style={{ fontSize: 22 }}>1,842</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">members</div></div>
            <div><div className="tnum stat-num" style={{ fontSize: 22 }}>312</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">live hours</div></div>
            <div><div className="tnum stat-num" style={{ fontSize: 22 }}>@theo</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">top supporter</div></div>
            <div><div className="tnum stat-num" style={{ fontSize: 22 }}>48</div><div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">drops to date</div></div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isOwnChannel ? (
              <>
                <span className="studio-badge" style={{ alignSelf: "center" }}><Icon name="check" size={12} stroke={2.6} /> your channel</span>
                <button onClick={() => onOpenStudio?.()} className="btn btn-grad" style={{ padding: "10px 16px" }}>
                  <Icon name="cast" size={14} stroke={2.2} /> manage in studio
                </button>
                <button onClick={() => onOpenStudio?.()} className="btn btn-grad-stroke" style={{ padding: "10px 16px" }}>
                  <Icon name="settings" size={14} stroke={2.2} /> edit channel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setFollowing(f => !f); toast(following ? "unfollowed" : `following ${c.handle}`); }} className="btn btn-glass" style={{ padding: "10px 16px" }}>
                  <Icon name="heart" size={14} stroke={2.4} fill={following ? "currentColor" : "none"} /> {following ? "following" : "follow"}
                </button>
                <button onClick={(e) => onOpenTip(c, e.currentTarget)} className="btn btn-grad" style={{ padding: "10px 16px" }}>
                  <Icon name="tip" size={14} stroke={2.4} /> tip with CAST
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 22, borderBottom: "1px solid var(--hairline)", display: "flex", gap: 24, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 0 }}>
          {[
            { id: "live", label: "live & upcoming" },
            { id: "library", label: "library" },
            { id: "store", label: "store" },
            { id: "members", label: "membership" },
            { id: "about", label: "about" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`nav-link ${tab === t.id ? "active" : ""}`} style={{ paddingBottom: 14 }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab body */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 16px 0" }}>
        {tab === "live" && (
          <div className="rail">
            <Tile post={{ id: "u1", creator: c, title: `night session #13 · live`, viewers: 892, thumb: pic(`${c.id}-live`) }} onOpen={onOpenLive} />
            <Tile post={{ id: "u2", creator: c, title: "patch workshop · members only", in: "tomorrow 19:00", thumb: pic(`${c.id}-up1`) }} onOpen={onOpenLive} />
            <Tile post={{ id: "u3", creator: c, title: "open q&a", in: "sat 16:00", thumb: pic(`${c.id}-up2`) }} onOpen={onOpenLive} />
            <Tile post={{ id: "u4", creator: c, title: "release listening · 'glass tide'", in: "mon 21:00", thumb: pic(`${c.id}-up3`) }} onOpen={onOpenLive} />
            <Tile post={{ id: "u5", creator: c, title: "studio tour · 2026 edition", in: "wed 17:00", thumb: pic(`${c.id}-up4`) }} onOpen={onOpenLive} />
          </div>
        )}

        {tab === "library" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {NYX_LIBRARY.concat(NYX_LIBRARY.map(v => ({ ...v, id: v.id + "x", title: v.title + " · part 2" }))).map(p => (
              <Tile key={p.id} post={p} onOpen={onOpenLive} size="md" />
            ))}
          </div>
        )}

        {tab === "store" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {["all", "drops", "courses", "merch", "ppv"].map(f => (
                <button key={f} className={`chip ${f === "all" ? "active" : ""}`} onClick={() => toast(`filter · ${f}`)}>{f}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {NYX_STORE.map(p => (
                <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div className="thumb" style={{ aspectRatio: "4/3", borderRadius: 0, backgroundImage: `url(${p.img})` }}>
                    <div className="thumb-overlay" />
                    <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 800, color: "white", background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 6, letterSpacing: "0.1em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}>{p.kind}</span>
                  </div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{p.edition}</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span className="tnum brand-grad-text" style={{ fontWeight: 800, fontSize: 20 }}>{p.price}</span>
                        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
                      </div>
                      <button onClick={() => p.kind === "ppv" ? onOpenPPV({ ...p, window: "48h rental" }, c) : onOpenDrop({ ...p, creator: c }, c)} className="btn btn-grad" style={{ padding: "8px 14px", fontSize: 12 }}>buy</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "members" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {NYX_TIERS.map((t, i) => (
              <div key={i} className={`tier ${t.popular ? "popular" : ""}`}>
                {t.popular && <span style={{ position: "absolute", top: -10, left: 18, fontSize: 10, fontWeight: 800, color: "white", padding: "4px 10px", borderRadius: 999, background: "var(--brand-gradient)", letterSpacing: "0.08em", textTransform: "uppercase" }}>most members</span>}
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>{t.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                  <span className="tnum brand-grad-text stat-num" style={{ fontSize: 38 }}>{t.cast}</span>
                  <span style={{ fontSize: 13, color: "var(--ink-3)" }}>CAST / month</span>
                </div>
                <ul style={{ paddingLeft: 0, listStyle: "none", margin: "16px 0 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {t.perks.map((p, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                      <Icon name="check" size={16} stroke={2.4} style={{ color: c.brand, flex: "0 0 16px", marginTop: 2 }} /> <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={(e) => onSubscribe(c, t, e.currentTarget)} className="btn btn-grad" style={{ width: "100%", padding: "12px" }}>
                  subscribe with CAST
                </button>
                <div style={{ marginTop: 10, fontSize: 10, color: "var(--ink-4)", textAlign: "center" }} className="mono">renews monthly · cancel any time</div>
              </div>
            ))}
          </div>
        )}

        {tab === "about" && (
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>about</div>
              <p style={{ fontSize: 15, lineHeight: 1.65, marginTop: 8, color: "var(--ink-2)" }}>
                {c.name} streams from {c.category === "modular synth" ? "lisbon" : "the road"}. live work twice a week, archives every set, runs a monthly q&a for members. the audience belongs to {c.name.split(" ")[0]} — if they ever move off-platform, the relationship moves with them.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>where you can find this microcast</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {["metascape", "small rooms metacast", `embedded on ${c.handle.replace("@","")}.fm`].map(loc => <span key={loc} className="chip">{loc}</span>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>what {c.name.split(" ")[0]} keeps about her members</div>
              <div style={{ marginTop: 10, padding: 16, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
                handle, email, and subscription history (required to run membership).
                <div style={{ marginTop: 6 }}>listening / watch history — only if you allow it. controlled in <a onClick={() => setRoute("profile")} style={{ textDecoration: "underline", cursor: "pointer" }}>profile → consent</a>.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { MicroCastScreen });
})();
