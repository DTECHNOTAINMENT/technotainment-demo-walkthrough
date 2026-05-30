/**
 * Mock RiskProvider — docs/INTEGRATIONS.md §4. No Sift account needed:
 * always returns "low" risk so flows proceed offline.
 */
import type { RiskProvider } from "./types";

export const mockRisk: RiskProvider = {
  async score() {
    return { level: "low", score: 1, reasons: [] };
  },
};
