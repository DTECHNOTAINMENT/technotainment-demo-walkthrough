// Clip page — /clip/:slug. ISR (revalidate 60). High social-share value (docs/ROUTES.md).
// Presentation matches the watch page (the 2-column youtube-style layout from
// prototype/v4/live.jsx) in its clip variant: VOD, no live chat, up-next sourced from recent
// videos. Data wiring (VideoPlayer, getPlayback, JsonLd, generateMetadata, getClipBySlug) intact.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClipBySlug, getChannelByHandle, listLiveStreams, listRecentVideos } from "@/lib/queries/public";
import { buildMetadata, clampDescription, ogImage } from "@/lib/seo/meta";
import { videoObject, breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoPlayer } from "@/components/VideoPlayer";
import { formatNum } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
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
  const clip = await getClipBySlug(params.slug);
  if (!clip) {
    return buildMetadata({ title: "clip not found", description: "", path: `/clip/${params.slug}`, noindex: true });
  }
  const creator = clip.channel.creator;
  return buildMetadata({
    title: clip.title,
    description: clampDescription(clip.metaDescription || clip.description),
    path: `/clip/${params.slug}`,
    type: "video.other",
    image: ogImage({ title: clip.title, subtitle: creator.name, kind: "clip" }),
  });
}

export default async function ClipPage({ params }: Props) {
  const clip = await getClipBySlug(params.slug);
  if (!clip) notFound();

  const creator = clip.channel.creator;
  const locked = clip.visibility === "members" || clip.visibility === "ppv";

  const [channel, liveStreams, recent] = await Promise.all([
    getChannelByHandle(creator.handle).catch(() => null),
    listLiveStreams().catch(() => []),
    listRecentVideos(18).catch(() => []),
  ]);

  const jsonLd = [
    videoObject({
      title: clip.title,
      description: clip.description,
      slug: clip.slug,
      thumbUrl: clip.thumbUrl,
      durationSec: clip.durationSec,
      publishedAt: clip.publishedAt,
      kind: "clip",
      channel: { creator: { name: creator.name, handle: creator.handle } },
    }),
    breadcrumb([
      { name: "home", path: "/" },
      { name: creator.name, path: `/c/${creator.handle}` },
      { name: clip.title, path: `/clip/${clip.slug}` },
    ]),
  ];

  const playback = locked ? null : await videoProvider.getPlayback(clip.id);

  const products = channel?.products ?? [];
  const tiers = channel?.tiers ?? [];
  const drop = buildDropCard(products, clip.thumbUrl);
  const upNext = buildUpNext(liveStreams, recent, clip.slug, ago);

  const followers = creator.followers ?? 0;
  const metaLine = `${formatNum(clip.views)} views · ${ago(clip.publishedAt)}`;
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
            {/* ambient glow behind player (pink for clips) */}
            <div style={{ position: "relative" }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-60px -60px -90px -60px",
                  background: "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.10), transparent 70%)",
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
                  <VideoPlayer hlsUrl={playback.hlsUrl} poster={clip.thumbUrl} live={false} />
                ) : (
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 9",
                      backgroundImage: `url(${clip.thumbUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                      <div className="lower" style={{ fontWeight: 800 }}>
                        {clip.visibility === "ppv" ? "pay-per-view" : "members only"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CLIP eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
              <span
                className="lower"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                <Icon name="film" size={13} stroke={2.2} /> clip
              </span>
            </div>

            {/* TITLE */}
            <h1 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>
              {clip.title}
            </h1>

            {/* CREATOR + ACTIONS */}
            <WatchActions creator={creator} channelId={clip.channel.id} subsLine={subsLine} />

            {/* DESCRIPTION */}
            {clip.description && <WatchDescription metaLine={metaLine} description={clip.description} />}

            {/* TABS (no live chat for clips) */}
            <WatchTabs
              live={false}
              about={{
                category: creator.category || "—",
                tags: creator.bio ? creator.bio.split(/[.,]/)[0].trim() : "—",
                schedule: "new clips weekly",
                language: "english",
              }}
              drops={buildDrops(products, clip.thumbUrl)}
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
