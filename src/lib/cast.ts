/**
 * CAST money helpers. CAST is an integer credit; 100 CAST = £1.00 (config.castPerGbp).
 * NEVER use floats for CAST. Convert to fiat only at the presentation/payout edge.
 * See CLAUDE.md §4 (money conventions) and docs/DATA_MODEL.md.
 */
import { economy } from "./config";

export type Cast = number; // always an integer

/** True if a value is a safe integer amount of CAST. */
export function isValidCast(v: unknown): v is Cast {
  return typeof v === "number" && Number.isInteger(v) && Number.isFinite(v);
}

/** Assert an integer CAST amount (throws on floats/NaN). */
export function assertCast(v: unknown, label = "cast"): asserts v is Cast {
  if (!isValidCast(v)) throw new Error(`invalid ${label}: expected integer CAST, got ${String(v)}`);
}

/** Convert integer CAST to fiat (major units, e.g. pounds). Presentation edge only. */
export function castToFiat(cast: Cast): number {
  assertCast(cast);
  return cast / economy.castPerGbp;
}

/** Convert a fiat major-unit amount to the nearest whole CAST. */
export function fiatToCast(fiat: number): Cast {
  return Math.round(fiat * economy.castPerGbp);
}

/** Format integer CAST as a fiat string, e.g. 4200 -> "£42.00". */
export function formatFiat(cast: Cast, currency = "GBP", locale = "en-GB"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(castToFiat(cast));
}

/** Format CAST with grouping, e.g. 12500 -> "12,500". */
export function formatCast(cast: Cast, locale = "en-GB"): string {
  assertCast(cast);
  return new Intl.NumberFormat(locale).format(cast);
}

/** Platform fee split for a gross creator-earning amount of CAST. */
export function feeSplit(grossCast: Cast, takeRatePct = economy.platformTakeRate): {
  feeCast: Cast;
  netCast: Cast;
} {
  assertCast(grossCast, "grossCast");
  const feeCast = Math.round(grossCast * takeRatePct);
  return { feeCast, netCast: grossCast - feeCast };
}
