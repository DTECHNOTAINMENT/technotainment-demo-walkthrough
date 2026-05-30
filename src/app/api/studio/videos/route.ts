import { NextResponse } from "next/server";
import { requireCreatorChannel, createVideoUpload, StudioError } from "@/lib/studio";

// POST /api/studio/videos { title } — initialise a Mux direct upload + draft Video.
export async function POST(req: Request) {
  try {
    const { channel } = await requireCreatorChannel();
    const { title } = (await req.json().catch(() => ({}))) as { title?: string };
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
    const result = await createVideoUpload({ channelId: channel.id, title });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
}
