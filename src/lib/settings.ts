/**
 * Runtime platform settings (configure, don't code — CLAUDE.md §4b). Merges owner edits from
 * the Setting table (Admin → control center: `branding`, `fees`) over the seeded defaults in
 * lib/config, and is read at runtime. Renaming the company or changing the take-rate in Admin
 * takes effect with no deploy. Per-request cached to avoid repeat reads in one render.
 */
import { prisma } from "@/lib/db";
import { branding as brandingDefaults, economy as economyDefaults } from "@/lib/config";

export interface Branding {
  companyName: string;
  appName: string;
  currencyName: string;
  tagline: string;
  defaultTheme: "dark" | "light";
}
export interface Fees {
  castPerGbp: number;
  platformTakeRate: number;
  payoutHoldDays: number;
  payoutRunDay: number;
  minTopUpCast: number;
  minPayoutCast: number;
}
export interface PlatformSettings {
  branding: Branding;
  fees: Fees;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  let rows: { key: string; valueJson: unknown }[] = [];
  try {
    rows = await prisma.setting.findMany({ where: { key: { in: ["branding", "fees"] } } });
  } catch {
    /* DB unavailable → defaults */
  }
  const map = new Map(rows.map((r) => [r.key, r.valueJson as Record<string, unknown>]));
  return {
    branding: { ...brandingDefaults, ...(map.get("branding") ?? {}) } as Branding,
    fees: { ...economyDefaults, ...(map.get("fees") ?? {}) } as Fees,
  };
}

export async function getBranding(): Promise<Branding> {
  return (await getPlatformSettings()).branding;
}

export interface HomeHero {
  /** The live stream pinned as the home hero. Null/empty ⇒ fall back to the top live stream. */
  pinnedStreamId: string | null;
}

/** Default pinned hero = the spec hero (Atlas FC vs Northgate Reserves). */
const homeHeroDefaults: HomeHero = { pinnedStreamId: "str-atlas-1" };

/**
 * Home hero config (Admin → control center, configure-don't-code). The owner pins an editorial
 * hero; when nothing is pinned we fall back to the algorithmic top live stream. No-DB safe.
 */
export async function getHomeHero(): Promise<HomeHero> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "homeHero" } });
    if (row) {
      const v = (row.valueJson ?? {}) as Partial<HomeHero>;
      const pinned = typeof v.pinnedStreamId === "string" ? v.pinnedStreamId.trim() : "";
      return { pinnedStreamId: pinned || null };
    }
  } catch {
    /* DB unavailable → seeded default */
  }
  return homeHeroDefaults;
}
export async function getFees(): Promise<Fees> {
  return (await getPlatformSettings()).fees;
}
