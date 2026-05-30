/**
 * Mock EmailProvider — docs/INTEGRATIONS.md §4. Logs to console (a "dev inbox")
 * instead of sending; no Resend/SendGrid account needed.
 */
import { mockId } from "../_shared/mockId";
import type { EmailProvider } from "./types";

export const mockEmail: EmailProvider = {
  async send(message) {
    const messageId = mockId("email", `${message.to}:${message.subject}`);
    // Dev inbox: surface the email so flows are testable offline.
    console.info("[mock:email] →", {
      messageId,
      to: message.to,
      subject: message.subject,
      preview: message.text.slice(0, 120),
    });
    return { messageId, accepted: true };
  },
};
