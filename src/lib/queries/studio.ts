/**
 * Creator Studio read queries (owner-scoped). Pages call requireCreatorChannel() (lib/studio)
 * to resolve the signed-in creator's channel, then these for data. Server-only.
 *
 * NO-DB FALLBACK: every read tries Prisma first and falls back to the demo fixtures
 * (lib/fixtures-studio) on throw (no db / unreachable) OR when the query is empty — so
 * every studio page renders populated with zero backend. Real DB data ALWAYS wins when
 * present. The fixtures are shaped to mirror each query's Prisma return, and assigned via
 * `as` onto the Prisma return type (same pattern as queries/public.ts). Each function
 * declares its return type as the Prisma row shape so the demo path and db path unify.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { creatorEarnings, type EarningsSummary } from "@/lib/earnings";
import {
  demoOverview,
  demoContent,
  demoVideo,
  demoStreams,
  demoTiers,
  demoProducts,
  demoMembers,
  demoAnalytics,
  demoEarningsView,
} from "@/lib/fixtures-studio";

// ---- return-type aliases (Prisma row shapes the pages consume) ------------

type TxnRow = Prisma.TransactionGetPayload<object>;
type VideoRow = Prisma.VideoGetPayload<{ include: { chapters: true } }>;
type StreamRow = Prisma.StreamGetPayload<object>;
type ProductRow = Prisma.ProductGetPayload<object>;
type TierRow = Prisma.TierGetPayload<{ include: { _count: { select: { memberships: true } } } }>;
type MemberRow = Prisma.MembershipGetPayload<{
  include: { user: { select: { handle: true; displayName: true; avatarUrl: true } }; tier: { select: { name: true } } };
}>;
type PayoutRow = Prisma.PayoutGetPayload<object>;
type PayoutMethodRow = Prisma.PayoutMethodGetPayload<object>;

export interface StudioOverview {
  videoCount: number;
  memberCount: number;
  followerCount: number;
  recent: TxnRow[];
  earnings: EarningsSummary;
}

export interface AnalyticsSummary {
  totalViews: number;
  revenueCast: number;
  byKind: Record<string, number>;
  txnCount: number;
}

export interface EarningsViewResult {
  summary: EarningsSummary;
  payouts: PayoutRow[];
  methods: PayoutMethodRow[];
}

// ---- queries --------------------------------------------------------------

export async function studioOverview(channelId: string, creatorId: string): Promise<StudioOverview> {
  try {
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
  } catch {
    return demoOverview() as unknown as StudioOverview;
  }
}

export async function listContent(channelId: string): Promise<VideoRow[]> {
  try {
    const videos = await prisma.video.findMany({
      where: { channelId },
      orderBy: { createdAt: "desc" },
      include: { chapters: { orderBy: { atSec: "asc" } } },
    });
    if (videos.length) return videos;
  } catch {
    /* no db — fall through to fixtures */
  }
  return demoContent() as unknown as VideoRow[];
}

export async function getStudioVideo(id: string, channelId: string): Promise<VideoRow | null> {
  try {
    const v = await prisma.video.findFirst({
      where: { id, channelId },
      include: { chapters: { orderBy: { atSec: "asc" } } },
    });
    if (v) return v;
  } catch {
    /* no db — fall through to fixtures */
  }
  return demoVideo(id) as unknown as VideoRow | null;
}

export async function listStreams(channelId: string): Promise<StreamRow[]> {
  try {
    const streams = await prisma.stream.findMany({ where: { channelId }, orderBy: { createdAt: "desc" } });
    if (streams.length) return streams;
  } catch {
    /* no db — fall through to fixtures */
  }
  return demoStreams() as unknown as StreamRow[];
}

export async function listTiers(channelId: string): Promise<TierRow[]> {
  try {
    const tiers = await prisma.tier.findMany({
      where: { channelId },
      orderBy: { priceCast: "asc" },
      include: { _count: { select: { memberships: true } } },
    });
    if (tiers.length) return tiers;
  } catch {
    /* no db — fall through to fixtures */
  }
  return demoTiers() as unknown as TierRow[];
}

export async function listProducts(channelId: string): Promise<ProductRow[]> {
  try {
    const products = await prisma.product.findMany({ where: { channelId }, orderBy: { createdAt: "desc" } });
    if (products.length) return products;
  } catch {
    /* no db — fall through to fixtures */
  }
  return demoProducts() as unknown as ProductRow[];
}

export async function listMembers(channelId: string): Promise<MemberRow[]> {
  try {
    const members = await prisma.membership.findMany({
      where: { channelId, status: "active" },
      orderBy: { startedAt: "desc" },
      include: { user: { select: { handle: true, displayName: true, avatarUrl: true } }, tier: { select: { name: true } } },
    });
    if (members.length) return members;
  } catch {
    /* no db — fall through to fixtures */
  }
  return demoMembers() as unknown as MemberRow[];
}

/** Lightweight analytics derived from settled transactions + video views. */
export async function analyticsSummary(channelId: string): Promise<AnalyticsSummary> {
  try {
    const [views, txns] = await Promise.all([
      prisma.video.aggregate({ where: { channelId }, _sum: { views: true } }),
      prisma.transaction.findMany({
        where: { channelId, status: "settled" },
        select: { cast: true, kind: true, createdAt: true },
      }),
    ]);
    if (txns.length === 0) return demoAnalytics();
    const revenueCast = txns.reduce((s, t) => s + Math.abs(t.cast), 0);
    const byKind: Record<string, number> = {};
    for (const t of txns) byKind[t.kind] = (byKind[t.kind] ?? 0) + Math.abs(t.cast);
    return { totalViews: views._sum.views ?? 0, revenueCast, byKind, txnCount: txns.length };
  } catch {
    return demoAnalytics();
  }
}

export async function earningsView(creatorId: string): Promise<EarningsViewResult> {
  try {
    const [summary, payouts, methods] = await Promise.all([
      creatorEarnings(creatorId),
      prisma.payout.findMany({ where: { creatorId }, orderBy: { date: "desc" } }),
      prisma.payoutMethod.findMany({ where: { creatorId }, orderBy: { isDefault: "desc" } }),
    ]);
    return { summary, payouts, methods };
  } catch {
    return demoEarningsView() as unknown as EarningsViewResult;
  }
}
