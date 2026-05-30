/* v4 sidebar — Twitch-style persistent left nav with categories + following */
(() => {
const { useState } = React;
const { Icon, Avatar, formatNum, CREATORS, LIVE } = window;

// Which creators are currently live (from LIVE feed)
const liveByCreator = () => {
  const map = new Set();
  LIVE.forEach(l => map.add(l.creator.id));
  return map;
};

const PRIMARY = [
  { id: "home",     label: "home",     icon: "home" },
  { id: "live",     label: "live now", icon: "flame" },
  { id: "library",  label: "library",  icon: "film" },
];

const CATEGORIES = [
  { id: "cat-music",     label: "music",     icon: "play" },
  { id: "cat-gaming",    label: "gaming",    icon: "trend" },
  { id: "cat-sports",    label: "sports",    icon: "flame" },
  { id: "cat-talk",      label: "talk",      icon: "chat" },
  { id: "cat-education", label: "education", icon: "bookmark" },
  { id: "cat-drops",     label: "drops",     icon: "bag" },
  { id: "cat-faith",     label: "faith",     icon: "sparkle" },
  { id: "cat-esports",   label: "esports",   icon: "trend" },
];

const YOU = [
  { id: "following", label: "following", icon: "heart" },
  { id: "explore",   label: "explore",   icon: "grid" },
  { id: "drops",     label: "drops",     icon: "bag" },
  { id: "wallet",    label: "wallet",    icon: "wallet" },
  { id: "profile",   label: "profile",   icon: "user" },
];

const Sidebar = ({ route, setRoute, followingIds, onOpenCreator, onSignOut, toast, onCategory, category, onOpenStudio, isCreator, narrow }) => {
  const liveSet = liveByCreator();
  const followed = CREATORS.filter(c => followingIds.includes(c.id));
  const [followingExpanded, setFollowingExpanded] = useState(false);
  // On the live watch page, highlight "live now" in the sidebar
  const liveActive = route === "live" || (route === "home" && category === "cat-live");

  const goPrimary = (id) => {
    if (id === "live") { setRoute("home"); onCategory("cat-live"); }
    else setRoute(id);
  };

  if (narrow) {
    return (
      <aside className="sidebar-rail">
        <div style={{ padding: "14px 0 10px", display: "flex", justifyContent: "center" }}>
          <button onClick={() => setRoute("home")} aria-label="home" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, background: "transparent" }}>
            <img src={(window.__resources && window.__resources.butterfly) || "assets/butterfly-t.png"} alt="technotainment" className="logo-blend" style={{ height: 28, width: "auto", display: "block" }} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
          {PRIMARY.map(p => (
            <button key={p.id} onClick={() => goPrimary(p.id)} className={`sb-icon-only ${(p.id === "live" ? liveActive : route === p.id) ? "active" : ""}`} title={p.label}>
              <Icon name={p.icon} size={20} />
            </button>
          ))}
          <div className="sb-divider" />
          {followed.slice(0, 10).map(c => (
            <button key={c.id} onClick={() => onOpenCreator(c)} className="sb-icon-only" title={c.handle} style={{ position: "relative" }}>
              <Avatar creator={c} size={32} />
              {liveSet.has(c.id) && <span className="sb-live-dot" style={{ position: "absolute", bottom: 6, right: 6 }} />}
            </button>
          ))}
          <div className="sb-divider" />
          {YOU.map(p => (
            <button key={p.id} onClick={() => setRoute(p.id)} className={`sb-icon-only ${route === p.id ? "active" : ""}`} title={p.label}>
              <Icon name={p.icon} size={20} />
            </button>
          ))}
          <div className="sb-divider" />
          <button onClick={() => onOpenStudio?.()} className="sb-icon-only" title="creator studio">
            <Icon name="cast" size={20} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sb-head">
        <button onClick={() => setRoute("home")} aria-label="technotainment home" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: 0, background: "transparent" }}>
          <img src={(window.__resources && window.__resources.butterfly) || "assets/butterfly-t.png"} alt="" className="logo-blend" style={{ height: 24, width: "auto", display: "block" }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: "var(--ink-1)" }} className="lower">technotainment</span>
        </button>
      </div>

      <div style={{ paddingBottom: 8 }}>
        {PRIMARY.map(p => {
          const active = (p.id === "live")
            ? liveActive
            : route === p.id && !category;
          return (
            <button key={p.id} onClick={() => goPrimary(p.id)} className={`sb-item ${active ? "active" : ""}`}>
              <Icon name={p.icon} size={18} stroke={active ? 2.4 : 1.8} /> {p.label}
            </button>
          );
        })}
      </div>

      <div className="sb-divider" />

      {/* Categories */}
      <div className="sb-section">browse</div>
      <div>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setRoute("home"); onCategory(c.id); }}
            className={`sb-item ${category === c.id && route === "home" ? "active" : ""}`}>
            <Icon name={c.icon} size={18} stroke={1.8} /> {c.label}
          </button>
        ))}
      </div>

      <div className="sb-divider" />

      {/* Following — first 7 then expand */}
      <div className="sb-section">following · {followed.length}</div>
      <div>
        {(followingExpanded ? followed : followed.slice(0, 7)).map(c => {
          const isLive = liveSet.has(c.id);
          return (
            <button key={c.id} onClick={() => onOpenCreator(c)} className="sb-creator">
              <Avatar creator={c} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sb-handle">{c.handle}</div>
                <div className="sb-sub">{isLive ? <span style={{ color: "var(--live)", fontWeight: 700 }}>· live now</span> : c.category}</div>
              </div>
              {isLive && <span className="sb-live-dot" />}
            </button>
          );
        })}
        {followed.length > 7 && (
          <button onClick={() => setFollowingExpanded(e => !e)} className="sb-item" style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 500 }}>
            <Icon name={followingExpanded ? "chevD" : "chevD"} size={16} stroke={2} style={{ transform: followingExpanded ? "rotate(180deg)" : "none" }} />
            {followingExpanded ? "show less" : `show ${followed.length - 7} more`}
          </button>
        )}
      </div>

      <div className="sb-divider" />

      <div className="sb-section">you</div>
      <div>
        {YOU.map(p => (
          <button key={p.id} onClick={() => setRoute(p.id)} className={`sb-item ${route === p.id ? "active" : ""}`}>
            <Icon name={p.icon} size={18} stroke={route === p.id ? 2.4 : 1.8} /> {p.label}
          </button>
        ))}
      </div>

      <div className="sb-divider" />

      <div className="sb-divider" />

      {/* Creator studio mode switch */}
      <button onClick={() => onOpenStudio?.()} className="mode-switch">
        <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", flex: "0 0 34px" }}><Icon name="cast" size={17} stroke={2.2} /></span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13, fontWeight: 700 }} className="lower">{isCreator ? "creator studio" : "become a creator"}</span>
          <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)" }} className="lower">go live · upload · earn</span>
        </span>
      </button>

      {/* Footer (muted) — links wrapped + copyright */}
      <div style={{ padding: "16px 22px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", fontSize: 11, color: "var(--ink-4)" }}>
          {["about", "brand", "safety", "jurisdictions", "cast policy"].map((l, i) => (
            <React.Fragment key={l}>
              <a onClick={() => toast(`${l} · coming soon`)} style={{ cursor: "pointer" }} className="lower">{l}</a>
              {i < 4 && <span style={{ opacity: 0.5 }}>·</span>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "var(--ink-4)", opacity: 0.7 }} className="mono">© 2026 technotainment</div>
      </div>
    </aside>
  );
};

// Mobile drawer wrapping the full sidebar
const SidebarDrawer = ({ open, onClose, ...rest }) => {
  if (!open) return null;
  return (
    <>
      <div className="sb-drawer-scrim" onClick={onClose} />
      <div className="sb-drawer">
        <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--hairline)" }}>
          <img src={(window.__resources && window.__resources.butterfly) || "assets/butterfly-t.png"} alt="technotainment" className="logo-blend" style={{ height: 28, width: "auto" }} />
          <button onClick={onClose} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)" }}>
            <Icon name="close" size={14} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Sidebar {...rest} />
        </div>
      </div>
    </>
  );
};

Object.assign(window, { Sidebar, SidebarDrawer, SIDEBAR_CATEGORIES: CATEGORIES });
})();
