// Watch page — /watch/:slug. ISR (revalidate 60).
// Presentation rebuilt to match prototype/v4/live.jsx (ambient-glow player, title, creator
// row with subscribe/tip/share/save, description box, chapters). Data wiring (VideoPlayer,
// videoProvider.getPlayback, JsonLd, generateMetadata, SupportBar) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVideoBySlug } from "@/lib/queries/public";
import { buildMetadata, clampDescription, ogImage } from "@/lib/seo/meta";
import { videoObject, breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SupportBar } from "@/components/SupportBar";
import { Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { video as videoProvider } from "@/lib/integrations";
import { formatCast } from "@/lib/cast";

export const revalidate = 60;

type Props = { params: { slug: string } };

function hhmmss(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
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

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 96px" }}>
      <JsonLd data={jsonLd} />

      {/* PLAYER with ambient glow */}
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
        <div style={{ position: "relative", zIndex: 1, borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 80px -32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)" }}>
          {playback ? (
            <VideoPlayer hlsUrl={playback.hlsUrl} poster={playback.poster} live={false} />
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
      <h1 style={{ margin: "28px 0 0", fontSize: 22, fontWeight: 600, lineHeight: 1.3, color: "var(--ink-1)", letterSpacing: "-0.01em" }}>{video.title}</h1>

      {/* CREATOR + ACTIONS ROW */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
        <Link href={`/c/${creator.handle}`} style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}>
          <Avatar creator={creator} size={40} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-1)" }}>{creator.name}</div>
            <div className="tnum lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
              {creator.handle} · {formatCast(video.views)} views
            </div>
          </div>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Pillbtn icon="share" label="share" />
          <Pillbtn icon="bookmark" label="save" />
        </div>
      </div>

      {/* SUPPORT */}
      <div style={{ marginTop: 20 }}>
        <SupportBar channelId={video.channel.id} tiers={[]} compact />
      </div>

      {/* DESCRIPTION */}
      {video.description && (
        <div style={{ marginTop: 20, background: "var(--surface-2)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>{video.description}</p>
        </div>
      )}

      {/* CHAPTERS */}
      {video.chapters.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 className="lower" style={{ fontSize: 18, marginBottom: 12 }}>chapters</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
            {video.chapters.map((ch) => (
              <li key={ch.atSec}>
                <a href={`#t=${ch.atSec}`} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "6px 0", color: "var(--ink-2)", textDecoration: "none" }}>
                  <span className="tnum" style={{ color: "var(--ink-3)", minWidth: 56 }}>{hhmmss(ch.atSec)}</span>
                  <span>{ch.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function Pillbtn({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      className="lower"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        height: 36,
        borderRadius: 999,
        background: "var(--surface-2)",
        color: "var(--ink-1)",
        fontWeight: 500,
        fontSize: 14,
      }}
    >
      <Icon name={icon} size={15} stroke={2.2} /> {label}
    </span>
  );
}
