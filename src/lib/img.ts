// Demo imagery — curated PER CREATOR CATEGORY (owner choice). Each of the platform's
// categories maps to a hand-curated keyword set so every image actually depicts the subject
// (esports → gaming arenas, ceramics → pottery, football → stadiums …) instead of a random
// stock photo. We render a real photo from a keyword CDN; the seed is varied per item so two
// videos in the SAME category show two DIFFERENT real photos of that subject (no repeated grid).
//
// Reliability: photos come from a real-photo CDN keyed by curated tags — deterministic via the
// `lock` seed, so a given item always resolves to the same image (CDN-cacheable). If a tile ever
// fails to load, the <Thumb> primitive falls back to the brand gradient, so nothing renders blank.
//
// OVERRIDE (configure-don't-code): to use your own hand-picked artwork for a category, drop a file
// at /public/categories/<slug>.jpg and add the slug to CATEGORY_FILE below — no other code change.

/** Curated keyword sets, one per creator category in the roster (src/lib/fixtures.ts). */
const CATEGORY_TAGS: Record<string, string> = {
  "modular synth": "synthesizer,music studio,sound design",
  "live cooking": "chef,cooking,kitchen",
  "lower-league football": "football,soccer,stadium",
  illustration: "drawing,illustration,ink art",
  "country folk": "acoustic guitar,songwriter,stage",
  "electronics repair": "electronics,workbench,vintage hifi",
  "street skate": "skateboarding,street skate",
  ceramics: "pottery,ceramics,clay",
  "talk show host": "podcast,microphone,studio",
  "ultra running": "trail running,mountain",
  "afro-fusion dj": "dj,turntable,concert lights",
  "novelist · workshop": "writing,notebook,books",
  "alpine climbing": "alpine climbing,mountaineering",
  "chess · open analysis": "chess board,strategy",
  "competitive esports": "esports,gaming,arena",
  "ambient sessions": "ambient,concert lights,fog",
  "trapeze · circus": "circus,acrobat,trapeze",
  "workshop · woodwork": "woodworking,carpentry,workshop",
};

/** Categories with a hand-picked file at /public/categories/<slug>.jpg (owner override). */
const CATEGORY_FILE: Record<string, string> = {
  // e.g. "competitive esports": "esports" -> /public/categories/esports.jpg
};

const FALLBACK_TAGS = "live stream,stage,concert";

/** Stable numeric lock from a string (FNV-1a) so an image URL is deterministic + cacheable. */
function lockOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/**
 * A curated, category-representative image. `category` selects the keyword set; `seedKey`
 * (a stable per-item id/slug) varies which real photo of that subject is shown, so items in
 * the same category don't all look identical. `w`/`h` set the crop.
 */
export function catImage(
  category: string | null | undefined,
  seedKey: string,
  w = 640,
  h = 360,
): string {
  const key = (category ?? "").trim().toLowerCase();
  const file = CATEGORY_FILE[key];
  if (file) return `/categories/${file}.jpg`;
  const tags = CATEGORY_TAGS[key] ?? FALLBACK_TAGS;
  const lock = lockOf(seedKey || key || tags);
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(tags)}?lock=${lock}`;
}

/**
 * A guaranteed-loading image for the same seed (Picsum is extremely reliable). Used as the
 * fallback behind <SmartImg> so a thumbnail never stays blank if the curated CDN is slow/down.
 */
export function reliableImage(seedKey: string, w = 640, h = 360): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`tn-${seedKey}`)}/${w}/${h}`;
}
