/**
 * Real EmailProvider adapter — Resend (docs/DECISIONS.md §1), or SendGrid
 * (.env.example SENDGRID_API_KEY) behind the same port. Selected when
 * RESEND_API_KEY or SENDGRID_API_KEY is present.
 *
 * Phase 6 real implementation:
 *   // import { Resend } from "resend";
 *   // const resend = new Resend(process.env.RESEND_API_KEY);
 *   // resend.emails.send({ from: from ?? process.env.EMAIL_FROM, to, subject, text, html });
 */
import type { EmailProvider } from "./types";

const NOT_IMPL = "resend/sendgrid email adapter not yet implemented — Phase 6";

export const resendEmail: EmailProvider = {
  async send() {
    throw new Error(NOT_IMPL);
  },
};
