/**
 * Payouts resolver (docs/INTEGRATIONS.md §3). Real Stripe Connect adapter only
 * when STRIPE_SECRET_KEY is present; otherwise the deterministic offline mock.
 */
import { mockPayouts } from "./mock";
import { stripePayouts } from "./stripe";

export type { PayoutProvider, PayoutMethodId, PayoutResult, PayoutStatus } from "./types";

export const payouts = process.env.STRIPE_SECRET_KEY ? stripePayouts : mockPayouts;
