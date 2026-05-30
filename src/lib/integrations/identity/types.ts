/**
 * IdentityProvider port — docs/INTEGRATIONS.md §4 ("KYC / identity"),
 * docs/DATA_MODEL.md (User.kyc). Real provider: Persona. KYC is required before a
 * creator's first payout (docs/DECISIONS.md §2).
 */

/** Mirrors docs/DATA_MODEL.md → User.kyc. */
export type VerificationStatus = "none" | "pending" | "verified" | "failed";

export interface Verification {
  verificationId: string;
  status: VerificationStatus;
  /** Provider-hosted flow URL the user is sent to (mock returns a local stub). */
  hostedUrl: string;
}

export interface IdentityProvider {
  /** Begin a KYC/age verification for a user. */
  startVerification(input: { userId: string }): Promise<Verification>;
  /** Poll the current status of a verification. */
  getStatus(verificationId: string): Promise<{ verificationId: string; status: VerificationStatus }>;
}
