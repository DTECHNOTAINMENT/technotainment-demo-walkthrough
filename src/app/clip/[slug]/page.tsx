// Clip page — /clip/:slug. ISR (revalidate 60). High social-share value (docs/ROUTES.md).
// schema.org: VideoObject (kind "clip") + BreadcrumbList. Server-rendered.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClipBySlug } from "@/lib/queries/public";
import { buildMetadata, clampDescription, ogImage } from "@/lib/seo/meta";
import { videoObject, breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoPlayer } from "@/components/VideoPlayer";
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

  // Gating UI is Phase 2; locked clips still get full SEO/JSON-LD above.
  const playback = locked ? null : await videoProvider.getPlayback(clip.id);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 96px" }}>
      <JsonLd data={jsonLd} />

      {playback ? (
        <VideoPlayer hlsUrl={playback.hlsUrl} poster={playback.poster} live={false} />
      ) : (
        <div
          style={{
            position: "relative",
            aspectRatio: "16 / 9",
            borderRadius: 14,
            overflow: "hidden",
            backgroundImage: `url(${clip.thumbUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
            }}
          >
            <div className="lower" style={{ fontWeight: 800 }}>
              {clip.visibility === "ppv" ? "pay-per-view" : "members only"}
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 24, letterSpacing: "-0.02em", margin: "20px 0 8px" }}>{clip.title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink-3)", fontSize: 14 }}>
        <Link href={`/c/${creator.handle}`} style={{ fontWeight: 700, color: "var(--ink-1)" }}>
          {creator.name}
        </Link>
        <span className="lower">{creator.handle}</span>
        <span>·</span>
        <span className="tnum lower">{formatCast(clip.views)} views</span>
      </div>

      {clip.description && (
        <p style={{ color: "var(--ink-2)", maxWidth: 640, marginTop: 16, whiteSpace: "pre-wrap" }}>{clip.description}</p>
      )}
    </main>
  );
}
