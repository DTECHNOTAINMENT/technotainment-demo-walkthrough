/**
 * Public read queries for the SSR/ISR pages (docs/ROUTES.md "Public" section).
 * These power crawlable pages, so they only ever return PUBLIC, PUBLISHED content.
 * All reads go through Prisma; callers cache via route-level `revalidate` (ISR).
 *
 * NO-DATABASE FALLBACK: every read below is resilient — if the Prisma query throws
 * (no DATABASE_URL, DB unreachable) OR returns empty, we fall back to the in-memory
 * demo dataset in `@/lib/fixtures` so a Vercel deploy with no DB attached still renders
 * a fully populated home / live / explore / channel / watch / search. Real DB data ALWAYS
 * wins when present — fixtures are used only when the DB query throws or yields nothing.
 * Fixture rows are structurally identical to the Prisma `include` shapes; the DB query type
 * (captured as `DbRows`/`DbRow`) drives the cast so the public function signatures and return
 * types are unchanged — consumers keep their precise Prisma types.
 */
import { prisma } from "@/lib/db";
import {
  fxLiveStreams,
  fxRecentVideos,
  fxTopCreators,
  fxChannelByHandle,
  fxVideoBySlug,
  fxClipBySlug,
  fxExplore,
  fxSearch,
  fxSitemapChannels,
  fxSitemapVideos,
  fxSitemapClips,
  fxSitemapCategories,
} from "@/lib/fixtures";

export const PUBLIC_REVALIDATE = 60; // seconds (docs/ROUTES.md: /c/:handle revalidate 60s)

export async function getChannelByHandle(handle: string) {
  type DbRow = Awaited<ReturnType<typeof getChannelByHandleDb>>;
  try {
    const channel = await getChannelByHandleDb(handle);
    if (channel) return channel;
    return (fxChannelByHandle(handle) as unknown as DbRow) ?? null;
  } catch {
    return (fxChannelByHandle(handle) as unknown as DbRow) ?? null;
  }
}

