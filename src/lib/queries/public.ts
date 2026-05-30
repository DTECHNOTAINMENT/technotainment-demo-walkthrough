/**
 * Public read queries for the SSR/ISR pages (docs/ROUTES.md "Public" section).
 * These power crawlable pages, so they only ever return PUBLIC, PUBLISHED content.
 * All reads go through Prisma; callers cache via route-level `revalidate` (ISR).
 */
import { prisma } from "@/lib/db";

export const PUBLIC_REVALIDATE = 60; // seconds (docs/ROUTES.md: /c/:handle revalidate 60s)

export async function getChannelByHandle(handle: string) {
  const channel = await prisma.channel.findUnique({
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
  return channel;
}

export async function getVideoBySlug(slug: string) {
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
  const video = await getVideoBySlug(slug);
  if (!video || video.kind !== "clip") return null;
  return video;
}

export async function listLiveStreams() {
  return prisma.stream.findMany({
    where: { status: "live", visibility: "public" },
    orderBy: { viewers: "desc" },
    include: { channel: { include: { creator: true } } },
  });
}

export async function listExplore(category: string) {
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
  return videos;
}

export async function searchPublic(q: string) {
  if (!q.trim()) return { channels: [], videos: [] };
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
}

// ---- Sitemap sources (ids/slugs + lastmod) ----

export async function sitemapChannels() {
  return prisma.channel.findMany({ select: { handle: true, createdAt: true } });
}

export async function sitemapVideos() {
  return prisma.video.findMany({
    where: { status: "published", visibility: "public", kind: "vod" },
    select: { slug: true, publishedAt: true, createdAt: true },
  });
}

export async function sitemapClips() {
  return prisma.video.findMany({
    where: { status: "published", visibility: "public", kind: "clip" },
    select: { slug: true, publishedAt: true, createdAt: true },
  });
}

export async function sitemapCategories() {
  const rows = await prisma.creator.findMany({ select: { category: true }, distinct: ["category"] });
  return rows.map((r) => r.category);
}

export type PublicChannel = NonNullable<Awaited<ReturnType<typeof getChannelByHandle>>>;
export type PublicVideo = NonNullable<Awaited<ReturnType<typeof getVideoBySlug>>>;
export type PublicStream = Awaited<ReturnType<typeof listLiveStreams>>[number];
