/**
 * Auth resolver (docs/INTEGRATIONS.md §3). Real Clerk adapter only when
 * CLERK_SECRET_KEY (or AUTH_CLIENT_SECRET) is present; otherwise the offline mock
 * with local dev users + role switching.
 */
import { clerkAuth } from "./clerk";
import { mockAuth } from "./mock";

export type { AuthProvider, Role, Session, DevUser } from "./types";

export const auth =
  process.env.CLERK_SECRET_KEY || process.env.AUTH_CLIENT_SECRET ? clerkAuth : mockAuth;
