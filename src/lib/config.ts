/**
 * Runtime config. Per CLAUDE.md §4b ("configure, don't code"), anything the owner
 * might change should ultimately be a DB-backed Admin setting read at runtime.
 * This module holds the *seed defaults* (from docs/DECISIONS.md §2) and reads any
 * env overrides. In later phases the Admin control center persists these in the DB;
 * `getPlatformConfig()` becomes a DB read with this object as the fallback.
 */

export const CAST_PER_GBP = num(process.env.CAST_PER_GBP, 100); // 100 CAST = £1.00
export const PLATFORM_TAKE_RATE = num(process.env.PLATFORM_TAKE_RATE, 0.12); // 12%
export const PAYOUT_HOLD_DAYS = num(process.env.PAYOUT_HOLD_DAYS, 7);
export const PAYOUT_RUN_DAY = num(process.env.PAYOUT_RUN_DAY, 1);

export const LAUNCH_MODE = (process.env.LAUNCH_MODE ?? "dev") as "dev" | "prod";

/** Branding defaults (owner-configurable later via Admin → control center). */
export const branding = {
  companyName: "Technotainment",
  appName: "Metascape",
  currencyName: "CAST",
  tagline: "creator-owned entertainment",
  defaultTheme: "dark" as "dark" | "light",
};

/** Money rules, surfaced as one object so callers never hardcode literals. */
export const economy = {
  castPerGbp: CAST_PER_GBP,
  platformTakeRate: PLATFORM_TAKE_RATE,
  payoutHoldDays: PAYOUT_HOLD_DAYS,
  payoutRunDay: PAYOUT_RUN_DAY,
  minTopUpCast: 100,
  minPayoutCast: 0, // no minimum (DECISIONS §2)
};

function num(v: string | undefined, fallback: number): number {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
