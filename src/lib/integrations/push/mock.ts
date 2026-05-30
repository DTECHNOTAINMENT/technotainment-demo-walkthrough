/**
 * Mock PushProvider — docs/INTEGRATIONS.md §4. No FCM account needed: no-op + log.
 */
import { mockId } from "../_shared/mockId";
import type { PushProvider } from "./types";

export const mockPush: PushProvider = {
  async send(message) {
    const messageId = mockId("push", `${message.to}:${message.title}`);
    console.info("[mock:push] →", { messageId, to: message.to, title: message.title });
    return { messageId, delivered: true };
  },
};
