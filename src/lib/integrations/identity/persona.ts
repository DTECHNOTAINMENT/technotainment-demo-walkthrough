/**
 * Real IdentityProvider adapter — Persona (docs/INTEGRATIONS.md §4). Selected
 * when PERSONA_API_KEY is present (PERSONA_TEMPLATE_ID selects the inquiry flow).
 *
 * Phase 6 real implementation:
 *   // POST https://withpersona.com/api/v1/inquiries with PERSONA_API_KEY,
 *   // map inquiry status (completed/approved/declined) → VerificationStatus,
 *   // confirm via the identity.verified webhook (docs/DATA_MODEL.md webhooks).
 */
import type { IdentityProvider } from "./types";

const NOT_IMPL = "persona identity adapter not yet implemented — Phase 6";

export const personaIdentity: IdentityProvider = {
  async startVerification() {
    throw new Error(NOT_IMPL);
  },
  async getStatus() {
    throw new Error(NOT_IMPL);
  },
};
