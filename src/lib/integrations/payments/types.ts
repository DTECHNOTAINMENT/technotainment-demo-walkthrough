/**
 * PaymentProvider port — docs/INTEGRATIONS.md §4 ("Payments (in)"),
 * docs/DATA_MODEL.md (Transaction, PaymentMethod). Real provider: Stripe (+Adyen later).
 * Money is integer CAST; grossFiat is presentation only. Express methods skip 3DS,
 * card methods require a 3DS challenge (DATA_MODEL.md → PaymentMethod).
 */

/** Payment method ids mirror docs/DATA_MODEL.md → PaymentMethod (top-up). */
export type PaymentMethodId =
  | "apple-pay"
  | "google-pay"
  | "paypal"
  | "venmo"
  | "cashapp"
  | "visa"
  | "mastercard"
  | "amex"
  | "new-card"
  | "sepa"
  | "ach"
  | "faster"
  | "ideal"
  | "paypal-bal"
  | "klarna"
  | "usdc";

export type TransactionStatus = "pending" | "settled" | "reversed";

export interface TopupIntent {
  transactionId: string;
  /** True when the method requires a 3DS challenge before settling. */
  needs3ds: boolean;
  /** Opaque challenge token to pass back to confirm3ds (present iff needs3ds). */
  clientSecret?: string;
}

export interface TransactionResult {
  transactionId: string;
  status: TransactionStatus;
  cast: number;
}

export interface PaymentProvider {
  /** Begin a wallet top-up; returns whether a 3DS challenge is required. */
  createTopupIntent(input: {
    userId: string;
    methodId: PaymentMethodId;
    cast: number;
  }): Promise<TopupIntent>;
  /** Complete a 3DS challenge for a previously created intent. */
  confirm3ds(input: { transactionId: string; challengeCode?: string }): Promise<TransactionResult>;
  /** Charge directly for express methods that need no challenge (tips, drops, ppv). */
  charge(input: {
    userId: string;
    methodId: PaymentMethodId;
    cast: number;
  }): Promise<TransactionResult>;
}
