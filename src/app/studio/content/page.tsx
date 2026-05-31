/**
 * Creator Studio — content library (/studio/content). Server-rendered list of every
 * video in the channel ported to match prototype/v4/studio-content.jsx. Data (listContent)
 * and the StUploadButton stay server-side; the interactive videos/schedule tabs and the
 * status filter (all / published / drafts / processing / scheduled) live in the
 * StContentFilter client component, which renders the `.st-row` table + schedule section.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listContent } from "@/lib/queries/studio";
import { StUploadButton } from "@/components/studio/StUploadButton";
import { StContentFilter, type ContentRow } from "@/components/studio/StContentFilter";
import { StudioPageHead } from "@/components/studio-ui";

export default async function StudioContentPage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const videos = await listContent(channelId);
  const rows: ContentRow[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    status: v.status,
    visibility: v.visibility,
    thumbUrl: v.thumbUrl,
    durationSec: v.durationSec,
    views: v.views,
    castEarned: v.castEarned,
    createdAt: new Date(v.createdAt).toISOString(),
  }));

  return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="content"
        sub="every upload, recording and scheduled stream in one place."
        actions={<StUploadButton />}
      />

      <StContentFilter rows={rows} />

      <div className="st-hint" style={{ marginTop: 16 }}>
        recordings of every stream land in <strong>content</strong> automatically once you end the broadcast — trim,
        retitle and publish them in the editor.
      </div>
    </div>
  );
}
