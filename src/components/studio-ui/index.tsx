// Studio/Admin shared UI primitives — ported from prototype/v4/studio-shared.jsx
// and admin-shared.jsx so studio + admin screens can be rebuilt to pixel-match the
// prototype. Uses the exact CSS classes already in src/app/globals.css.
//
// Presentational (server-safe): StatCard, StudioCard, StudioPageHead, Pill, Meter,
//   AreaSpark, Spark, Bars, SegBar.
// Interactive ("use client"): Seg, Toggle, CopyField, Dropzone.

export {
  StatCard,
  StudioCard,
  StudioPageHead,
  Pill,
  Meter,
  type PillTone,
} from "./primitives";

export { AreaSpark, Spark, Bars, SegBar, type SegBarSegment } from "./charts";

export { Seg, Toggle, CopyField, Dropzone, type SegItem } from "./interactive";

// CAST <-> fiat helpers (re-exported from the canonical money lib so screens have
// one import). Replaces the prototype's castToGBP/gbp/gbpShort.
export { formatCast, formatFiat, castToFiat, fiatToCast } from "@/lib/cast";

/** Compact GBP, e.g. 248000 CAST -> "£2.5k". Mirrors prototype gbpShort. */
export function gbpShort(cast: number): string {
  const n = cast / 100;
  return "£" + (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : Math.round(n).toLocaleString("en-GB"));
}
