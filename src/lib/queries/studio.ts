/**
 * Creator Studio read queries (owner-scoped). Pages call requireCreatorChannel() (lib/studio)
 * to resolve the signed-in creator's channel, then these for data. Server-only.
 */
import { prisma } from "@/lib/db";
import { creatorEarnings } from "@/lib/earnings";

export async function studioOverview(channelId: string, creatorId: string) {
  const [videoCount, memberCount, followerCount, recent, earnings] = await Promise.all([
    prisma.video.count({ where: { channelId } }),
    prisma.membership.count({ where: { channelId, status: "active" } }),
    prisma.follow.count({ where: { channelId } }),
    prisma.transaction.findMany({
      where: { channelId, status: "settled" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    creatorEarnings(creatorId),
  ]);
  return { videoCount, memberCount, followerCount, recent, earnings };
}

export async function listContent(channelId: string) {
  return prisma.video.findMany({
    where: { channelId },
    orderBy: { createdAt: "desc" },
    include: { chapters: { orderBy: { atSec: "asc" } } },
  });
}

export async function getStudioVideo(id: string, channelId: string) {
  return prisma.video.findFirst({ where: { id, channelId }, include: { chapters: { orderBy: { atSec: "asc" } } } });
}

export async function listStreams(channelId: string) {
  return prisma.stream.findMany({ where: { channelId }, orderBy: { createdAt: "desc" } });
}

export async function listTiers(channelId: string) {
  return prisma.tier.findMany({
    where: { channelId },
    orderBy: { priceCast: "asc" },
    include: { _count: { select: { memberships: true } } },
  });
}

export async function listProducts(channelId: string) {
  return prisma.product.findMany({ where: { channelId }, orderBy: { createdAt: "desc" } });
}

export async function listMembers(channelId: string) {
  return prisma.membership.findMany({
    where: { channelId, status: "active" },
    orderBy: { startedAt: "desc" },
    include: { user: { select: { handle: true, displayName: true, avatarUrl: true } }, tier: { select: { name: true } } },
  });
}

/** Lightweight analytics derived from settled transactions + video views. */
export async function analyticsSummary(channelId: string) {
  const [views, txns] = await Promise.all([
    prisma.video.aggregate({ where: { channelId }, _sum: { views: true } }),
    prisma.transaction.findMany({
      where: { channelId, status: "settled" },
      select: { cast: true, kind: true, createdAt: true },
    }),
  ]);
  const revenueCast = txns.reduce((s, t) => s + Math.abs(t.cast), 0);
  const byKind: Record<string, number> = {};
  for (const t of txns) byKind[t.kind] = (byKind[t.kind] ?? 0) + Math.abs(t.cast);
  return { totalViews: views._sum.views ?? 0, revenueCast, byKind, txnCount: txns.length };
}

export async function earningsView(creatorId: string) {
  const [summary, payouts, methods] = await Promise.all([
    creatorEarnings(creatorId),
    prisma.payout.findMany({ where: { creatorId }, orderBy: { date: "desc" } }),
    prisma.payoutMethod.findMany({ where: { creatorId }, orderBy: { isDefault: "desc" } }),
  ]);
  return { summary, payouts, methods };
}
