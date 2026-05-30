// Live now index — /live. SSR (docs/ROUTES.md: live-now index is per-request).
// schema.org: BroadcastEvent list. Server-rendered.
import Link from "next/link";
import type { Metadata } from "next";
import { listLiveStreams } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/meta";
import { broadcastEvent } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { formatCast } from "@/lib/cast";

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
      <h1 className="lower brand-grad-text" style={{ fontSize: 34, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
        live now
      </h1>

      {streams.length ? (
        <div className="grid-tiles">
          {streams.map((s) => {
            const creator = s.channel.creator;
            return (
              <Link
                key={s.id}
                href={`/c/${s.channel.handle}`}
                className="tile"
                style={{ display: "block", textDecoration: "none" }}
              >
                <div
                  className="thumb"
                  style={{
                    position: "relative",
                    aspectRatio: "16 / 9",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: `linear-gradient(120deg, ${creator.brand}, ${creator.brand2})`,
                  }}
                >
                  <span className="live-pill" style={{ position: "absolute", top: 8, left: 8 }}>live</span>
                  <span
                    className="tnum lower"
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
                    {formatCast(s.viewers)} watching
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.25 }}>{s.title}</div>
                  <div className="lower" style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 2 }}>
                    {creator.name} · {s.category}
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
