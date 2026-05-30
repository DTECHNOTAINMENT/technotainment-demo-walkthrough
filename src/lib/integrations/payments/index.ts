/**
 * Payments resolver (docs/INTEGRATIONS.md §3). Real Stripe adapter only when
 * STRIPE_SECRET_KEY is present; otherwise the deterministic offline mock.
 */
import { mockPayments } from "./mock";
import { stripePayments } from "./stripe";

export type {
  PaymentProvider,
  PaymentMethodId,
  TopupIntent,
  TransactionResult,
  TransactionStatus,
} from "./types";

export const payments = process.env.STRIPE_SECRET_KEY ? stripePayments : mockPayments;
