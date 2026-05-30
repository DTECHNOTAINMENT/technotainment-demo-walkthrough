/* v2 shared primitives — Icon (lucide-style line), Avatar, Thumb, MicroCastCard, LiveBadge,
   CastPill, Modal, ToastHost, flyCast */
(() => {
const { useState, useEffect, useRef, useMemo, useContext, createContext } = React;

// ---- Inline SVG icon set (line, 2px stroke, rounded, lucide-aligned) ----
const ICONS = {
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
  bell:   <><path d="M6 9a6 6 0 1112 0v5l1.5 2.5h-15L6 14V9z"/><path d="M10 19a2 2 0 004 0"/></>,
  plus:   <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  minus:  <path d="M5 12h14"/>,
  close:  <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
  check:  <path d="M5 12l5 5L20 7"/>,
  chevR:  <path d="M9 6l6 6-6 6"/>,
  chevL:  <path d="M15 6l-6 6 6 6"/>,
  chevD:  <path d="M6 9l6 6 6-6"/>,
  arrowR: <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
  play:   <path d="M7 4l13 8-13 8V4z" fill="currentColor" stroke="none"/>,
  pause:  <><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></>,
  heart:  <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z"/>,
  home:   <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none"/></>,
  user:   <><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>,
  users:  <><circle cx="9" cy="8" r="4"/><circle cx="17" cy="9" r="3"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6"/><path d="M16 21c.6-2.4 2-4 4-4"/></>,
  grid:   <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  tip:    <><path d="M12 3v18"/><path d="M16 7H10a2.5 2.5 0 000 5h4a2.5 2.5 0 010 5H7"/></>,
  share:  <><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4"/><path d="M8 13l8 4"/></>,
  sun:    <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></>,
  moon:   <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>,
  flame:  <path d="M12 3s5 4 5 9a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 3 2-2-3 0-5 0-7z"/>,
  ticket: <><path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z"/><path d="M9 7v10"/></>,
  gift:   <><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18"/><path d="M12 8v13"/><path d="M12 8s-3-4-5-2 2 2 5 2zM12 8s3-4 5-2-2 2-5 2z"/></>,
  bag:    <><path d="M6 7h12l-1 12a2 2 0 01-2 2H9a2 2 0 01-2-2L6 7z"/><path d="M9 7V5a3 3 0 016 0v2"/></>,
  eye:    <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.4 1.8l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.8-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1A1.7 1.7 0 008.6 19a1.7 1.7 0 00-1.8.4l-.06.06A2 2 0 113.91 16.6l.06-.06a1.7 1.7 0 00.4-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 005 8.6a1.7 1.7 0 00-.4-1.8L4.55 6.7a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009.24 4.3a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.4l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.4 1.8V9.4a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
  download: <><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
  cast:   <><circle cx="12" cy="12" r="9"/><path d="M9 9l3 6 3-6"/><path d="M9 13h6"/></>,
  send:   <path d="M3 12l18-8-7 18-3-8-8-2z"/>,
  film:   <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 12h18M3 7h4M3 17h4M17 7h4M17 17h4"/></>,
  flag:   <><path d="M4 21V4"/><path d="M4 5h13l-2 3 2 3H4"/></>,
  lock:   <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
  more:   <><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
  trend:  <><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/></>,
  sparkle:<path d="M12 3l1.6 5L18 9.6 13.6 12 12 17 10.4 12 6 9.6 10.4 8 12 3z" fill="currentColor" stroke="none"/>,
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4z"/>,
  clock:  <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
};

const Icon = ({ name, size = 20, stroke = 2, className = "", style = {}, fill = "none" }) => {
  const path = ICONS[name];
  if (!path) return <span className={className} style={{ display: "inline-block", width: size, height: size, ...style }} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      {path}
    </svg>
  );
};

// ---- CAST glyph + formatter ---------------------------------------------
const formatNum = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/,"") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/,"") + "K";
  return n.toLocaleString();
};
const CastGlyph = ({ size = 22 }) => (
  <span className="cast-glyph" style={{ width: size, height: size, fontSize: size * 0.5 }}>C</span>
);

// ---- Avatar (gradient ring optional) ------------------------------------
const Avatar = ({ creator, size = 40, ring = false }) => {
  const initials = creator?.name ? creator.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "??";
  const inner = (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: creator?.brand ? `linear-gradient(135deg, ${creator.brand}, ${creator.brand2})` : "linear-gradient(135deg,#333,#666)",
      color: "white", fontWeight: 800, fontSize: size * 0.38,
      display: "flex", alignItems: "center", justifyContent: "center",
      flex: `0 0 ${size}px`,
      overflow: "hidden"
    }}>{initials}</div>
  );
  if (ring) {
    return (
      <span className="av-ring" style={{ display: "inline-block" }}>
        <span className="av-inner" style={{ display: "inline-block" }}>{inner}</span>
      </span>
    );
  }
  return inner;
};

