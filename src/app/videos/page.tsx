// Videos (VOD) browse — /videos. The on-demand catalogue (not live). Public/ISR, crawlable.
// Complements /live: the platform is live + on-demand, so this is the "just videos" destination.
import type { Metadata } from "next";
import { listRecentVideos } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/meta";
import { VideoCard } from "@/components/public/cards";
import { PageHeader } from "@/components/viewer/shared";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: "videos",
  description: "browse on-demand videos from creators across the platform — replays, uploads and clips.",
  path: "/videos",
});

export default async function VideosPage() {
  const videos = await listRecentVideos(48).catch(() => []);

  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 96px" }}>
      <PageHeader
        eyebrow="on demand"
        title="videos"
        sub={`${videos.length} ${videos.length === 1 ? "video" : "videos"} to watch anytime — replays, uploads and more.`}
      />

      {videos.length ? (
        <div className="grid-tiles">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={{
                slug: v.slug,
                title: v.title,
                thumbUrl: v.thumbUrl,
                durationSec: v.durationSec,
                views: v.views,
                kind: v.kind as "vod" | "clip",
                channel: { creator: { name: v.channel.creator.name, handle: v.channel.creator.handle } },
              }}
            />
          ))}
        </div>
      ) : (
        <p className="lower" style={{ color: "var(--ink-3)" }}>
          no videos yet — check back soon.
        </p>
      )}
    </main>
  );
}
