/**
 * Real RiskProvider adapter — Sift (docs/INTEGRATIONS.md §4). Selected when
 * SIFT_API_KEY is present.
 *
 * Phase 6 real implementation:
 *   // POST events to Sift's Events API, read the Score API → map to RiskLevel.
 */
import type { RiskProvider } from "./types";

const NOT_IMPL = "sift risk adapter not yet implemented — Phase 6";

export const siftRisk: RiskProvider = {
  async score() {
    throw new Error(NOT_IMPL);
  },
};
