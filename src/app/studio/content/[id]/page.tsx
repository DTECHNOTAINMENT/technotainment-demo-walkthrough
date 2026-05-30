/**
 * Creator Studio — per-video editor (/studio/content/:id). Server-loads the owned
 * video (getStudioVideo, 404 if not found / not owned) and hands it to the client
 * StVideoEditor, which owns the form + PATCH to /api/studio/videos/:id. The "search
 * & sharing" SEO fields and publish flow live in the editor. Mirrors studio-video.jsx.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { getStudioVideo } from "@/lib/queries/studio";
import { appUrl } from "@/lib/seo/meta";
import { StVideoEditor } from "@/components/studio/StVideoEditor";

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  published: { bg: "rgba(16,185,129,0.12)", fg: "#10b981" },
  processing: { bg: "rgba(245,158,11,0.14)", fg: "#f59e0b" },
  draft: { bg: "var(--surface-2)", fg: "var(--ink-2)" },
};

export default async function StudioVideoEditorPage({ params }: { params: { id: string } }) {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const v = await getStudioVideo(params.id, channelId);
  if (!v) notFound();

  const tone = STATUS_TONE[v.status] ?? STATUS_TONE.draft;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <Link href="/studio/content" className="btn btn-glass lower" style={{ padding: "10px 14px", textDecoration: "none" }}>
          ‹ content
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>edit video</div>
          <div className="lower" style={{ fontSize: 19, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {v.title}
          </div>
        </div>
        <span
          className="lower"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 11px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            background: tone.bg,
            color: tone.fg,
            border: "1px solid var(--hairline)",
          }}
        >
          {v.status}
        </span>
      </div>

      <StVideoEditor
        id={v.id}
        origin={appUrl()}
        initial={{
          title: v.title,
          description: v.description,
          metaDescription: v.metaDescription ?? "",
          slug: v.slug,
          visibility: v.visibility,
          ppvPriceCast: v.ppvPriceCast ?? 0,
          captions: v.captions,
          status: v.status,
        }}
      />
    </div>
  );
}
