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
export async function getFees(): Promise<Fees> {
  return (await getPlatformSettings()).fees;
}
