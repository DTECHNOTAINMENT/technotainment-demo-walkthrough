// Watch page — /watch/:slug. ISR (revalidate 60).
// Presentation rebuilt to match prototype/v4/live.jsx (LiveWatchScreen non-fullscreen layout):
// a 2-column youtube-style watch view — ambient-glow player + title + creator/actions row +
// expandable description + tabs (chat/about/drops/competition/members) on the left, and a
// live-drop card + filter chips + vertical up-next list on the right. Data wiring (VideoPlayer,
// videoProvider.getPlayback, JsonLd, generateMetadata, getVideoBySlug) is unchanged; the
// heavy interactive parts are "use client" components under src/components/watch.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVideoBySlug, getChannelByHandle, listLiveStreams, listRecentVideos } from "@/lib/queries/public";
import { buildMetadata, clampDescription, ogImage } from "@/lib/seo/meta";
import { videoObject, breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoPlayer } from "@/components/VideoPlayer";
import { formatNum } from "@/components/ui/primitives";
import { video as videoProvider } from "@/lib/integrations";
import { PublicShell } from "@/components/app/PublicShell";
import { WatchActions } from "@/components/watch/WatchActions";
import { WatchDescription } from "@/components/watch/WatchDescription";
import { WatchTabs } from "@/components/watch/WatchTabs";
import { WatchUpNext } from "@/components/watch/WatchUpNext";
import { buildUpNext, buildDrops, buildCompetitions, buildTiers, buildDropCard } from "@/components/watch/data";

export const revalidate = 60;

type Props = { params: { slug: string } };

function ago(date: Date | null): string {
  if (!date) return "recently";
  const days = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 86_400_000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return weeks <= 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const video = await getVideoBySlug(params.slug);
  if (!video || video.kind === "clip") {
    return buildMetadata({ title: "video not found", description: "", path: `/watch/${params.slug}`, noindex: true });
  }
  const creator = video.channel.creator;
  return buildMetadata({
    title: video.title,
    description: clampDescription(video.metaDescription || video.description),
    path: `/watch/${params.slug}`,
    type: "video.other",
    image: ogImage({ title: video.title, subtitle: creator.name, kind: "watch" }),
  });
}

export default async function WatchPage({ params }: Props) {
  const video = await getVideoBySlug(params.slug);
  if (!video || video.kind === "clip") notFound();

  const creator = video.channel.creator;
  const locked = video.visibility === "members" || video.visibility === "ppv";

  const [channel, liveStreams, recent] = await Promise.all([
    getChannelByHandle(creator.handle).catch(() => null),
    listLiveStreams().catch(() => []),
    listRecentVideos(18).catch(() => []),
  ]);

  const jsonLd = [
    videoObject({
      title: video.title,
      description: video.description,
      slug: video.slug,
      thumbUrl: video.thumbUrl,
      durationSec: video.durationSec,
      publishedAt: video.publishedAt,
      kind: "vod",
      channel: { creator: { name: creator.name, handle: creator.handle } },
      chapters: video.chapters,
    }),
    breadcrumb([
      { name: "home", path: "/" },
      { name: creator.name, path: `/c/${creator.handle}` },
      { name: video.title, path: `/watch/${video.slug}` },
    ]),
  ];

  const playback = locked ? null : await videoProvider.getPlayback(video.id);

  const products = channel?.products ?? [];
  const tiers = channel?.tiers ?? [];
  const drop = buildDropCard(products, video.thumbUrl);
  const upNext = buildUpNext(liveStreams, recent, video.slug, ago);

  const followers = creator.followers ?? 0;
  const metaLine = `${formatNum(video.views)} views · ${ago(video.publishedAt)}`;
  const subsLine = `${formatNum(followers)} subscribers · ${formatNum(Math.max(1, Math.round(followers * 0.0012)))} joined this week`;

  return (
    <PublicShell>
      <div style={{ background: "var(--bg)", color: "var(--ink-1)", minHeight: "100vh", paddingBottom: 96 }}>
        <div
          className="yt-layout"
          style={{ maxWidth: 1700, margin: "0 auto", padding: "28px 32px 0", display: "grid", gap: 40, gridTemplateColumns: "1fr" }}
        >
          <style>{`
            @media (min-width: 1024px) { .yt-layout { grid-template-columns: minmax(0, 1fr) 380px !important; gap: 48px !important; } }
            @media (min-width: 1280px) { .yt-layout { grid-template-columns: minmax(0, 1.95fr) 400px !important; padding-right: 6%; } }
            @media (min-width: 1600px) { .yt-layout { padding-right: 9%; } }
          `}</style>

          <JsonLd data={jsonLd} />

          {/* LEFT COLUMN */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>
            {/* ambient glow behind player */}
            <div style={{ position: "relative" }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-60px -60px -90px -60px",
                  background: "radial-gradient(60% 60% at 50% 50%, rgba(139,92,246,0.10), transparent 70%)",
                  filter: "blur(90px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 40px 80px -32px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)",
                }}
              >
                {playback ? (
                  <VideoPlayer hlsUrl={playback.hlsUrl} poster={video.thumbUrl} live={false} />
                ) : (
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 9",
                      backgroundImage: `url(${video.thumbUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.6)", color: "#fff", textAlign: "center", padding: 24 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }} className="lower">
                          {video.visibility === "ppv" ? "pay-per-view" : "members only"}
                        </div>
                        <p className="lower" style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, maxWidth: 360 }}>
                          {video.visibility === "ppv" ? "unlock this video with CAST to watch." : "join the membership to watch this video."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TITLE */}
            <h1 style={{ margin: "28px 0 0", fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
              {video.title}
            </h1>

            {/* CREATOR + ACTIONS */}
            <WatchActions creator={creator} channelId={video.channel.id} subsLine={subsLine} />

            {/* DESCRIPTION */}
            {video.description && (
              <WatchDescription metaLine={metaLine} description={video.description} />
            )}

            {/* TABS */}
            <WatchTabs
              live={false}
              about={{
                category: creator.category || "—",
                tags: creator.bio ? creator.bio.split(/[.,]/)[0].trim() : "—",
                schedule: "new uploads weekly",
                language: "english",
              }}
              drops={buildDrops(products, video.thumbUrl)}
              competitions={buildCompetitions()}
              tiers={buildTiers(tiers)}
              giftedSubs={142}
            />
          </div>

          {/* RIGHT COLUMN */}
          <WatchUpNext
            drop={drop}
            chips={["all", `from ${creator.handle.replace(/^@/, "")}`, creator.category || "more", "live now"]}
            items={upNext}
          />
        </div>
      </div>
    </PublicShell>
  );
}
