/**
 * Real AuthProvider adapter — Clerk (docs/DECISIONS.md §1). Selected when
 * CLERK_SECRET_KEY (or AUTH_CLIENT_SECRET for WorkOS/Auth0) is present.
 *
 * Phase 6 real implementation:
 *   // import { auth, clerkClient } from "@clerk/nextjs/server";
 * getSession → auth() + user lookup; listDevUsers is dev-only (returns []);
 * switchRole → update publicMetadata.role (staff impersonation is audited).
 */
import type { AuthProvider } from "./types";

const NOT_IMPL = "clerk auth adapter not yet implemented — Phase 6";

export const clerkAuth: AuthProvider = {
  async getSession() {
    throw new Error(NOT_IMPL);
  },
  async listDevUsers() {
    // No dev users in a real auth provider.
    return [];
  },
  async switchRole() {
    throw new Error(NOT_IMPL);
  },
};
