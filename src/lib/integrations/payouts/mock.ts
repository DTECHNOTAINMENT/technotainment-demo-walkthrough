/**
 * Mock PayoutProvider — docs/INTEGRATIONS.md §4. No Stripe Connect account needed.
 * createPayout returns "pending"; the payout flips to "paid" after a tick
 * (next event-loop turn), so the async clearing flow is testable offline.
 */
import { mockId } from "../_shared/mockId";
import type { PayoutProvider, PayoutResult, PayoutStatus } from "./types";

/** In-memory payout state (per process) — deterministic, no DB/network. */
const payouts = new Map<string, PayoutStatus>();

export const mockPayouts: PayoutProvider = {
  async createPayout({ creatorId, cast, method }): Promise<PayoutResult> {
    const payoutId = mockId("payout", `${creatorId}:${cast}:${method}`);
    payouts.set(payoutId, "pending");
    // Flip to paid after a tick to simulate provider settlement.
    setTimeout(() => payouts.set(payoutId, "paid"), 0);
    return { payoutId, status: "pending", cast, method };
  },

  async getStatus(payoutId) {
    return { payoutId, status: payouts.get(payoutId) ?? "paid" };
  },
};
