// Maps DB rows (streams + videos) into HomeView tile/hero shapes. Server-only helpers.
import type { HomeTile, HeroData } from "@/components/home/HomeView";
import { picThumb } from "@/components/ui/primitives";

type StreamRow = {
  id: string;
  title: string;
  category: string;
  viewers: number;
  channel: { handle: string; creator: { name: string; handle: string; brand: string; brand2: string } };
};

type VideoRow = {
  id: string;
  slug: string;
  title: string;
  thumbUrl: string | null;
  durationSec: number;
  publishedAt: Date | null;
  channel: { handle: string; creator: { name: string; handle: string; brand: string; brand2: string } };
};

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h) return `${h}h ${String(m % 60).padStart(2, "0")}m`;
  return `${m} min`;
}

function ago(d: Date | null): string {
  if (!d) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

export function streamTile(s: StreamRow): HomeTile {
  const c = s.channel.creator;
  return {
    id: s.id,
    title: s.title,
    href: `/c/${s.channel.handle.replace(/^@/, "")}`,
    thumb: picThumb(s.id),
    creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
    live: true,
    viewers: s.viewers,
  };
}

export function videoTile(v: VideoRow): HomeTile {
  const c = v.channel.creator;
  return {
    id: v.id,
    title: v.title,
    href: `/watch/${v.slug}`,
    thumb: v.thumbUrl || picThumb(v.id),
    creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
    live: false,
    dur: v.durationSec ? fmtDuration(v.durationSec) : null,
    ago: ago(v.publishedAt),
  };
}

export function heroFromStream(s: StreamRow): HeroData {
  const c = s.channel.creator;
  return {
    title: s.title,
    sub: `${s.category} · live now`,
    kicker: [s.category],
    href: `/c/${s.channel.handle.replace(/^@/, "")}`,
    img: picThumb(`${s.id}-hero`),
    viewers: s.viewers,
    creator: { name: c.name, handle: c.handle, brand: c.brand, brand2: c.brand2 },
  };
}

/** Compose hero + tiles from live streams and recent videos. */
export function buildHome(streams: StreamRow[], videos: VideoRow[]): { hero: HeroData | null; tiles: HomeTile[] } {
  const hero = streams.length ? heroFromStream(streams[0]) : null;
  const liveTiles = streams.map(streamTile);
  const vodTiles = videos.map(videoTile);
  return { hero, tiles: [...liveTiles, ...vodTiles] };
}
