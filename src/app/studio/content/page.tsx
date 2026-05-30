/**
 * Creator Studio — content library (/studio/content). Server-rendered list of every
 * video in the channel ported to match prototype/v4/studio-content.jsx: a thumbnailed
 * `.st-row` table with a processing overlay, visibility + status pills, views and CAST
 * columns, each row linking to its editor. Upload is a client button (StUploadButton)
 * that POSTs /api/studio/videos and routes to the new editor.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listContent } from "@/lib/queries/studio";
import { formatCast } from "@/lib/cast";
import { StUploadButton } from "@/components/studio/StUploadButton";
import { StudioCard, StudioPageHead, Pill, type PillTone } from "@/components/studio-ui";

const STATUS_TONE: Record<string, PillTone> = {
  published: "ok",
  processing: "warn",
  draft: "neutral",
};
const VIS_TONE: Record<string, PillTone> = {
  public: "neutral",
  members: "info",
  ppv: "warn",
};

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function fmtDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function StudioContentPage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const videos = await listContent(channelId);
  const ROW = "104px 1fr 110px 90px 110px";

  return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="content"
        sub="every upload, recording and scheduled stream in one place."
        actions={<StUploadButton />}
      />

      <StudioCard pad={false}>
        <div className="st-row head" style={{ gridTemplateColumns: ROW }}>
          <span>video</span>
          <span>title</span>
          <span>status</span>
          <span style={{ textAlign: "right" }}>views</span>
          <span style={{ textAlign: "right" }}>CAST</span>
        </div>

        {videos.length ? (
          videos.map((v) => (
            <Link
              key={v.id}
              href={`/studio/content/${v.id}`}
              className="st-row"
              style={{ gridTemplateColumns: ROW, cursor: "pointer", textDecoration: "none", color: "var(--ink-1)" }}
            >
              <div
                className="thumb"
                style={{
                  backgroundImage: v.thumbUrl ? `url(${v.thumbUrl})` : undefined,
                  aspectRatio: "16/9",
                  borderRadius: 8,
                  position: "relative",
                }}
              >
                {v.status === "processing" && (
                  <div
                    className="lower"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.55)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    processing
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {v.title}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}
                >
                  <Pill tone={VIS_TONE[v.visibility] ?? "neutral"}>{v.visibility}</Pill>
                  {fmtDuration(v.durationSec)} · {fmtDate(v.createdAt)}
                </div>
              </div>
              <div>
                <Pill tone={STATUS_TONE[v.status] ?? "neutral"}>{v.status}</Pill>
              </div>
              <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                {v.views ? formatCast(v.views) : "—"}
              </div>
              <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                {v.castEarned ? formatCast(v.castEarned) : "—"}
              </div>
            </Link>
          ))
        ) : (
          <div style={{ padding: "44px 18px", textAlign: "center" }}>
            <p className="lower" style={{ fontSize: 14, color: "var(--ink-3)", margin: "0 0 6px" }}>
              no videos yet.
            </p>
            <p className="lower" style={{ fontSize: 12.5, color: "var(--ink-4)", margin: 0 }}>
              hit upload to add your first one — recordings of your streams land here too.
            </p>
          </div>
        )}
      </StudioCard>

      <div className="st-hint" style={{ marginTop: 16 }}>
        recordings of every stream land in <strong>content</strong> automatically once you end the broadcast — trim,
        retitle and publish them in the editor.
      </div>
    </div>
  );
}
