/**
 * TaxProvider port — docs/INTEGRATIONS.md §4 ("Tax"). Real provider: Avalara
 * (VAT/sales tax + 1099-K / DAC7). Money is integer CAST (docs/DATA_MODEL.md).
 */

export interface TaxEstimate {
  /** Tax amount in integer CAST. */
  taxCast: number;
  /** Effective rate applied (e.g. 0.2 for 20% VAT). */
  rate: number;
  jurisdiction: string;
}

export interface TaxProvider {
  /** Estimate tax for a transaction in a region. */
  estimate(input: {
    cast: number;
    region: string; // ISO country/region, e.g. "GB", "DE"
    category?: "digital" | "merch";
  }): Promise<TaxEstimate>;
}
