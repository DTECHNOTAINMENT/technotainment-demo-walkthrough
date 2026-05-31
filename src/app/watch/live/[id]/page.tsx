// Live watch — /watch/live/:id. The full live-watch experience (prototype/v4/live.jsx): same
// rich 2-column layout as /watch but for a LIVE stream — ambient-glow live player, creator +
// actions row, description, tabs (chat live!/about/drops/competition/members), and the right-rail
// live-drop card + chips + up-next list. Live streams link here (not the channel page).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStreamById, getChannelByHandle, listLiveStreams, listRecentVideos } from "@/lib/queries/public";
import { buildMetadata, ogImage } from "@/lib/seo/meta";
import { broadcastEvent, breadcrumb } from "@/lib/seo/jsonld";
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

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const stream = await getStreamById(params.id);
  if (!stream) return buildMetadata({ title: "stream not found", description: "", path: `/watch/live/${params.id}`, noindex: true });
  const creator = stream.channel.creator;
  return buildMetadata({
    title: `${stream.title} — live`,
    description: `${creator.name} is live now. ${stream.category}.`,
    path: `/watch/live/${params.id}`,
    type: "video.other",
    image: ogImage({ title: stream.title, subtitle: creator.name, kind: "live" }),
  });
}

export default async function LiveWatchPage({ params }: Props) {
  const stream = await getStreamById(params.id);
  if (!stream) notFound();

  const creator = stream.channel.creator;
  const poster = `https://picsum.photos/seed/${encodeURIComponent(`${stream.id}-live`)}/1280/720`;

  const [channel, liveStreams, recent, playback] = await Promise.all([
    getChannelByHandle(creator.handle).catch(() => null),
    listLiveStreams().catch(() => []),
    listRecentVideos(18).catch(() => []),
    videoProvider.getPlayback(stream.id),
  ]);

  const jsonLd = [
    broadcastEvent({
      title: stream.title,
      category: stream.category,
      startedAt: stream.startedAt ?? null,
      channel: { creator: { name: creator.name, handle: creator.handle } },
      channelHandle: stream.channel.handle,
    }),
    breadcrumb([
      { name: "home", path: "/" },
      { name: "live", path: "/live" },
      { name: stream.title, path: `/watch/live/${stream.id}` },
    ]),
  ];

  const products = channel?.products ?? [];
  const tiers = channel?.tiers ?? [];
  const drop = buildDropCard(products, poster);
  const upNext = buildUpNext(liveStreams, recent, "", () => "live now");

  const followers = creator.followers ?? 0;
  const metaLine = `${formatNum(stream.viewers)} watching · live now · #${stream.category.replace(/\s+/g, "")}`;
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
            <div style={{ position: "relative" }}>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: "-60px -60px -90px -60px",
                  background: "radial-gradient(60% 60% at 50% 50%, rgba(239,43,61,0.12), transparent 70%)",
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
                <VideoPlayer hlsUrl={playback.hlsUrl} poster={poster} live />
              </div>
            </div>

            {/* TITLE */}
            <h1 style={{ margin: "28px 0 0", fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: "var(--ink-1)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className="live-pill">live</span>
              {stream.title}
            </h1>

            {/* CREATOR + ACTIONS */}
            <WatchActions creator={creator} channelId={stream.channel.id} subsLine={subsLine} />

            {/* DESCRIPTION */}
            <WatchDescription metaLine={metaLine} description={`${creator.name} is live — ${stream.category}. tips become next week's stream fund. drop in and say hi.`} />

            {/* TABS — chat is live */}
            <WatchTabs
              live
              streamId={stream.id}
              about={{
                category: stream.category,
                tags: stream.category,
                schedule: "live now · regular streams",
                language: "english",
              }}
              drops={buildDrops(products, poster)}
              competitions={buildCompetitions()}
              tiers={buildTiers(tiers)}
              giftedSubs={142}
            />
          </div>

          {/* RIGHT COLUMN */}
          <WatchUpNext
            drop={drop}
            chips={["all", `from ${creator.handle.replace(/^@/, "")}`, stream.category || "more", "live now"]}
            items={upNext}
          />
        </div>
      </div>
    </PublicShell>
  );
}
