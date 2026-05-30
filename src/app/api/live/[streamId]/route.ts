import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";
import { postChat, recentChat, heartbeat, viewerCount, LiveError } from "@/lib/live";
import { rateLimit } from "@/lib/ratelimit";

// GET  /api/live/:streamId            → { messages, viewers }   (poll)
// POST /api/live/:streamId  { text }  → post a chat message (rate-limited, moderated)
// POST /api/live/:streamId  { heartbeat:true } → presence ping, returns { viewers }
export async function GET(_req: Request, { params }: { params: { streamId: string } }) {
  const [messages, viewers] = await Promise.all([recentChat(params.streamId), viewerCount(params.streamId)]);
  return NextResponse.json({ messages, viewers });
}

export async function POST(req: Request, { params }: { params: { streamId: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { text?: string; heartbeat?: boolean };

  if (body.heartbeat) {
    const viewers = await heartbeat(params.streamId, session.userId);
    return NextResponse.json({ viewers });
  }

  // Slow-mode / flood protection: 5 messages / 10s per user per stream.
  const rl = await rateLimit(`chat:${params.streamId}:${session.userId}`, 5, 10);
  if (!rl.ok) return NextResponse.json({ error: "slow down" }, { status: 429 });

  try {
    const message = await postChat(params.streamId, { user: session.handle, text: body.text ?? "" });
    return NextResponse.json({ message });
  } catch (err) {
    if (err instanceof LiveError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
}
