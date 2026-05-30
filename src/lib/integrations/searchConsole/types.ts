/**
 * SearchConsoleProvider port — docs/INTEGRATIONS.md §4 ("Search Console / SEO").
 * Real provider: Google Search Console API. Powers /admin/growth (DATA_MODEL.md).
 */

export interface SearchStatRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0–1
  position: number;
}

export interface SearchStats {
  rangeStart: string; // ISO date
  rangeEnd: string; // ISO date
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  rows: SearchStatRow[];
}

export interface SearchConsoleProvider {
  /** Aggregate search performance for a date range. */
  getStats(input?: { startDate?: string; endDate?: string }): Promise<SearchStats>;
}
