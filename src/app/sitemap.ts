/**
 * Dynamic sitemaps (docs/ROUTES.md "Public" + HANDOFF.md §7).
 * Split into per-type sitemaps via Next 14 `generateSitemaps()`:
 * creators, videos, clips, categories. DB reads are wrapped in try/catch so
 * `next build` without a DATABASE_URL still succeeds (returns an empty sitemap).
 */
import type { MetadataRoute } from "next";
import { canonical } from "@/lib/seo/meta";
import {
  sitemapChannels,
  sitemapVideos,
  sitemapClips,
  sitemapCategories,
} from "@/lib/queries/public";

export const dynamic = "force-dynamic";

export async function generateSitemaps(): Promise<{ id: string }[]> {
  return [{ id: "creators" }, { id: "videos" }, { id: "clips" }, { id: "categories" }];
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  try {
    switch (id) {
      case "creators": {
        const channels = await sitemapChannels();
        return channels.map((c) => ({
          url: canonical(`/c/${c.handle}`),
          lastModified: c.createdAt,
          changeFrequency: "daily",
          priority: 0.8,
        }));
      }
      case "videos": {
        const videos = await sitemapVideos();
        return videos.map((v) => ({
          url: canonical(`/watch/${v.slug}`),
          lastModified: v.publishedAt ?? v.createdAt,
          changeFrequency: "weekly",
          priority: 0.7,
        }));
      }
      case "clips": {
        const clips = await sitemapClips();
        return clips.map((c) => ({
          url: canonical(`/clip/${c.slug}`),
          lastModified: c.publishedAt ?? c.createdAt,
          changeFrequency: "weekly",
          priority: 0.6,
        }));
      }
      case "categories": {
        const categories = await sitemapCategories();
        return categories.map((category) => ({
          url: canonical(`/explore/${category}`),
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.5,
        }));
      }
      default:
        return [];
    }
  } catch {
    // No DB at build time — emit an empty sitemap rather than failing the build.
    return [];
  }
}
