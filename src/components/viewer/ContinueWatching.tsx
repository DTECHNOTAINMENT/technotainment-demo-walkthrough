// Library "continue watching" rail — ported from prototype/v4/extras.jsx LibraryScreen
// (CONTINUE grid). There's no watch-progress model yet, so progress is simulated from recent
// videos: a deterministic percent + time-left badge over the thumb, with a play overlay.
// Server component (no client hooks) — links straight to the watch page.
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Avatar, picThumb, type CreatorLike } from "@/components/ui/primitives";

export interface ContinueItem {
  id: string;
  slug: string;
  title: string;
  thumb: string;
  creator: CreatorLike;
  pct: number; // 0..100 simulated progress
  left: string; // time-left badge, e.g. "12 min left"
}

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  thumbUrl: string | null;
  durationSec: number;
  channel: { creator: { name: string; handle: string; brand: string; brand2: string } };
};

// Deterministic pseudo-progress so the demo is stable across renders (no DB watch state).
const PCTS = [68, 34, 82, 12, 55, 91];

function leftLabel(durationSec: number, pct: number): string {
  const remain = Math.max(1, Math.round((durationSec * (100 - pct)) / 100));
  const m = Math.round(remain / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m left`;
  return `${Math.max(1, m)} min left`;
}

export function toContinueItems(videos: VideoRow[], limit = 4): ContinueItem[] {
  return videos.slice(0, limit).map((v, i) => {
    const c = v.channel.creator;
    const pct = PCTS[i % PCTS.length];
    return {
      id: v.id,
      slug: v.slug,
      title: v.title,
      thumb: v.thumbUrl || picThumb(v.id),
      creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
      pct,
      left: leftLabel(v.durationSec || 600, pct),
    };
  });
}

export function ContinueWatching({ items }: { items: ContinueItem[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="lower" style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
        continue watching
      </div>
      <div className="grid-tiles">
        {items.map((c) => (
          <Link key={c.id} href={`/watch/${c.slug}`} className="gtile tile" style={{ display: "block" }}>
            <div className="thumb" style={{ backgroundImage: `url(${c.thumb})` }}>
              <div className="thumb-overlay" />
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <span
                  className="tnum"
                  style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}
                >
                  {c.left}
                </span>
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span
                  style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", backdropFilter: "blur(6px)" }}
                >
                  <Icon name="play" size={18} fill="currentColor" />
                </span>
              </div>
              <div className="pct" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.18)" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: "var(--brand-gradient)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
              <Avatar creator={c.creator} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-1)" }}>{c.title}</div>
                <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                  {c.creator.handle}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
