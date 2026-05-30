import { NextResponse } from "next/server";
import { requireCreatorChannel, updateVideo, StudioError } from "@/lib/studio";

// PATCH /api/studio/videos/:id — edit a video (incl. SEO fields) or publish it.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { channel } = await requireCreatorChannel();
    const body = (await req.json().catch(() => ({}))) as Parameters<typeof updateVideo>[2];
    const updated = await updateVideo(params.id, channel.id, body);
    return NextResponse.json({ ok: true, id: updated.id, slug: updated.slug, status: updated.status });
  } catch (err) {
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
