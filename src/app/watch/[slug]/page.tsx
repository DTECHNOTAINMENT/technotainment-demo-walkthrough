// Watch page — /watch/:slug. ISR (revalidate 60).
// NOTE: Phase 3 turns live watch pages SSR (docs/ROUTES.md "ISR + SSR for live");
// for now everything is ISR. schema.org: VideoObject (+ hasPart chapters) + BreadcrumbList.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVideoBySlug } from "@/lib/queries/public";
import { buildMetadata, clampDescription, ogImage } from "@/lib/seo/meta";
import { videoObject, breadcrumb } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SupportBar } from "@/components/SupportBar";
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

  // Gating UI is Phase 2; locked content still gets full SEO/JSON-LD above.
  const playback = locked ? null : await videoProvider.getPlayback(video.id);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 96px" }}>
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
            backgroundImage: `url(${video.thumbUrl})`,
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
              textAlign: "center",
              padding: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }} className="lower">
                {video.visibility === "ppv" ? "pay-per-view" : "members only"}
              </div>
              <p className="lower" style={{ color: "rgba(255,255,255,0.8)", marginTop: 8, maxWidth: 360 }}>
                {video.visibility === "ppv"
                  ? "unlock this video with CAST to watch."
                  : "join the membership to watch this video."}
              </p>
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "24px 0 8px" }}>{video.title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink-3)", fontSize: 14 }}>
        <Link href={`/c/${creator.handle}`} style={{ fontWeight: 700, color: "var(--ink-1)" }}>
          {creator.name}
        </Link>
        <span className="lower">{creator.handle}</span>
        <span>·</span>
        <span className="tnum lower">{formatCast(video.views)} views</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <SupportBar channelId={video.channel.id} tiers={[]} compact />
      </div>

      {video.description && (
        <p style={{ color: "var(--ink-2)", maxWidth: 720, marginTop: 20, whiteSpace: "pre-wrap" }}>{video.description}</p>
      )}

      {video.chapters.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2 className="lower" style={{ fontSize: 18, marginBottom: 12 }}>chapters</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
            {video.chapters.map((c) => (
              <li key={c.atSec}>
                <a
                  href={`#t=${c.atSec}`}
                  style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "6px 0", color: "var(--ink-2)" }}
                >
                  <span className="tnum" style={{ color: "var(--ink-3)", minWidth: 56 }}>{hhmmss(c.atSec)}</span>
                  <span>{c.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
