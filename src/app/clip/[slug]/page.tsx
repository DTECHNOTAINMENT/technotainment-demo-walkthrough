// Clip page — /clip/:slug. ISR (revalidate 60). High social-share value (docs/ROUTES.md).
// Presentation mirrors the watch page (ambient-glow player, title, creator row), narrower
// for the clip variant. Data wiring (VideoPlayer, getPlayback, JsonLd, generateMetadata) intact.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClipBySlug } from "@/lib/queries/public";
import { buildMetadata, clampDescription, ogImage } from "@/lib/seo/meta";
import { videoObject, breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Avatar } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/Icon";
import { video as videoProvider } from "@/lib/integrations";
import { formatCast } from "@/lib/cast";

export const revalidate = 60;

type Props = { params: { slug: string } };

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

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px 96px" }}>
      <JsonLd data={jsonLd} />

      <div style={{ position: "relative" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-50px -50px -70px -50px",
            background: "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.10), transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1, borderRadius: 16, overflow: "hidden", boxShadow: "0 36px 70px -30px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)" }}>
          {playback ? (
            <VideoPlayer hlsUrl={playback.hlsUrl} poster={playback.poster} live={false} />
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

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <span
          className="lower"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}
        >
          <Icon name="film" size={13} stroke={2.2} /> clip
        </span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", margin: "8px 0 12px", lineHeight: 1.3 }}>{clip.title}</h1>

      <Link href={`/c/${creator.handle}`} style={{ display: "flex", gap: 12, alignItems: "center", textDecoration: "none" }}>
        <Avatar creator={creator} size={40} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-1)" }}>{creator.name}</div>
          <div className="tnum lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
            {creator.handle} · {formatCast(clip.views)} views
          </div>
        </div>
      </Link>

      {clip.description && (
        <div style={{ marginTop: 16, background: "var(--surface-2)", borderRadius: 12, padding: "14px 16px" }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>{clip.description}</p>
        </div>
      )}
    </main>
  );
}
