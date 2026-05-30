/**
 * Creator Studio — content library (/studio/content). Server-rendered list of every
 * video in the channel with status (draft / processing / published), visibility, and
 * views, each linking to its editor. Upload is a client button (StUploadButton) that
 * POSTs /api/studio/videos and routes to the new editor. Mirrors studio-content.jsx.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listContent } from "@/lib/queries/studio";
import { formatCast } from "@/lib/cast";
import { StUploadButton } from "@/components/studio/StUploadButton";

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  published: { bg: "rgba(16,185,129,0.12)", fg: "#10b981" },
  processing: { bg: "rgba(245,158,11,0.14)", fg: "#f59e0b" },
  draft: { bg: "var(--surface-2)", fg: "var(--ink-2)" },
};
const VIS_TONE: Record<string, { bg: string; fg: string }> = {
  public: { bg: "var(--surface-2)", fg: "var(--ink-2)" },
  members: { bg: "rgba(139,92,246,0.14)", fg: "#a78bfa" },
  ppv: { bg: "rgba(245,158,11,0.14)", fg: "#f59e0b" },
};

function Pill({ tone, children }: { tone: { bg: string; fg: string }; children: string }) {
  return (
    <span
      className="lower"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: tone.bg,
        color: tone.fg,
        border: "1px solid var(--hairline)",
      }}
    >
      {children}
    </span>
  );
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

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>
            creator studio
          </div>
          <h1 className="lower" style={{ margin: 0, fontSize: "clamp(26px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            content
          </h1>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>every upload and recording in one place.</div>
        </div>
        <StUploadButton />
      </div>

      <section className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
        {/* header row */}
        <div
          className="lower"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 110px 110px 90px 90px",
            gap: 12,
            padding: "12px 18px",
            borderBottom: "1px solid var(--hairline)",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
          }}
        >
          <span>title</span>
          <span>status</span>
          <span>visibility</span>
          <span style={{ textAlign: "right" }}>views</span>
          <span style={{ textAlign: "right" }}>CAST</span>
        </div>

        {videos.length ? (
          videos.map((v) => (
            <Link
              key={v.id}
              href={`/studio/content/${v.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 110px 110px 90px 90px",
                gap: 12,
                alignItems: "center",
                padding: "14px 18px",
                borderTop: "1px solid var(--hairline)",
                textDecoration: "none",
                color: "var(--ink-1)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
                  /watch/{v.slug}
                </div>
              </div>
              <div>
                <Pill tone={STATUS_TONE[v.status] ?? STATUS_TONE.draft}>{v.status}</Pill>
              </div>
              <div>
                <Pill tone={VIS_TONE[v.visibility] ?? VIS_TONE.public}>{v.visibility}</Pill>
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
      </section>
    </div>
  );
}
