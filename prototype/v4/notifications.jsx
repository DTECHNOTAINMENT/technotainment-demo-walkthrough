/* v3 notifications drawer */
(() => {
const { useState } = React;
const { Icon, Avatar, NOTIFICATIONS } = window;

const NotificationsDrawer = ({ open, onClose, onMarkAll, onOpenCreator, onOpenRoute, toast }) => {
  const [groups, setGroups] = useState(NOTIFICATIONS);
  if (!open) return null;

  const totalUnread = groups.reduce((a, g) => a + g.items.filter(i => i.unread).length, 0);
  const markAll = () => { setGroups(gs => gs.map(g => ({ ...g, items: g.items.map(i => ({ ...i, unread: false })) }))); onMarkAll?.(); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, background: "var(--bg)", borderLeft: "1px solid var(--hairline)", display: "flex", flexDirection: "column", animation: "drawerIn 0.22s ease-out" }}>
        <style>{`@keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
        <div className="brand-hairline" />
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }} className="lower">notifications</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{totalUnread} unread</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={markAll} className="btn btn-glass" style={{ padding: "7px 12px", fontSize: 11 }}><Icon name="check" size={12} stroke={2.4} /> mark all read</button>
            <button onClick={onClose} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)" }}><Icon name="close" size={14} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {groups.map(g => (
            <div key={g.group}>
              <div style={{ padding: "12px 18px 6px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>{g.group}</div>
              {g.items.map(it => (
                <button key={it.id} onClick={() => { onOpenCreator(it.creator); onClose(); }} style={{ width: "100%", padding: "12px 18px", display: "flex", gap: 12, alignItems: "center", textAlign: "left", background: it.unread ? "linear-gradient(90deg, rgba(139,92,246,0.06), transparent)" : "transparent", borderLeft: it.unread ? "2px solid" : "2px solid transparent", borderImage: it.unread ? "var(--brand-gradient) 1" : "none" }}>
                  <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${it.creator.brand}, ${it.creator.brand2})` }}>
                    <Avatar creator={it.creator} size={36} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: it.unread ? 700 : 500, color: "var(--ink-1)" }}>{it.text}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{it.creator.handle} · {it.time}</div>
                  </div>
                  {it.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-gradient)", flex: "0 0 7px" }} />}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between" }}>
          <a onClick={() => { onOpenRoute("profile"); onClose(); }} style={{ fontSize: 12, color: "var(--ink-3)", cursor: "pointer", textDecoration: "underline" }}>notification preferences</a>
          <a onClick={() => toast("muted for 8h")} style={{ fontSize: 12, color: "var(--ink-3)", cursor: "pointer", textDecoration: "underline" }}>mute for 8h</a>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { NotificationsDrawer });
})();
