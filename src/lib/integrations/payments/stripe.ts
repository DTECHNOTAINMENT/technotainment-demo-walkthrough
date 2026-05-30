/**
 * Real PaymentProvider adapter — Stripe (docs/DECISIONS.md §1; cards, Apple/Google
 * Pay, 3DS). Selected when STRIPE_SECRET_KEY is present. SDK not installed in
 * Phase 0 → throwing stubs.
 *
 * Phase 6 real implementation:
 *   // import Stripe from "stripe";
 *   // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 * createTopupIntent → PaymentIntent; confirm3ds → confirmCardPayment; charge → PaymentIntent (off_session).
 */
import type { PaymentProvider } from "./types";

const NOT_IMPL = "stripe payment adapter not yet implemented — Phase 6";

export const stripePayments: PaymentProvider = {
  async createTopupIntent() {
    throw new Error(NOT_IMPL);
  },
  async confirm3ds() {
    throw new Error(NOT_IMPL);
  },
  async charge() {
    throw new Error(NOT_IMPL);
  },
};
