// Public discovery UI primitives — server components, design tokens only.
import Link from "next/link";
import { formatCast } from "@/lib/cast";

function duration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const h = Math.floor(m / 60);
  if (h) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoCard({
  video,
}: {
  video: {
    slug: string;
    title: string;
    thumbUrl: string;
    durationSec: number;
    views: number;
    kind: "vod" | "clip";
    channel: { creator: { name: string; handle: string } };
  };
}) {
  const href = video.kind === "clip" ? `/clip/${video.slug}` : `/watch/${video.slug}`;
  return (
    <Link href={href} className="tile gtile" style={{ display: "block" }}>
      <div
        className="thumb"
        style={{ backgroundImage: `url(${video.thumbUrl})`, position: "relative" }}
      >
        <span
          className="tnum"
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 6,
          }}
        >
          {duration(video.durationSec)}
        </span>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{video.title}</div>
        <div style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 2 }}>
          {video.channel.creator.name} · <span className="tnum">{formatCast(video.views)}</span> views
        </div>
      </div>
    </Link>
  );
}

export function ChannelHeader({
  channel,
}: {
  channel: {
    name: string;
    handle: string;
    bio?: string | null;
    creator: { brand: string; brand2: string; category: string; followers: number };
  };
}) {
  const { creator } = channel;
  return (
    <header style={{ position: "relative", marginBottom: 28 }}>
      <div
        style={{
          height: 160,
          borderRadius: 18,
          background: `linear-gradient(120deg, ${creator.brand}, ${creator.brand2})`,
        }}
      />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -36, padding: "0 12px" }}>
        <div
          className="av-ring"
          style={{ width: 84, height: 84, borderRadius: "50%", background: `linear-gradient(120deg, ${creator.brand}, ${creator.brand2})`, padding: 3 }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--surface-2)" }} />
        </div>
        <div style={{ paddingBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>{channel.name}</h1>
          <div style={{ color: "var(--ink-3)", fontSize: 14 }}>
            {channel.handle} · {creator.category} · <span className="tnum">{formatCast(creator.followers)}</span> followers
          </div>
        </div>
      </div>
      {channel.bio && <p style={{ color: "var(--ink-2)", maxWidth: 680, marginTop: 16 }}>{channel.bio}</p>}
    </header>
  );
}

export function TierCard({ tier }: { tier: { name: string; priceCast: number; perks: string[]; popular: boolean } }) {
  return (
    <div className={`tier${tier.popular ? " popular" : ""}`} style={{ borderRadius: 16, padding: 22, background: "var(--surface)", border: "1px solid var(--hairline)" }}>
      <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">{tier.name}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span className="cast-glyph" style={{ width: 22, height: 22 }}>C</span>
        <span className="stat-num tnum" style={{ fontSize: 26 }}>{formatCast(tier.priceCast)}</span>
        <span style={{ color: "var(--ink-3)", fontSize: 13 }}>/ month</span>
      </div>
      <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: "var(--ink-2)", fontSize: 13, lineHeight: 1.7 }}>
        {tier.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
