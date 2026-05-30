/**
 * PayoutProvider port — docs/INTEGRATIONS.md §4 ("Payouts (out)"),
 * docs/DATA_MODEL.md (Payout, PayoutMethod). Real provider: Stripe Connect
 * (Tipalti/Trolley as the mass-payout alternative behind this same interface).
 */

/** Payout destinations mirror docs/DATA_MODEL.md → PayoutMethod (creator). */
export type PayoutMethodId = "bank" | "instant" | "paypal" | "venmo" | "wise" | "payoneer" | "usdc";

export type PayoutStatus = "pending" | "paid" | "failed";

export interface PayoutResult {
  payoutId: string;
  status: PayoutStatus;
  /** Net CAST sent after platform fee (fee is computed upstream in lib/cast.ts). */
  cast: number;
  method: PayoutMethodId;
}

export interface PayoutProvider {
  /** Initiate a payout to a creator's destination. */
  createPayout(input: {
    creatorId: string;
    cast: number;
    method: PayoutMethodId;
  }): Promise<PayoutResult>;
  /** Poll the current status of a payout. */
  getStatus(payoutId: string): Promise<{ payoutId: string; status: PayoutStatus }>;
}