function getChannelByHandleDb(handle: string) {
  return prisma.channel.findUnique({
    where: { handle },
    include: {
      creator: true,
      tiers: { orderBy: { priceCast: "asc" } },
      products: { where: { status: "live" }, orderBy: { createdAt: "desc" } },
      videos: {
        where: { status: "published", visibility: "public" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 24,
      },
      streams: { where: { status: "live" }, take: 1 },
    },
  });
}

export async function getVideoBySlug(slug: string) {
  type DbRow = Awaited<ReturnType<typeof getVideoBySlugDb>>;
  try {
    const video = await getVideoBySlugDb(slug);
    if (video) return video;
    return (fxVideoBySlug(slug) as unknown as DbRow) ?? null;
  } catch {
    return (fxVideoBySlug(slug) as unknown as DbRow) ?? null;
  }
}

/** Internal: the exact Prisma shape getVideoBySlug returns — used to type fixture fallbacks. */
function getVideoBySlugDb(slug: string) {
  return prisma.video.findUnique({
    where: { slug },
    include: {
      chapters: { orderBy: { atSec: "asc" } },
      channel: { include: { creator: true } },
    },
  });
}

/** A clip is a Video with kind = "clip". */
export async function getClipBySlug(slug: string) {
  try {
    const video = await getVideoBySlugDb(slug);
    if (video) return video.kind === "clip" ? video : null;
    return fxClipBySlug(slug) as unknown as Awaited<ReturnType<typeof getVideoBySlugDb>>;
  } catch {
    return fxClipBySlug(slug) as unknown as Awaited<ReturnType<typeof getVideoBySlugDb>>;
  }
}

export async function listLiveStreams() {
  try {
    const rows = await prisma.stream.findMany({
      where: { status: "live", visibility: "public" },
      orderBy: { viewers: "desc" },
      include: { channel: { include: { creator: true } } },
    });
    type DbRows = typeof rows;
    if (rows.length) return rows;
    return fxLiveStreams() as unknown as DbRows;
  } catch {
    return fxLiveStreams() as unknown as Awaited<ReturnType<typeof listLiveStreamsDb>>;
  }
}

function listLiveStreamsDb() {
  return prisma.stream.findMany({
    where: { status: "live", visibility: "public" },
    orderBy: { viewers: "desc" },
    include: { channel: { include: { creator: true } } },
  });
}

/** Recent published public VODs across all channels — powers the home grid + anon front door. */
export async function listRecentVideos(take = 18) {
  try {
    const rows = await prisma.video.findMany({
      where: { status: "published", visibility: "public", kind: "vod" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take,
      include: { channel: { include: { creator: true } } },
    });
    type DbRows = typeof rows;
    if (rows.length) return rows;
    return fxRecentVideos(take) as unknown as DbRows;
  } catch {
    return fxRecentVideos(take) as unknown as Awaited<ReturnType<typeof listRecentVideosDb>>;
  }
}

function listRecentVideosDb() {
  return prisma.video.findMany({
    where: { status: "published", visibility: "public", kind: "vod" },
    include: { channel: { include: { creator: true } } },
  });
}

/** Top creators (with their channel) — used for the anon sidebar "following" stand-in. */
export async function listTopCreators(take = 12) {
  try {
    const rows = await prisma.creator.findMany({
      orderBy: { followers: "desc" },
      take,
      include: { channel: { include: { streams: { where: { status: "live" }, take: 1 } } } },
    });
    type DbRows = typeof rows;
    if (rows.length) return rows;
    return fxTopCreators(take) as unknown as DbRows;
  } catch {
    return fxTopCreators(take) as unknown as Awaited<ReturnType<typeof listTopCreatorsDb>>;
  }
}

function listTopCreatorsDb() {
  return prisma.creator.findMany({
    orderBy: { followers: "desc" },
    include: { channel: { include: { streams: { where: { status: "live" }, take: 1 } } } },
  });
}

export async function listExplore(category: string) {
  try {
    const videos = await prisma.video.findMany({
      where: {
        status: "published",
        visibility: "public",
        channel: { creator: { category: { contains: category, mode: "insensitive" } } },
      },
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: 48,
      include: { channel: { include: { creator: true } } },
    });
    type DbRows = typeof videos;
    if (videos.length) return videos;
    return fxExplore(category) as unknown as DbRows;
  } catch {
    return fxExplore(category) as unknown as Awaited<ReturnType<typeof listExploreDb>>;
  }
}

function listExploreDb() {
  return prisma.video.findMany({
    where: { status: "published", visibility: "public" },
    include: { channel: { include: { creator: true } } },
  });
}

export async function searchPublic(q: string) {
  if (!q.trim()) return { channels: [], videos: [] };
  try {
    const [channels, videos] = await Promise.all([
      prisma.channel.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { handle: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { creator: true },
        take: 12,
      }),
      prisma.video.findMany({
        where: {
          status: "published",
          visibility: "public",
          title: { contains: q, mode: "insensitive" },
        },
        include: { channel: { include: { creator: true } } },
        take: 24,
      }),
    ]);
    return { channels, videos };
  } catch {
    const fx = fxSearch(q);
    return {
      channels: fx.channels as unknown as Awaited<ReturnType<typeof searchChannelsDb>>,
      videos: fx.videos as unknown as Awaited<ReturnType<typeof searchVideosDb>>,
    };
  }
}

function searchChannelsDb() {
  return prisma.channel.findMany({ include: { creator: true }, take: 12 });
}

function searchVideosDb() {
  return prisma.video.findMany({ include: { channel: { include: { creator: true } } }, take: 24 });
}

// ---- Sitemap sources (ids/slugs + lastmod) ----

export async function sitemapChannels() {
  try {
    const rows = await prisma.channel.findMany({ select: { handle: true, createdAt: true } });
    if (rows.length) return rows;
    return fxSitemapChannels() as unknown as typeof rows;
  } catch {
    return fxSitemapChannels() as unknown as Awaited<ReturnType<typeof sitemapChannelsDb>>;
  }
}

function sitemapChannelsDb() {
  return prisma.channel.findMany({ select: { handle: true, createdAt: true } });
}

export async function sitemapVideos() {
  try {
    const rows = await prisma.video.findMany({
      where: { status: "published", visibility: "public", kind: "vod" },
      select: { slug: true, publishedAt: true, createdAt: true },
    });
    if (rows.length) return rows;
    return fxSitemapVideos() as unknown as typeof rows;
  } catch {
    return fxSitemapVideos() as unknown as Awaited<ReturnType<typeof sitemapVideosDb>>;
  }
}

function sitemapVideosDb() {
  return prisma.video.findMany({
    where: { status: "published", visibility: "public", kind: "vod" },
    select: { slug: true, publishedAt: true, createdAt: true },
  });
}

export async function sitemapClips() {
  try {
    const rows = await prisma.video.findMany({
      where: { status: "published", visibility: "public", kind: "clip" },
      select: { slug: true, publishedAt: true, createdAt: true },
    });
    if (rows.length) return rows;
    return fxSitemapClips() as unknown as typeof rows;
  } catch {
    return fxSitemapClips() as unknown as Awaited<ReturnType<typeof sitemapVideosDb>>;
  }
}

export async function sitemapCategories() {
  try {
    const rows = await prisma.creator.findMany({ select: { category: true }, distinct: ["category"] });
    if (rows.length) return rows.map((r) => r.category);
  } catch {
    // fall through to fixtures
  }
  return fxSitemapCategories();
}

export type PublicChannel = NonNullable<Awaited<ReturnType<typeof getChannelByHandle>>>;
export type PublicVideo = NonNullable<Awaited<ReturnType<typeof getVideoBySlug>>>;
export type PublicStream = Awaited<ReturnType<typeof listLiveStreams>>[number];