// ---- LiveBadge ----------------------------------------------------------
const LiveBadge = () => <span className="live-pill">live</span>;
const ViewerBadge = ({ n, ml = false }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    background: "rgba(0,0,0,0.65)", color: "white",
    padding: "3px 8px", borderRadius: 6,
    fontSize: 11, fontWeight: 700,
    backdropFilter: "blur(6px)",
    marginLeft: ml ? 6 : 0
  }} className="tnum">
    <Icon name="eye" size={11} stroke={2.4} /> {formatNum(n)}
  </span>
);

// ---- Thumb (image or gradient placeholder) ------------------------------
const Thumb = ({ src, gradClass = "thumb-grad-1", title, overlay = true, children, style }) => (
  <div className={`thumb ${src ? "" : gradClass}`} style={{ backgroundImage: src ? `url(${src})` : undefined, ...style }}>
    {overlay && <div className="thumb-overlay" />}
    {children}
    {title && !src && <div className="thumb-title">{title}</div>}
  </div>
);

// ---- MicroCast tile (portable) ------------------------------------------
const Tile = ({ post, onOpen, size = "md" }) => {
  // size: sm (rail), md (default), lg (hero column)
  const widths = { sm: 280, md: 320, lg: 360 };
  const gradClass = `thumb-grad-${(parseInt(post.id?.slice(1)) || 1) % 12 + 1}`;
  return (
    <div className="tile" style={{ width: widths[size], cursor: "pointer" }} onClick={() => onOpen?.(post)}>
      <Thumb src={post.thumb} gradClass={gradClass} title={post.title}>
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
          {post.viewers != null && (post.cat || post.live !== false) && <LiveBadge />}
          {post.viewers != null && <ViewerBadge n={post.viewers} />}
          {post.in && (
            <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum">
              <Icon name="clock" size={11} stroke={2.4} style={{ marginRight: 4, verticalAlign: -1 }} />in {post.in}
            </span>
          )}
          {post.dur && !post.in && post.viewers == null && (
            <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }} className="tnum">
              {post.dur}
            </span>
          )}
          {post.tg && (
            <span style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}>
              tier {post.tg}+
            </span>
          )}
        </div>
        {/* Bottom-left: brand-ring avatar */}
        <div style={{ position: "absolute", left: 10, bottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${post.creator.brand}, ${post.creator.brand2})` }}>
            <Avatar creator={post.creator} size={26} />
          </span>
        </div>
      </Thumb>
      <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, color: "var(--ink-1)", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}>{post.title}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }} className="lower">
            <span>{post.creator.handle}</span>
            {post.viewers != null && <span>· <span className="tnum">{formatNum(post.viewers)}</span> watching</span>}
            {post.ago && <span>· {post.ago}</span>}
            {post.dur && post.ago && <span>· {post.dur}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Modal --------------------------------------------------------------
const Modal = ({ open, onClose, title, children, width }) => {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal theme-fade" style={width ? { maxWidth: width } : undefined} onClick={e => e.stopPropagation()}>
        <div className="brand-hairline" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 8px" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }} className="lower">{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2)" }}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div style={{ padding: "8px 20px 20px" }}>{children}</div>
      </div>
    </div>
  );
};

// ---- Toast --------------------------------------------------------------
const ToastCtx = createContext(null);
const ToastHost = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, ...opts }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 2600);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-host">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.icon && <CastGlyph size={18} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
const useToast = () => useContext(ToastCtx);

// ---- Flying CAST chip ---------------------------------------------------
const flyCast = (amount, fromEl) => {
  if (!fromEl) return;
  const rect = fromEl.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "cast-fly";
  el.style.left = (rect.left + rect.width / 2) + "px";
  el.style.top  = rect.top + "px";
  el.innerHTML = `<span class="cast-glyph" style="width:14px;height:14px;font-size:9px;">C</span>–${amount}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
};

// ---- Section head -------------------------------------------------------
const SectionHead = ({ title, sub, action, eyebrow }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 16px", marginBottom: 14, gap: 16 }}>
    <div>
      {eyebrow && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, color: "var(--ink-3)", marginBottom: 6 }}>
          {eyebrow.icon && <Icon name={eyebrow.icon} size={12} stroke={2.4} />}
          {eyebrow.text}
        </div>
      )}
      <h2 style={{ margin: 0, fontSize: "clamp(22px, 2.6vw, 30px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }} className="lower">{title}</h2>
      {sub && <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

Object.assign(window, {
  Icon, formatNum, CastGlyph, Avatar, LiveBadge, ViewerBadge, Thumb, Tile, Modal, ToastHost, useToast, flyCast, SectionHead
});
})();
