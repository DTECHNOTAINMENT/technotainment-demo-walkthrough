/**
 * Mock SearchConsoleProvider — docs/INTEGRATIONS.md §4. No Google account needed:
 * returns a fixed, realistic sample so /admin/growth renders offline. Deterministic.
 */
import type { SearchConsoleProvider, SearchStatRow } from "./types";

const SAMPLE_ROWS: SearchStatRow[] = [
  { query: "modular synth live", clicks: 1240, impressions: 38200, ctr: 0.0325, position: 4.2 },
  { query: "technotainment", clicks: 980, impressions: 12100, ctr: 0.081, position: 1.6 },
  { query: "nyx okafor patch", clicks: 410, impressions: 9300, ctr: 0.0441, position: 6.1 },
  { query: "techno live stream", clicks: 320, impressions: 27400, ctr: 0.0117, position: 11.3 },
  { query: "buy cast credits", clicks: 150, impressions: 4200, ctr: 0.0357, position: 3.9 },
];

export const mockSearchConsole: SearchConsoleProvider = {
  async getStats(input) {
    const totalClicks = SAMPLE_ROWS.reduce((s, r) => s + r.clicks, 0);
    const totalImpr = SAMPLE_ROWS.reduce((s, r) => s + r.impressions, 0);
    return {
      rangeStart: input?.startDate ?? "2026-04-30",
      rangeEnd: input?.endDate ?? "2026-05-30",
      totals: {
        clicks: totalClicks,
        impressions: totalImpr,
        ctr: totalImpr === 0 ? 0 : totalClicks / totalImpr,
        position: 5.4,
      },
      rows: SAMPLE_ROWS.map((r) => ({ ...r })),
    };
  },
};
