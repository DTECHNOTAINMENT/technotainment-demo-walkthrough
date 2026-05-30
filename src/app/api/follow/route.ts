import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

// POST /api/follow  { channelId, action: "follow" | "unfollow" }
export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { channelId, action } = (await req.json().catch(() => ({}))) as {
    channelId?: string;
    action?: "follow" | "unfollow";
  };
  if (!channelId) return NextResponse.json({ error: "channelId required" }, { status: 400 });

  if (action === "unfollow") {
    await prisma.follow.deleteMany({ where: { userId: session.userId, channelId } });
    return NextResponse.json({ following: false });
  }
  await prisma.follow.upsert({
    where: { userId_channelId: { userId: session.userId, channelId } },
    create: { userId: session.userId, channelId },
    update: {},
  });
  return NextResponse.json({ following: true });
}
