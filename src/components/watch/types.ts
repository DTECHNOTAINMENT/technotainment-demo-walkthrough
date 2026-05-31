// Shared prop shapes for the watch/clip page client components. Plain serialisable
// data only — the server page builds these and passes them down (no Prisma types cross
// the client boundary).

export interface WatchCreator {
  name: string;
  handle: string;
  brand?: string | null;
  brand2?: string | null;
  followers?: number | null;
}

export interface WatchDrop {
  name: string;
  priceCast: number;
  edition: string;
  imgUrl: string;
}

export interface WatchTier {
  name: string;
  cast: number;
  perks: string[];
  popular?: boolean;
}

export interface WatchCompetition {
  name: string;
  entry: number;
  ends: string;
}

export interface WatchAbout {
  category: string;
  tags: string;
  schedule: string;
  language: string;
}

/** A single "up next" rail item. */
export interface UpNextItem {
  id: string;
  title: string;
  handle: string;
  href: string;
  thumbUrl: string;
  overlay: string;
  overlayBg: string;
  overlayColor?: string;
  live?: boolean;
  viewers?: number;
  views?: number;
  ago?: string;
  dur?: string;
}
