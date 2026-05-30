/**
 * AuthProvider port — docs/INTEGRATIONS.md §4 ("Auth"). Real provider: Clerk
 * (docs/DECISIONS.md §1; WorkOS/Auth0 acceptable behind the same port).
 * Roles align with the app's RBAC: member, creator, staff.
 */

export type Role = "member" | "creator" | "staff";

export interface Session {
  userId: string;
  handle: string;
  displayName: string;
  email: string;
  role: Role;
}

export interface DevUser {
  userId: string;
  handle: string;
  displayName: string;
  email: string;
  role: Role;
}

export interface AuthProvider {
  /** Current session, or null when signed out. */
  getSession(): Promise<Session | null>;
  /** Dev-only: the seeded users available for one-click sign-in / role switching. */
  listDevUsers(): Promise<DevUser[]>;
  /** Switch the active session's role (dev affordance / staff impersonation). */
  switchRole(input: { userId: string; role: Role }): Promise<Session>;
}
