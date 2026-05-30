/* Creator Studio — app shell: sidebar, topbar, routing.
   Rendered as a second "mode" of Metascape from app.jsx. */
(() => {
const { useState, useEffect } = React;
const {
  Icon, Avatar, formatNum, STUDIO,
  DashboardScreen, GoLiveScreen, ContentScreen, AudienceScreen, MembershipsScreen,
  StoreScreen, EarningsScreen, AnalyticsScreen, SettingsScreen, UploadModal, VideoEditScreen, MonetizationScreen, Pill,
} = window;

const K = (k) => "metascape-studio-" + k;
const load = (k, f) => { try { const v = localStorage.getItem(K(k)); return v ? JSON.parse(v) : f; } catch { return f; } };
const save = (k, v) => { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch {} };

const NAV = [
  { section: null, items: [{ id: "dashboard", label: "dashboard", icon: "grid" }] },
  { section: "create", items: [
    { id: "golive", label: "go live", icon: "flame" },
    { id: "content", label: "content", icon: "film" },
    { id: "store", label: "store", icon: "bag" },
  ]},
  { section: "grow", items: [
    { id: "audience", label: "audience", icon: "users" },
    { id: "memberships", label: "memberships", icon: "heart" },
    { id: "analytics", label: "analytics", icon: "trend" },
  ]},
  { section: "money", items: [
    { id: "monetization", label: "monetization", icon: "cast" },
    { id: "earnings", label: "earnings", icon: "wallet" },
  ]},
];

const StudioSidebar = ({ route, setRoute, onExit, live, narrow }) => {
  const s = STUDIO;
  const body = (
    <>
      <div className={narrow ? "" : "sb-head"} style={narrow ? { padding: "14px 0 10px", display: "flex", alignItems: "center", justifyContent: "center" } : { justifyContent: "space-between" }}>
        <button onClick={() => setRoute("dashboard")} aria-label="studio home" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", padding: 0 }}>
          <img src={(window.__resources && window.__resources.butterfly) || "assets/butterfly-t.png"} alt="" className="logo-blend" style={{ height: narrow ? 28 : 22, width: "auto" }} />
          {!narrow && <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em", color: "var(--ink-1)" }} className="lower">technotainment</span>}
        </button>
        {!narrow && <span className="studio-badge">studio</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {NAV.map((grp, gi) => (
          <div key={gi}>
            {grp.section && !narrow && <div className="sb-section">{grp.section}</div>}
            {grp.section && narrow && <div className="sb-divider" />}
            {grp.items.map(it => {
              const active = route === it.id;
              if (narrow) return (
                <button key={it.id} onClick={() => setRoute(it.id)} className={`sb-icon-only ${active ? "active" : ""}`} title={it.label} style={{ position: "relative" }}>
                  <Icon name={it.icon} size={20} stroke={active ? 2.4 : 1.8} />
                  {it.id === "golive" && live && <span className="sb-live-dot" style={{ position: "absolute", top: 8, right: 8, background: "#ef4444" }} />}
                </button>
              );
              return (
                <button key={it.id} onClick={() => setRoute(it.id)} className={`sb-item ${active ? "active" : ""}`}>
                  <Icon name={it.icon} size={18} stroke={active ? 2.4 : 1.8} /> {it.label}
                  {it.id === "golive" && live && <span style={{ marginLeft: "auto" }}><Pill tone="live">live</Pill></span>}
                </button>
              );
            })}
          </div>
        ))}

        <div className="sb-divider" />
        {narrow ? (
          <button onClick={() => setRoute("settings")} className={`sb-icon-only ${route === "settings" ? "active" : ""}`} title="settings"><Icon name="settings" size={20} /></button>
        ) : (
          <button onClick={() => setRoute("settings")} className={`sb-item ${route === "settings" ? "active" : ""}`}><Icon name="settings" size={18} stroke={route === "settings" ? 2.4 : 1.8} /> settings</button>
        )}
      </div>

      {/* Exit to viewer */}
      {narrow ? (
        <button onClick={onExit} className="sb-icon-only" title="exit studio" style={{ marginBottom: 12 }}><Icon name="chevL" size={20} /></button>
      ) : (
        <button onClick={onExit} className="mode-switch" style={{ marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 34px" }}><Icon name="eye" size={16} stroke={2.2} /></span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 700 }} className="lower">exit studio</span>
            <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)" }} className="lower">back to watching</span>
          </span>
        </button>
      )}
    </>
  );
  return <aside className={narrow ? "sidebar-rail" : "sidebar"}>{body}</aside>;
};

const StudioTopBar = ({ route, live, onExit, onViewPublic, theme, setTheme, onUpload, onHamburger }) => {
  const s = STUDIO;
  const titles = { dashboard: "dashboard", golive: "go live", content: "content", video: "edit video", store: "store", audience: "audience", memberships: "memberships", monetization: "monetization", analytics: "analytics", earnings: "earnings", settings: "settings" };
  return (
    <header className="topbar theme-fade">
      <div style={{ padding: "0 18px", minHeight: 60, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onHamburger} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)", display: "inline-flex" }} aria-label="open menu">
          <Icon name="grid" size={16} stroke={2} />
        </button>
        <style>{`@media (min-width: 1024px){ header.topbar [aria-label="open menu"]{ display:none !important; } }`}</style>

        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)" }}>creator studio</span>
          <span style={{ fontSize: 15, fontWeight: 800 }} className="lower">{titles[route] || "studio"}</span>
        </div>

        <div style={{ flex: 1 }} />

        {live && <span className="onair">on air</span>}

        <button onClick={onViewPublic} className="btn btn-glass" style={{ padding: "9px 14px", fontSize: 13 }}><Icon name="eye" size={14} stroke={2.2} /> view channel</button>

        <button onClick={onUpload} className="btn btn-glass" style={{ padding: "9px 14px", fontSize: 13 }}><Icon name="plus" size={14} stroke={2.6} /> upload</button>

        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="theme-toggle" aria-label="toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} stroke={2.2} />
        </button>

        <button onClick={onExit} className="theme-toggle" style={{ background: "transparent", borderImage: "none", border: "none", padding: 0 }} aria-label="channel">
          <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg,${s.me.brand},${s.me.brand2})`, display: "inline-flex" }}><Avatar creator={s.me} size={32} /></span>
        </button>
      </div>
    </header>
  );
};

const StudioApp = ({ onExit, onViewPublic, theme, setTheme, toast }) => {
  const [route, setRoute] = useState(() => load("route", "dashboard"));
  useEffect(() => save("route", route), [route]);
  const [live, setLive] = useState(() => load("live", false));
  useEffect(() => save("live", live), [live]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const goLive = () => setRoute("golive");
  const openUpload = () => setUploadOpen(true);
  const openVideo = (v) => { setActiveVideo(v); setRoute("video"); window.scrollTo(0, 0); };
  const nav = (r) => { setRoute(r); setDrawer(false); };

  const shared = { route, setRoute: nav, onExit, live };

  return (
    <div className="app-shell studio-scope">
      <StudioSidebar {...shared} />
      <StudioSidebar {...shared} narrow />

      <div className="main-col">
        <StudioTopBar route={route} live={live} onExit={onExit} onViewPublic={onViewPublic} theme={theme} setTheme={setTheme} onUpload={openUpload} onHamburger={() => setDrawer(true)} />

        <main className="theme-fade">
          {route === "dashboard"   && <DashboardScreen setStudioRoute={nav} onGoLive={goLive} onUpload={openUpload} onOpenVideo={openVideo} live={live} toast={toast} />}
          {route === "golive"      && <GoLiveScreen live={live} setLive={setLive} toast={toast} />}
          {route === "content"     && <ContentScreen toast={toast} onUpload={openUpload} onOpenVideo={openVideo} />}
          {route === "video"       && <VideoEditScreen video={activeVideo} onBack={() => setRoute("content")} onViewPublic={onViewPublic} toast={toast} />}
          {route === "audience"    && <AudienceScreen toast={toast} />}
          {route === "memberships" && <MembershipsScreen toast={toast} />}
          {route === "store"       && <StoreScreen toast={toast} />}
          {route === "monetization" && <MonetizationScreen setStudioRoute={nav} toast={toast} />}
          {route === "earnings"    && <EarningsScreen toast={toast} />}
          {route === "analytics"   && <AnalyticsScreen toast={toast} />}
          {route === "settings"    && <SettingsScreen toast={toast} />}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <>
          <div className="sb-drawer-scrim" onClick={() => setDrawer(false)} />
          <div className="sb-drawer">
            <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--hairline)" }}>
              <span className="studio-badge">creator studio</span>
              <button onClick={() => setDrawer(false)} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)" }}><Icon name="close" size={14} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}><StudioSidebar {...shared} /></div>
          </div>
        </>
      )}

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} toast={toast} />
    </div>
  );
};

Object.assign(window, { StudioApp });
})();
