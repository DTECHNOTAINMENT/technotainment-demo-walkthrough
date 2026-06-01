"use client";

// Notification bell + slide-in drawer — ported from prototype/v4/notifications.jsx
// NotificationsDrawer. There's no notifications model yet, so items are demo stand-ins shaped
// like the prototype's NOTIFICATIONS (grouped: live now / new drops / renewals), with an unread
// dot on the bell, "mark all read", and a link to notification settings. The full /notifications
// page stays as the canonical list.
import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Avatar, type CreatorLike } from "@/components/ui/primitives";
import { channelHref } from "@/lib/links";

interface NItem {
  id: string;
  creator: CreatorLike;
  handle: string;
  text: string;
  time: string;
  unread: boolean;
}
interface NGroup {
  group: string;
  items: NItem[];
}

const SEED: NGroup[] = [
  {
    group: "live now",
    items: [
      { id: "n1", creator: { name: "Marlowe Reed", handle: "@marlowe", brand: "#f59e0b", brand2: "#ef4444" }, handle: "@marlowe", text: "kiln opening · 24 pieces", time: "14 min", unread: true },
      { id: "n2", creator: { name: "Joon Park", handle: "@joon", brand: "#06b6d4", brand2: "#3b82f6" }, handle: "@joon", text: "saturday 4-hour drawing", time: "32 min", unread: true },
    ],
  },
  {
    group: "new drops",
    items: [
      { id: "n4", creator: { name: "Marlowe Reed", handle: "@marlowe", brand: "#f59e0b", brand2: "#ef4444" }, handle: "@marlowe", text: "kiln drop 048 · small bowl · 62 / 150 left", time: "1h", unread: true },
      { id: "n5", creator: { name: "Kavi Anand", handle: "@kavi", brand: "#10b981", brand2: "#22c55e" }, handle: "@kavi", text: "house apron · ships worldwide", time: "3h", unread: false },
    ],
  },
  {
    group: "renewals coming up",
    items: [
      { id: "n6", creator: { name: "Nyx Okafor", handle: "@nyx", brand: "#8b5cf6", brand2: "#ec4899" }, handle: "@nyx", text: "tier 2 renews wed 4 jun · 750 CAST", time: "in 8 days", unread: false },
    ],
  },
];

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<NGroup[]>(SEED);

  const totalUnread = groups.reduce((a, g) => a + g.items.filter((i) => i.unread).length, 0);

  function markAll() {
    setGroups((gs) => gs.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, unread: false })) })));
  }

  return (
    <>
      <button
        type="button"
        className="theme-toggle"
        aria-label="notifications"
        onClick={() => setOpen(true)}
        style={{ transform: "none", position: "relative" }}
      >
        <Icon name="bell" size={17} />
        {totalUnread > 0 && (
          <span
            aria-hidden
            style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--brand-gradient)", border: "1.5px solid var(--surface)" }}
          />
        )}
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "flex-end" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="notifications"
            style={{ width: "100%", maxWidth: 420, background: "var(--bg)", borderLeft: "1px solid var(--hairline)", display: "flex", flexDirection: "column", animation: "drawerIn 0.22s ease-out" }}
          >
            <style>{`@keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <div className="brand-hairline" />
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div className="lower" style={{ fontSize: 18, fontWeight: 800 }}>notifications</div>
                <div className="tnum" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{totalUnread} unread</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={markAll} className="btn btn-glass lower" style={{ padding: "7px 12px", fontSize: 11 }}>
                  <Icon name="check" size={12} stroke={2.4} /> mark all read
                </button>
                <button onClick={() => setOpen(false)} aria-label="close" className="theme-toggle" style={{ background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {groups.map((g) => (
                <div key={g.group}>
                  <div className="lower" style={{ padding: "12px 18px 6px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                    {g.group}
                  </div>
                  {g.items.map((it) => (
                    <Link
                      key={it.id}
                      href={channelHref(it.handle)}
                      onClick={() => setOpen(false)}
                      style={{
                        width: "100%",
                        padding: "12px 18px",
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        textDecoration: "none",
                        background: it.unread ? "linear-gradient(90deg, rgba(139,92,246,0.06), transparent)" : "transparent",
                      }}
                    >
                      <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${it.creator.brand}, ${it.creator.brand2})`, flex: "0 0 auto" }}>
                        <Avatar creator={it.creator} size={36} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: it.unread ? 700 : 500, color: "var(--ink-1)" }}>{it.text}</div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{it.handle} · {it.time}</div>
                      </div>
                      {it.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--brand-gradient)", flex: "0 0 7px" }} />}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between" }}>
              <Link href="/settings" onClick={() => setOpen(false)} className="lower" style={{ fontSize: 12, color: "var(--ink-3)", textDecoration: "underline" }}>
                notification settings
              </Link>
              <Link href="/notifications" onClick={() => setOpen(false)} className="lower" style={{ fontSize: 12, color: "var(--ink-3)", textDecoration: "underline" }}>
                see all
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
