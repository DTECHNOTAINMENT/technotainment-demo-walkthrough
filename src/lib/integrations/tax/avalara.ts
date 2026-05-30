/**
 * Real TaxProvider adapter — Avalara (docs/INTEGRATIONS.md §4). Selected when
 * AVALARA_LICENSE_KEY is present (with AVALARA_ACCOUNT_ID).
 *
 * Phase 6 real implementation:
 *   // Avalara AvaTax CreateTransaction → read totalTax, map to integer CAST.
 */
import type { TaxProvider } from "./types";

const NOT_IMPL = "avalara tax adapter not yet implemented — Phase 6";

export const avalaraTax: TaxProvider = {
  async estimate() {
    throw new Error(NOT_IMPL);
  },
};
