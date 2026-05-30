/**
 * EmailProvider port — docs/INTEGRATIONS.md §4 ("Email"). Real provider: Resend
 * (SendGrid acceptable behind the same port). Transactional email only.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  /** Plain-text body; html optional. */
  text: string;
  html?: string;
  /** Defaults to EMAIL_FROM when omitted. */
  from?: string;
}

export interface EmailProvider {
  /** Send a transactional email. Returns the provider message id. */
  send(message: EmailMessage): Promise<{ messageId: string; accepted: boolean }>;
}
