/* Admin / back-office — app shell: sidebar, topbar, routing.
   Third "mode" of technotainment, gated to operators. */
(() => {
const { useState, useEffect } = React;
const {
  Icon, ADMIN, Pill,
  AdminOverview, AdminUsers, AdminCreators, AdminModeration, AdminFinance, AdminConnectors, AdminGrowth, AdminSettings,
} = window;

const K = (k) => "metascape-admin-" + k;
const load = (k, f) => { try { const v = localStorage.getItem(K(k)); return v ? JSON.parse(v) : f; } catch { return f; } };
const save = (k, v) => { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch {} };

const NAV = [
  { section: null, items: [{ id: "overview", label: "overview", icon: "grid" }] },
  { section: "people", items: [
    { id: "users", label: "users", icon: "users" },
    { id: "creators", label: "creators", icon: "cast" },
  ]},
  { section: "trust & money", items: [
    { id: "moderation", label: "moderation", icon: "flag", badge: ADMIN.PLATFORM.flaggedOpen },
    { id: "finance", label: "finance", icon: "wallet" },
  ]},
  { section: "platform", items: [
    { id: "connectors", label: "connectors", icon: "settings" },
    { id: "growth", label: "seo & growth", icon: "trend" },
  ]},
];

const AdminSidebar = ({ route, setRoute, onExit, narrow }) => {
  const body = (
    <>
      <div className={narrow ? "" : "sb-head"} style={narrow ? { padding: "14px 0 10px", display: "flex", alignItems: "center", justifyContent: "center" } : { justifyContent: "space-between" }}>
        <button onClick={() => setRoute("overview")} aria-label="admin home" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", padding: 0 }}>
          <img src={(window.__resources && window.__resources.butterfly) || "assets/butterfly-t.png"} alt="" className="logo-blend" style={{ height: narrow ? 28 : 22, width: "auto" }} />
          {!narrow && <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em", color: "var(--ink-1)" }} className="lower">technotainment</span>}
        </button>
        {!narrow && <span className="studio-badge" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>admin</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 12 }}>
        {NAV.map((grp, gi) => (
          <div key={gi}>
            {grp.section && !narrow && <div className="sb-section">{grp.section}</div>}
            {grp.section && narrow && <div className="sb-divider" />}
            {grp.items.map(it => {
              const active = route === it.id;
              if (narrow) return (
                <button key={it.id} onClick={() => setRoute(it.id)} className={`sb-icon-only ${active ? "active" : ""}`} title={it.label}>
                  <Icon name={it.icon} size={20} stroke={active ? 2.4 : 1.8} />
                </button>
              );
              return (
                <button key={it.id} onClick={() => setRoute(it.id)} className={`sb-item ${active ? "active" : ""}`}>
                  <Icon name={it.icon} size={18} stroke={active ? 2.4 : 1.8} /> {it.label}
                  {it.badge ? <span style={{ marginLeft: "auto" }}><Pill tone="live">{it.badge}</Pill></span> : null}
                </button>
              );
            })}
          </div>
        ))}
        <div className="sb-divider" />
        {narrow ? (
          <button onClick={() => setRoute("settings")} className={`sb-icon-only ${route === "settings" ? "active" : ""}`} title="settings"><Icon name="settings" size={20} /></button>
        ) : (
          <button onClick={() => setRoute("settings")} className={`sb-item ${route === "settings" ? "active" : ""}`}><Icon name="settings" size={18} stroke={route === "settings" ? 2.4 : 1.8} /> control center</button>
        )}
      </div>

      {narrow ? (
        <button onClick={onExit} className="sb-icon-only" title="exit admin" style={{ marginBottom: 12 }}><Icon name="chevL" size={20} /></button>
      ) : (
        <button onClick={onExit} className="mode-switch" style={{ marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 34px" }}><Icon name="eye" size={16} stroke={2.2} /></span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 700 }} className="lower">exit admin</span>
            <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-3)" }} className="lower">back to the app</span>
          </span>
        </button>
      )}
    </>
  );
  return <aside className={narrow ? "sidebar-rail" : "sidebar"}>{body}</aside>;
};

const AdminTopBar = ({ route, onExit, theme, setTheme, onHamburger }) => {
  const titles = { overview: "overview", users: "users", creators: "creators", moderation: "moderation", finance: "finance", connectors: "connectors", growth: "seo & growth", settings: "control center" };
  return (
    <header className="topbar theme-fade">
      <div style={{ padding: "0 18px", minHeight: 60, display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onHamburger} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)", display: "inline-flex" }} aria-label="open menu">
          <Icon name="grid" size={16} stroke={2} />
        </button>
        <style>{`@media (min-width: 1024px){ header.topbar [aria-label="open menu"]{ display:none !important; } }`}</style>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, whiteSpace: "nowrap" }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ef4444" }}>operations</span>
          <span style={{ fontSize: 15, fontWeight: 800 }} className="lower">{titles[route] || "admin"}</span>
        </div>
        <div style={{ flex: 1 }} />
        <span className="studio-badge" style={{ borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> {ADMIN.PLATFORM.uptime}% up</span>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="theme-toggle" aria-label="toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} stroke={2.2} />
        </button>
        <button onClick={onExit} className="theme-toggle" style={{ background: "transparent", borderImage: "none", border: "none", padding: 0 }} aria-label="exit admin">
          <span style={{ width: 32, height: 32, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#ef4444,#b91c1c)", color: "white", fontSize: 11, fontWeight: 800 }}>OP</span>
        </button>
      </div>
    </header>
  );
};

const AdminApp = ({ onExit, theme, setTheme, toast }) => {
  const [route, setRoute] = useState(() => load("route", "overview"));
  useEffect(() => save("route", route), [route]);
  const [drawer, setDrawer] = useState(false);
  const nav = (r) => { setRoute(r); setDrawer(false); window.scrollTo(0, 0); };
  const shared = { route, setRoute: nav, onExit };

  return (
    <div className="app-shell studio-scope">
      <AdminSidebar {...shared} />
      <AdminSidebar {...shared} narrow />

      <div className="main-col">
        <AdminTopBar route={route} onExit={onExit} theme={theme} setTheme={setTheme} onHamburger={() => setDrawer(true)} />
        <main className="theme-fade">
          {route === "overview"   && <AdminOverview setRoute={nav} toast={toast} />}
          {route === "users"      && <AdminUsers toast={toast} />}
          {route === "creators"   && <AdminCreators toast={toast} />}
          {route === "moderation" && <AdminModeration toast={toast} />}
          {route === "finance"    && <AdminFinance toast={toast} />}
          {route === "connectors" && <AdminConnectors toast={toast} />}
          {route === "growth"     && <AdminGrowth toast={toast} />}
          {route === "settings"   && <AdminSettings toast={toast} />}
        </main>
      </div>

      {drawer && (
        <>
          <div className="sb-drawer-scrim" onClick={() => setDrawer(false)} />
          <div className="sb-drawer">
            <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--hairline)" }}>
              <span className="studio-badge" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>admin</span>
              <button onClick={() => setDrawer(false)} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)" }}><Icon name="close" size={14} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}><AdminSidebar {...shared} /></div>
          </div>
        </>
      )}
    </div>
  );
};

Object.assign(window, { AdminApp });
})();
