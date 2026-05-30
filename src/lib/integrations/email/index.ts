/**
 * Email resolver (docs/INTEGRATIONS.md §3). Real Resend/SendGrid adapter only when
 * RESEND_API_KEY or SENDGRID_API_KEY is present; otherwise the console-logging mock.
 */
import { mockEmail } from "./mock";
import { resendEmail } from "./resend";

export type { EmailProvider, EmailMessage } from "./types";

export const email =
  process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY ? resendEmail : mockEmail;
