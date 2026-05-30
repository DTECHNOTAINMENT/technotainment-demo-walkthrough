/**
 * Mock AuthProvider — docs/INTEGRATIONS.md §4. Local dev users + role switching,
 * no Clerk account needed. State is in-memory (per process); deterministic.
 */
import type { AuthProvider, DevUser, Session } from "./types";

/** Seeded dev users — one per role (member/creator/staff). */
const DEV_USERS: DevUser[] = [
  {
    userId: "mock_user_member",
    handle: "@ava.fan",
    displayName: "Ava (member)",
    email: "ava@example.test",
    role: "member",
  },
  {
    userId: "mock_user_creator",
    handle: "@nyxsynth",
    displayName: "Nyx (creator)",
    email: "nyx@example.test",
    role: "creator",
  },
  {
    userId: "mock_user_staff",
    handle: "@staff.admin",
    displayName: "Sam (staff)",
    email: "sam@example.test",
    role: "staff",
  },
];

function toSession(u: DevUser): Session {
  return {
    userId: u.userId,
    handle: u.handle,
    displayName: u.displayName,
    email: u.email,
    role: u.role,
  };
}

/** Active session — defaults to the seeded member so the app boots signed-in. */
let activeSession: Session = toSession(DEV_USERS[0]);

export const mockAuth: AuthProvider = {
  async getSession() {
    return activeSession;
  },

  async listDevUsers() {
    return DEV_USERS.map((u) => ({ ...u }));
  },

  async switchRole({ userId, role }): Promise<Session> {
    const base = DEV_USERS.find((u) => u.userId === userId) ?? DEV_USERS[0];
    const next: Session = { ...toSession(base), role };
    activeSession = next;
    return next;
  },
};
