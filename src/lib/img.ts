// Demo imagery. We default to Picsum because it ALWAYS returns a real photo — keyword photo
// CDNs (e.g. LoremFlickr) return a grey "no results" placeholder for specific tag combos that
// loads "successfully" and can't be detected as a blank, which left grey tiles. Reliability wins.
//
// OVERRIDE (configure-don't-code): to use your own hand-picked per-category artwork, drop a file
// at /public/categories/<slug>.jpg and add the slug to CATEGORY_FILE below — no other code change.

/** Categories with a hand-picked file at /public/categories/<slug>.jpg (owner override). */
const CATEGORY_FILE: Record<string, string> = {
  // e.g. "competitive esports": "esports" -> /public/categories/esports.jpg
};

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
  // Owner override: real per-category artwork dropped at /public/categories/<slug>.jpg wins.
  const file = CATEGORY_FILE[key];
  if (file) return `/categories/${file}.jpg`;
  // Reliability-first: Picsum ALWAYS returns a real photo (no grey "no results" placeholders
  // like keyword CDNs, which load "successfully" and can't be detected as blanks). Seeded by
  // category+item so it's deterministic and varied. To restore true per-category photography,
  // drop files in /public/categories (see CATEGORY_FILE above) — no code change.
  const seed = `${key || "tn"}-${seedKey}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

/**
 * A guaranteed-loading image for the same seed (Picsum is extremely reliable). Used as the
 * fallback behind <SmartImg> so a thumbnail never stays blank if the curated CDN is slow/down.
 */
export function reliableImage(seedKey: string, w = 640, h = 360): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`tn-${seedKey}`)}/${w}/${h}`;
}
