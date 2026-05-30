/**
 * Mock IdentityProvider — docs/INTEGRATIONS.md §4. No Persona account needed.
 * startVerification returns "pending"; the verification auto-approves after a
 * short delay (a tick), so the async KYC flow is testable offline.
 */
import { mockId } from "../_shared/mockId";
import type { IdentityProvider, VerificationStatus } from "./types";

/** In-memory verification state (per process) — deterministic, no network. */
const verifications = new Map<string, VerificationStatus>();

export const mockIdentity: IdentityProvider = {
  async startVerification({ userId }) {
    const verificationId = mockId("kyc", `start:${userId}`);
    verifications.set(verificationId, "pending");
    // Auto-approve after a tick (mock "delay").
    setTimeout(() => verifications.set(verificationId, "verified"), 0);
    return { verificationId, status: "pending", hostedUrl: "/api/mock/kyc" };
  },

  async getStatus(verificationId) {
    return { verificationId, status: verifications.get(verificationId) ?? "verified" };
  },
};
