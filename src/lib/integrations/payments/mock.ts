/**
 * Mock PaymentProvider — docs/INTEGRATIONS.md §4. No Stripe account needed.
 * Express methods settle instantly; card methods return a 3DS challenge that
 * confirm3ds always accepts. Deterministic ids ("mock_txn_...").
 */
import { mockId } from "../_shared/mockId";
import type { PaymentMethodId, PaymentProvider, TransactionResult } from "./types";

/** Card methods need a 3DS step; everything else is express (DATA_MODEL.md). */
const CARD_METHODS = new Set<PaymentMethodId>(["visa", "mastercard", "amex", "new-card"]);

function needs3ds(methodId: PaymentMethodId): boolean {
  return CARD_METHODS.has(methodId);
}

export const mockPayments: PaymentProvider = {
  async createTopupIntent({ userId, methodId, cast }) {
    const transactionId = mockId("txn", `topup:${userId}:${methodId}:${cast}`);
    if (needs3ds(methodId)) {
      return {
        transactionId,
        needs3ds: true,
        clientSecret: mockId("3ds", transactionId),
      };
    }
    return { transactionId, needs3ds: false };
  },

  async confirm3ds({ transactionId }): Promise<TransactionResult> {
    // Mock always accepts the challenge and settles instantly.
    return { transactionId, status: "settled", cast: 0 };
  },

  async charge({ userId, methodId, cast }): Promise<TransactionResult> {
    return {
      transactionId: mockId("txn", `charge:${userId}:${methodId}:${cast}`),
      status: "settled",
      cast,
    };
  },
};
