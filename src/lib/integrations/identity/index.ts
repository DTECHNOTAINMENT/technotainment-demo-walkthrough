/**
 * Identity resolver (docs/INTEGRATIONS.md §3). Real Persona adapter only when
 * PERSONA_API_KEY is present; otherwise the auto-approving offline mock.
 */
import { mockIdentity } from "./mock";
import { personaIdentity } from "./persona";

export type { IdentityProvider, Verification, VerificationStatus } from "./types";

export const identity = process.env.PERSONA_API_KEY ? personaIdentity : mockIdentity;
