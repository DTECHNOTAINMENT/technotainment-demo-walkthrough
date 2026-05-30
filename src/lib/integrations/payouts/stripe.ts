/**
 * Real PayoutProvider adapter — Stripe Connect (docs/INTEGRATIONS.md §4,
 * docs/DECISIONS.md §1). Selected when STRIPE_SECRET_KEY is present.
 *
 * Alternative mass-payout providers (Tipalti / Trolley — see .env.example
 * TIPALTI_API_KEY / TROLLEY_*) implement this SAME PayoutProvider port; swap the
 * adapter here without touching app code.
 *
 * Phase 6 real implementation:
 *   // import Stripe from "stripe";
 *   // createPayout → stripe.transfers.create / payouts.create to the connected account.
 */
import type { PayoutProvider } from "./types";

const NOT_IMPL = "stripe connect payout adapter not yet implemented — Phase 6";

export const stripePayouts: PayoutProvider = {
  async createPayout() {
    throw new Error(NOT_IMPL);
  },
  async getStatus() {
    throw new Error(NOT_IMPL);
  },
};
