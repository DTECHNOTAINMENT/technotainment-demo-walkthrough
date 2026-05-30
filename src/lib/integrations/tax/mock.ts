/**
 * Mock TaxProvider — docs/INTEGRATIONS.md §4. No Avalara account needed:
 * flat 20% estimate (UK VAT-like) so money flows are testable offline.
 */
import type { TaxProvider } from "./types";

/** Flat mock rate — deterministic; real rates come from Avalara per jurisdiction. */
const FLAT_RATE = 0.2;

export const mockTax: TaxProvider = {
  async estimate({ cast, region }) {
    return {
      taxCast: Math.round(cast * FLAT_RATE),
      rate: FLAT_RATE,
      jurisdiction: region,
    };
  },
};
