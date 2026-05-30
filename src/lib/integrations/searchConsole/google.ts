/**
 * Real SearchConsoleProvider adapter — Google Search Console API
 * (docs/INTEGRATIONS.md §4). Selected when GOOGLE_SEARCH_CONSOLE_KEY is present.
 *
 * Phase 6 real implementation:
 *   // searchconsole.searchanalytics.query with a service-account JWT,
 *   // map rows (query/clicks/impressions/ctr/position) → SearchStats.
 */
import type { SearchConsoleProvider } from "./types";

const NOT_IMPL = "google search console adapter not yet implemented — Phase 6";

export const googleSearchConsole: SearchConsoleProvider = {
  async getStats() {
    throw new Error(NOT_IMPL);
  },
};
