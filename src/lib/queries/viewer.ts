/**
 * Authed viewer read queries (consent-scoped where applicable). Used by the signed-in
 * app surface: /home, /following, /library. Server-only.
 */
import { prisma } from "@/lib/db";
import { fxRecentVideos, fxTopCreators, fxChannelByHandle, type FxChannel } from "@/lib/fixtures";

export async function isFollowing(userId: string, channelId: string): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: { userId_channelId: { userId, channelId } },
    select: { id: true },
  });
  return !!row;
}

export async function listFollowing(userId: string) {
  try {
    const follows = await prisma.follow.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { channel: { include: { creator: true, streams: { where: { status: "live" }, take: 1 } } } },
    });
    const channels = follows.map((f) => f.channel);
    type DbRows = typeof channels;
    if (channels.length) return channels;
    return fxFollowingChannels() as unknown as DbRows;
  } catch {
    return fxFollowingChannels() as unknown as Awaited<ReturnType<typeof listFollowingDb>>;
  }
}

/** No-DB stand-in: the top creators' channels (each carries creator + a ≤1 live-streams slice). */
function fxFollowingChannels(): FxChannel[] {
  return fxTopCreators()
    .map((c) => fxChannelByHandle(c.handle))
    .filter((c): c is FxChannel => c !== null);
}

function listFollowingDb() {
  return prisma.channel.findMany({
    include: { creator: true, streams: { where: { status: "live" }, take: 1 } },
  });
}

/** Home feed: latest public videos from channels the user follows, falling back to trending. */
export async function homeFeed(userId: string) {
  try {
    const following = await prisma.follow.findMany({ where: { userId }, select: { channelId: true } });
    const channelIds = following.map((f) => f.channelId);
    const where = channelIds.length
      ? { status: "published" as const, visibility: "public" as const, channelId: { in: channelIds } }
      : { status: "published" as const, visibility: "public" as const };
    const rows = await prisma.video.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { views: "desc" }],
      take: 24,
      include: { channel: { include: { creator: true } } },
    });
    type DbRows = typeof rows;
    if (rows.length) return rows;
    return fxRecentVideos(24) as unknown as DbRows;
  } catch {
    return fxRecentVideos(24) as unknown as Awaited<ReturnType<typeof homeFeedDb>>;
  }
}

function homeFeedDb() {
  return prisma.video.findMany({
    where: { status: "published", visibility: "public" },
    include: { channel: { include: { creator: true } } },
  });
}

/** Library: active memberships + purchased PPV/drops, derived from settled transactions. */
export async function library(userId: string) {
  try {
    const [memberships, purchases] = await Promise.all([
      prisma.membership.findMany({
        where: { userId, status: "active" },
        include: { tier: true, channel: { include: { creator: true } } },
      }),
      prisma.transaction.findMany({
        where: { userId, kind: { in: ["ppv", "drop"] }, status: "settled" },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return { memberships, purchases };
  } catch {
    // No-DB demo: empty library is a valid, non-erroring state (the page shows an empty state).
    return { memberships: [], purchases: [] } as {
      memberships: Awaited<ReturnType<typeof libraryMembershipsDb>>;
      purchases: Awaited<ReturnType<typeof libraryPurchasesDb>>;
    };
  }
}

function libraryMembershipsDb() {
  return prisma.membership.findMany({ include: { tier: true, channel: { include: { creator: true } } } });
}
function libraryPurchasesDb() {
  return prisma.transaction.findMany({});
}

export async function consentFor(userId: string) {
  try {
    return await prisma.consentGrant.findMany({ where: { userId }, include: { creator: true } });
  } catch {
    // No-DB demo: no consent grants yet — the profile page renders its default toggles.
    return [] as Awaited<ReturnType<typeof consentForDb>>;
  }
}

function consentForDb() {
  return prisma.consentGrant.findMany({ include: { creator: true } });
}
