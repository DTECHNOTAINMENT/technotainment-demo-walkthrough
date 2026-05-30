// Live now index — /live. SSR (docs/ROUTES.md: live-now index is per-request).
// schema.org: BroadcastEvent list. Presentation rebuilt to match the live grid in
// prototype/v4/live.jsx (PageHeader + grid of live tiles). Data wiring (listLiveStreams,
// broadcastEvent JsonLd) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { listLiveStreams } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/meta";
import { broadcastEvent } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/viewer/shared";
import { Avatar, formatNum } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "live now",
  description: "watch what's streaming live right now across the platform.",
  path: "/live",
});

export default async function LivePage() {
  const streams = await listLiveStreams();

  const jsonLd = streams.map((s) =>
    broadcastEvent({
      title: s.title,
      category: s.category,
      startedAt: s.startedAt,
      channel: { creator: { name: s.channel.creator.name, handle: s.channel.creator.handle } },
      channelHandle: s.channel.handle,
    })
  );

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 96px" }}>
      {jsonLd.length > 0 && <JsonLd data={jsonLd} />}
      <PageHeader eyebrow="streaming right now" title="live now" sub={`${streams.length} ${streams.length === 1 ? "creator" : "creators"} live across the platform.`} />

      {streams.length ? (
        <div className="grid-tiles">
          {streams.map((s) => {
            const creator = s.channel.creator;
            return (
              <Link key={s.id} href={`/c/${s.channel.handle}`} className="gtile tile" style={{ display: "block", textDecoration: "none" }}>
                <div
                  className="thumb"
                  style={{
                    position: "relative",
                    background: `linear-gradient(120deg, ${creator.brand}, ${creator.brand2})`,
                  }}
                >
                  <div className="thumb-overlay" />
                  <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, alignItems: "center" }}>
                    <span className="live-pill">live</span>
                    <span
                      className="tnum"
                      style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, backdropFilter: "blur(6px)" }}
                    >
                      {formatNum(s.viewers)} watching
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, padding: "10px 2px", alignItems: "flex-start" }}>
                  <Avatar creator={creator} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{s.title}</div>
                    <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                      {creator.handle} · {s.category}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="lower" style={{ color: "var(--ink-3)" }}>nobody&apos;s live right now — check back soon.</p>
      )}
    </main>
  );
}
