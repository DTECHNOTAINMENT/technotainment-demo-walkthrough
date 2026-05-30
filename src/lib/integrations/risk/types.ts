/**
 * RiskProvider port — docs/INTEGRATIONS.md §4 ("Risk / fraud"). Real provider: Sift.
 * Scores payments/accounts for fraud & chargeback risk.
 */

export type RiskLevel = "low" | "medium" | "high";

export interface RiskScore {
  level: RiskLevel;
  /** 0–100; higher = riskier. */
  score: number;
  reasons: string[];
}

export interface RiskProvider {
  /** Score an event (e.g. a top-up, signup) for fraud risk. */
  score(input: {
    userId: string;
    event: "topup" | "signup" | "payout" | "purchase";
    context?: Record<string, string | number>;
  }): Promise<RiskScore>;
}
