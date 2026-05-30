/**
 * Top-up method catalogue for the client UI. Mirrors prototype/v4/payments.jsx
 * (TOPUP_METHODS / TOPUP_GROUPS) but typed against the real PaymentMethodId union.
 * Cards (visa | mastercard | amex | new-card) need a 3DS challenge; everything else
 * is express and settles straight through. Display only — the server is the source of truth.
 */
import type { PaymentMethodId } from "@/lib/integrations";

export type TopupGroupId = "express" | "card" | "bank" | "wallet" | "later" | "crypto";

export interface TopupMethod {
  id: PaymentMethodId;
  label: string;
  group: TopupGroupId;
  sub?: string;
  instant?: boolean;
  needs3ds?: boolean;
}

export const CARD_METHODS: ReadonlySet<PaymentMethodId> = new Set<PaymentMethodId>([
  "visa",
  "mastercard",
  "amex",
  "new-card",
]);

export const TOPUP_GROUPS: { id: TopupGroupId; label: string }[] = [
  { id: "express", label: "express checkout" },
  { id: "card", label: "cards" },
  { id: "bank", label: "bank & local" },
  { id: "wallet", label: "wallets" },
  { id: "later", label: "pay later" },
  { id: "crypto", label: "crypto" },
];

export const TOPUP_METHODS: TopupMethod[] = [
  { id: "apple-pay", label: "apple pay", group: "express", instant: true, sub: "touch id / face id" },
  { id: "google-pay", label: "google pay", group: "express", instant: true, sub: "1-tap checkout" },
  { id: "paypal", label: "paypal", group: "express", instant: true, sub: "redirect & approve" },
  { id: "venmo", label: "venmo", group: "express", instant: true, sub: "us only" },
  { id: "cashapp", label: "cash app pay", group: "express", instant: true, sub: "us only" },

  { id: "visa", label: "visa", group: "card", sub: "debit / credit", needs3ds: true },
  { id: "mastercard", label: "mastercard", group: "card", sub: "debit / credit", needs3ds: true },
  { id: "amex", label: "amex", group: "card", sub: "debit / credit", needs3ds: true },
  { id: "new-card", label: "add a new card", group: "card", sub: "enter card details", needs3ds: true },

  { id: "sepa", label: "sepa direct debit", group: "bank", sub: "eur" },
  { id: "ach", label: "us bank · ach", group: "bank", sub: "usd" },
  { id: "faster", label: "faster payments", group: "bank", sub: "uk · gbp" },
  { id: "ideal", label: "ideal", group: "bank", sub: "netherlands" },

  { id: "paypal-bal", label: "paypal balance", group: "wallet", sub: "use your paypal funds" },

  { id: "klarna", label: "klarna", group: "later", sub: "pay in 3 · 0% interest" },

  { id: "usdc", label: "usdc", group: "crypto", sub: "on-chain · base / polygon" },
];

export function methodById(id: PaymentMethodId): TopupMethod {
  return TOPUP_METHODS.find((m) => m.id === id) ?? TOPUP_METHODS[0];
}
