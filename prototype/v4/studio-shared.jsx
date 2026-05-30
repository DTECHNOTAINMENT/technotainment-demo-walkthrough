/* v4 Creator Studio — shared data model, charts, and primitives.
   The studio is a second "mode" of Metascape: same brand system, creator-facing surface.
   Studio identity = Nyx Okafor (@nyxsynth) — rich existing data in data.jsx. */
(() => {
const { useState, useEffect, useRef } = React;
const { Icon, Avatar, CastGlyph, formatNum, findC, NYX_TIERS, NYX_STORE, NYX_LIBRARY } = window;

// ---- the creator who owns this studio -----------------------------------
const STUDIO_ME = findC("nyx");

// CAST <-> fiat: 100 CAST = £1 (matches RECEIPT_DEFAULTS)
const castToGBP = (cast) => cast / 100;
const gbp = (n) => "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const gbpShort = (n) => "£" + (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : Math.round(n).toLocaleString("en-GB"));

// ---- 12-month series (CAST gross) ---------------------------------------
const MONTHS = ["jun","jul","aug","sep","oct","nov","dec","jan","feb","mar","apr","may"];
const EARN_SERIES = [128, 134, 142, 151, 149, 168, 184, 176, 198, 214, 231, 248].map(k => k * 1000); // CAST/mo
const VIEW_SERIES = [212, 224, 241, 268, 255, 289, 318, 301, 332, 358, 372, 401].map(k => k * 1000); // minutes watched proxy
const MEMBER_SERIES = [1820, 1910, 2040, 2180, 2240, 2390, 2510, 2580, 2740, 2910, 3080, 3214];
const FOLLOW_SERIES = [181, 188, 194, 201, 205, 211, 217, 219, 222, 224, 225, 226].map(k => k * 1000);

// ---- revenue split this month (CAST) ------------------------------------
const REVENUE_SPLIT = [
  { id: "subs",    label: "memberships", cast: 142400, color: "#8b5cf6" },
  { id: "tips",    label: "tips",        cast: 48600,  color: "#ec4899" },
  { id: "drops",   label: "drops",       cast: 31200,  color: "#06b6d4" },
  { id: "ppv",     label: "ppv rentals", cast: 14800,  color: "#f97316" },
  { id: "courses", label: "courses",     cast: 11000,  color: "#10b981" },
];
const GROSS_MONTH = REVENUE_SPLIT.reduce((a, r) => a + r.cast, 0); // 248,000
const PLATFORM_RATE = 0.12; // technotainment takes 12%

// ---- tiers (extend NYX_TIERS with member counts & MRR) ------------------
const TIERS = NYX_TIERS.map((t, i) => ({
  ...t,
  id: ["listener", "patch", "lab"][i],
  members: [2186, 892, 136][i],
  color: ["#06b6d4", "#8b5cf6", "#ec4899"][i],
}));
const TOTAL_MEMBERS = TIERS.reduce((a, t) => a + t.members, 0);
const MRR_CAST = TIERS.reduce((a, t) => a + t.members * t.cast, 0);

// ---- content library (extend NYX_LIBRARY with studio metadata) ----------
const CONTENT = [
  { id: "v1", title: "night session #13 · full set", kind: "vod", status: "published", visibility: "public",   views: 41820, watch: "2h 03m", date: "12h ago",  cast: 8420,  thumb: NYX_LIBRARY[0].thumb },
  { id: "v2", title: "patch breakdown · the bass thing", kind: "vod", status: "published", visibility: "members", views: 12410, watch: "28 min", date: "3d ago",   cast: 3110,  thumb: NYX_LIBRARY[1].thumb },
  { id: "v3", title: "solstice live · recording", kind: "vod", status: "published", visibility: "ppv",     views: 8830,  watch: "1h 48m", date: "1w ago",   cast: 14800, thumb: NYX_LIBRARY[2].thumb },
  { id: "v4", title: "coffee patch · sunday slow", kind: "vod", status: "published", visibility: "public",   views: 22140, watch: "52 min", date: "2w ago",   cast: 2240,  thumb: NYX_LIBRARY[3].thumb },
  { id: "v5", title: "buchla deep dive · tape loops & feedback", kind: "vod", status: "processing", visibility: "draft", views: 0, watch: "1h 12m", date: "uploading", cast: 0, thumb: NYX_LIBRARY[4].thumb },
  { id: "v6", title: "studio tour · 2026 rig walkthrough", kind: "vod", status: "draft", visibility: "draft", views: 0,   watch: "12 min", date: "saved draft", cast: 0, thumb: NYX_LIBRARY[5].thumb },
];

// ---- scheduled streams --------------------------------------------------
const SCHEDULE = [
  { id: "sch1", title: "night session #14", when: "today · 21:00", cat: "modular synth", visibility: "public",  reminders: 4820 },
  { id: "sch2", title: "members q&a · patch routing", when: "tomorrow · 19:00", cat: "talk", visibility: "members", reminders: 612 },
  { id: "sch3", title: "release listening · 'glass tide'", when: "mon · 21:00", cat: "music", visibility: "ppv", reminders: 1340 },
];

// ---- store products (extend NYX_STORE with sales) -----------------------
const PRODUCTS = NYX_STORE.map((p, i) => ({
  ...p,
  status: i === 5 ? "draft" : "live",
  sold: [412, 86, 1240, 240, 64, 0, 198, 152][i],
  stock: p.kind === "merch" ? [null, null, null, 38, null, null, null, 22][i] : null,
}));

// ---- earnings / payouts -------------------------------------------------
const PAYOUT = {
  availableCast: 196240,        // ready to withdraw
  pendingCast: 58400,           // clearing (7-day hold)
  lifetimeCast: 4820000,
  nextDate: "1 jun 2026",
  method: { label: "Barclays ··6643", sub: "GBP · faster payments", brand: "linear-gradient(135deg,#0ea5e9,#1e3a8a)" },
};
const PAYOUT_HISTORY = [
  { id: "PO-2041", date: "1 may 2026",  cast: 188600, status: "paid",    method: "Barclays ··6643" },
  { id: "PO-1990", date: "1 apr 2026",  cast: 172400, status: "paid",    method: "Barclays ··6643" },
  { id: "PO-1944", date: "1 mar 2026",  cast: 164900, status: "paid",    method: "Barclays ··6643" },
  { id: "PO-1903", date: "1 feb 2026",  cast: 151200, status: "paid",    method: "Barclays ··6643" },
  { id: "PO-1860", date: "1 jan 2026",  cast: 143800, status: "paid",    method: "Barclays ··6643" },
];

// ---- recent studio activity (live ledger of money in) -------------------
const ACTIVITY = [
  { who: "@oren",   kind: "tip",   cast: 250,  note: "loved the bass patch 🔊", time: "2m" },
  { who: "@hibah",  kind: "sub",   cast: 750,  note: "joined patch archive", time: "6m" },
  { who: "@theo",   kind: "gift",  cast: 1250, note: "gifted 5 listener subs", time: "11m" },
  { who: "@nia",    kind: "drop",  cast: 120,  note: "field recordings · vol 4", time: "18m" },
  { who: "@aaron",  kind: "ppv",   cast: 60,   note: "solstice live · rented", time: "31m" },
  { who: "@quinn",  kind: "tip",   cast: 100,  note: "", time: "44m" },
  { who: "@mira",   kind: "sub",   cast: 2200, note: "joined sound design lab", time: "1h" },
  { who: "@dev",    kind: "drop",  cast: 360,  note: "buchla session · flac", time: "1h" },
];

// ---- top members --------------------------------------------------------
const MEMBER_ROSTER = [
  { handle: "@mira.k",   tier: "sound design lab", since: "8 mo",  cast: 17600, top: true },
  { handle: "@theo.w",   tier: "patch archive",    since: "1 yr",  cast: 9200,  top: true },
  { handle: "@oren.s",   tier: "patch archive",    since: "5 mo",  cast: 6400 },
  { handle: "@hibah.a",  tier: "patch archive",    since: "2 mo",  cast: 2100 },
  { handle: "@dev.r",    tier: "sound design lab", since: "11 mo", cast: 14300, top: true },
  { handle: "@nia.p",    tier: "listener",         since: "3 mo",  cast: 980 },
  { handle: "@quinn.l",  tier: "listener",         since: "1 mo",  cast: 340 },
  { handle: "@aaron.t",  tier: "patch archive",    since: "6 mo",  cast: 5100 },
];

const STUDIO = {
  me: STUDIO_ME, MONTHS, EARN_SERIES, VIEW_SERIES, MEMBER_SERIES, FOLLOW_SERIES,
  REVENUE_SPLIT, GROSS_MONTH, PLATFORM_RATE, TIERS, TOTAL_MEMBERS, MRR_CAST,
  CONTENT, SCHEDULE, PRODUCTS, PAYOUT, PAYOUT_HISTORY, ACTIVITY, MEMBER_ROSTER,
};

/* =========================================================================
   CHARTS — pure SVG, brand-aligned
   ========================================================================= */

// Area sparkline with gradient fill
const AreaSpark = ({ data, w = 560, h = 160, stroke = "#8b5cf6", fill = "rgba(139,92,246,0.18)", pad = 6 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const dx = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * dx, pad + (h - pad * 2) * (1 - (v - min) / span)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L ${pts[0][0].toFixed(1)} ${h - pad} Z`;
  const gid = "ag" + Math.round(Math.random() * 1e6);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => i === pts.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={stroke} />)}
    </svg>
  );
};

// Tiny inline sparkline (KPI cards)
const Spark = ({ data, w = 96, h = 30, stroke = "#8b5cf6", up = true }) => {
  const max = Math.max(...data), min = Math.min(...data), span = max - min || 1;
  const dx = w / (data.length - 1);
  const line = data.map((v, i) => (i ? "L" : "M") + (i * dx).toFixed(1) + " " + ((h - 3) * (1 - (v - min) / span) + 1.5).toFixed(1)).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: "visible" }}>
      <path d={line} fill="none" stroke={up ? stroke : "#ef4444"} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// Vertical bar chart
const Bars = ({ data, labels, h = 180, color = "var(--brand-gradient)", fmt = (v) => v, highlightLast = true }) => {
  const max = Math.max(...data) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: h, padding: "0 2px" }}>
      {data.map((v, i) => {
        const last = i === data.length - 1;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }} title={fmt(v)}>
            <div style={{
              width: "100%", borderRadius: "5px 5px 2px 2px",
              height: `${Math.max(4, (v / max) * (h - 22))}px`,
              background: (last && highlightLast) ? color : "var(--surface-3)",
              transition: "height 0.4s cubic-bezier(.2,.8,.2,1)",
            }} />
            {labels && <span style={{ fontSize: 9, color: last ? "var(--ink-2)" : "var(--ink-4)", fontWeight: last ? 800 : 600 }} className="mono">{labels[i]}</span>}
          </div>
        );
      })}
    </div>
  );
};

// Stacked horizontal segment bar (revenue split)
const SegBar = ({ segments, total }) => (
  <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", background: "var(--surface-2)" }}>
    {segments.map(s => (
      <div key={s.id} style={{ width: `${(s.cast / total) * 100}%`, background: s.color }} title={`${s.label} · ${Math.round((s.cast / total) * 100)}%`} />
    ))}
  </div>
);

/* =========================================================================
   PRIMITIVES
   ========================================================================= */

// KPI stat card
const StatCard = ({ label, value, unit, delta, deltaUp = true, spark, sparkColor = "#8b5cf6", icon, fiat }) => (
  <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, background: "var(--surface)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 7 }}>
        {icon && <Icon name={icon} size={13} stroke={2.4} />}{label}
      </span>
      {delta != null && (
        <span style={{ fontSize: 11, fontWeight: 800, color: deltaUp ? "#10b981" : "#ef4444", display: "inline-flex", alignItems: "center", gap: 3 }} className="tnum">
          <Icon name="trend" size={12} stroke={2.6} style={{ transform: deltaUp ? "none" : "scaleY(-1)" }} />{delta}
        </span>
      )}
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span className="tnum stat-num" style={{ fontSize: 30 }}>{value}</span>
      {unit && <span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 700 }} className="lower">{unit}</span>}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      {fiat ? <span style={{ fontSize: 11, color: "var(--ink-4)" }} className="mono">{fiat}</span> : <span />}
      {spark && <Spark data={spark} stroke={sparkColor} up={deltaUp} />}
    </div>
  </div>
);

// Section card with header (title, sub, action)
const StudioCard = ({ title, sub, action, children, pad = true, style }) => (
  <div className="card" style={{ background: "var(--surface)", ...style }}>
    {(title || action) && (
      <div style={{ padding: "16px 18px", borderBottom: children ? "1px solid var(--hairline)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          {title && <div style={{ fontWeight: 800, fontSize: 15 }} className="lower">{title}</div>}
          {sub && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
        </div>
        {action}
      </div>
    )}
    {children && <div style={pad ? { padding: 18 } : undefined}>{children}</div>}
  </div>
);

// Page header used across studio screens
const StudioPageHead = ({ eyebrow, title, sub, actions }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
    <div>
      {eyebrow && <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>{eyebrow}</div>}
      <h1 style={{ margin: 0, fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05 }} className="lower">{title}</h1>
      {sub && <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6, maxWidth: 620 }}>{sub}</div>}
    </div>
    {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
  </div>
);

// Pill / badge for status
const Pill = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: { bg: "var(--surface-2)", fg: "var(--ink-2)", bd: "var(--hairline)" },
    live:    { bg: "rgba(239,68,68,0.12)", fg: "#ef4444", bd: "rgba(239,68,68,0.3)" },
    ok:      { bg: "rgba(16,185,129,0.12)", fg: "#10b981", bd: "rgba(16,185,129,0.3)" },
    warn:    { bg: "rgba(245,158,11,0.14)", fg: "#f59e0b", bd: "rgba(245,158,11,0.3)" },
    info:    { bg: "rgba(139,92,246,0.14)", fg: "#a78bfa", bd: "rgba(139,92,246,0.3)" },
  };
  const t = tones[tone] || tones.neutral;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }}>{children}</span>;
};

// Segmented control (tabs)
const Seg = ({ items, value, onChange }) => (
  <div style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hairline)" }}>
    {items.map(it => (
      <button key={it.id} onClick={() => onChange(it.id)}
        style={{ padding: "7px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 700, transition: "all 0.15s ease",
          background: value === it.id ? "var(--surface)" : "transparent",
          color: value === it.id ? "var(--ink-1)" : "var(--ink-3)",
          boxShadow: value === it.id ? "var(--shadow-card)" : "none" }} className="lower">
        {it.label}
      </button>
    ))}
  </div>
);

Object.assign(window, {
  STUDIO, STUDIO_ME, castToGBP, gbp, gbpShort,
  AreaSpark, Spark, Bars, SegBar,
  StatCard, StudioCard, StudioPageHead, Pill, Seg,
});
})();
