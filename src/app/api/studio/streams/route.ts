import { NextResponse } from "next/server";
import { requireCreatorChannel, startStream, stopStream, rotateStreamKey, StudioError } from "@/lib/studio";

// POST /api/studio/streams { action: "start"|"stop"|"rotate", ... }
export async function POST(req: Request) {
  try {
    const { channel } = await requireCreatorChannel();
    const body = (await req.json().catch(() => ({}))) as {
      action?: "start" | "stop" | "rotate";
      title?: string;
      category?: string;
      streamId?: string;
    };

    switch (body.action) {
      case "start":
        return NextResponse.json(
          await startStream({ channelId: channel.id, title: body.title ?? "live", category: body.category ?? "live" }),
        );
      case "stop":
        if (!body.streamId) return NextResponse.json({ error: "streamId required" }, { status: 400 });
        return NextResponse.json(await stopStream(body.streamId, channel.id));
      case "rotate":
        if (!body.streamId) return NextResponse.json({ error: "streamId required" }, { status: 400 });
        return NextResponse.json(await rotateStreamKey(body.streamId, channel.id));
      default:
        return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof StudioError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
}
