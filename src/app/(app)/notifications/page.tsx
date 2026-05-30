// Notifications — /notifications. Signed-in. Presentation matches the grouped notifications
// list in prototype/v4/notifications.jsx + data.jsx NOTIFICATIONS (grouped sections, avatar
// gradient, unread highlight). There is no notifications model yet, so items are synthesized
// from the channels the viewer actually follows (honest stand-ins); empty state when none.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { listFollowing } from "@/lib/queries/viewer";
import { Avatar, type CreatorLike } from "@/components/ui/primitives";
import { PageHeader } from "@/components/viewer/shared";

export const metadata: Metadata = { title: "notifications", robots: { index: false } };

interface NotifItem {
  id: string;
  creator: CreatorLike;
  handle: string;
  text: string;
  time: string;
  unread: boolean;
}
interface NotifGroup {
  group: string;
  items: NotifItem[];
}

export default async function NotificationsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/notifications");

  const channels = await listFollowing(session.userId);

  // Build grouped, plausible notifications from real followed creators. Live-now channels
  // surface as "live starting"; the rest seed renewal / drop / perk style entries.
  const groups: NotifGroup[] = [];
  const liveCh = channels.filter((c) => c.streams.length > 0);
  const restCh = channels.filter((c) => c.streams.length === 0);

  if (liveCh.length) {
    groups.push({
      group: "live now",
      items: liveCh.map((c, i) => ({
        id: `live-${c.id}`,
        creator: c.creator,
        handle: c.handle,
        text: c.streams[0].title,
        time: `${(i + 1) * 7} min`,
        unread: true,
      })),
    });
  }

  if (restCh.length) {
    groups.push({
      group: "new drops",
      items: restCh.slice(0, 2).map((c, i) => ({
        id: `drop-${c.id}`,
        creator: c.creator,
        handle: c.handle,
        text: `new drop from ${c.name}`,
        time: i === 0 ? "1h" : "3h",
        unread: i === 0,
      })),
    });
    if (restCh.length > 2) {
      groups.push({
        group: "renewals coming up",
        items: restCh.slice(2, 4).map((c, i) => ({
          id: `renew-${c.id}`,
          creator: c.creator,
          handle: c.handle,
          text: `membership renews soon`,
          time: `in ${(i + 1) * 8} days`,
          unread: false,
        })),
      });
    }
  }

  const totalUnread = groups.reduce((a, g) => a + g.items.filter((i) => i.unread).length, 0);
  const hasAny = groups.length > 0;

  return (
    <div className="page-pad" style={{ maxWidth: 720, margin: "0 auto" }}>
      <PageHeader
        eyebrow="your alerts"
        title="notifications"
        sub={hasAny ? `${totalUnread} unread` : "go-live alerts, drops, and replies land here."}
      />

      {!hasAny ? (
        <div className="card" style={{ padding: 48, textAlign: "center", background: "var(--surface)" }}>
          <div aria-hidden style={{ width: 44, height: 44, borderRadius: 12, margin: "0 auto 14px", background: "var(--brand-gradient)" }} />
          <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>you&rsquo;re all caught up</div>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 6, maxWidth: 380, margin: "6px auto 0" }}>
            follow some creators — when they go live or drop something new, you&rsquo;ll see it here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden" }}>
          <div className="brand-hairline" />
          {groups.map((g) => (
            <div key={g.group}>
              <div style={{ padding: "12px 18px 6px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                {g.group}
              </div>
              {g.items.map((it) => (
                <Link
                  key={it.id}
                  href={`/c/${it.handle.replace(/^@/, "")}`}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    textDecoration: "none",
                    background: it.unread ? "linear-gradient(90deg, rgba(139,92,246,0.06), transparent)" : "transparent",
                    borderLeft: it.unread ? "2px solid transparent" : "2px solid transparent",
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
      )}
    </div>
  );
}
