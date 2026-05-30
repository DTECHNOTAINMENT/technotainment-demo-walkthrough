/**
 * Real SmsProvider adapter — Twilio (docs/DECISIONS.md §1). Selected when
 * TWILIO_AUTH_TOKEN is present (with TWILIO_ACCOUNT_SID).
 *
 * Phase 6 real implementation:
 *   // import twilio from "twilio";
 *   // sendOtp → Twilio Verify start; verifyOtp → Twilio Verify check.
 */
import type { SmsProvider } from "./types";

const NOT_IMPL = "twilio sms adapter not yet implemented — Phase 6";

export const twilioSms: SmsProvider = {
  async sendOtp() {
    throw new Error(NOT_IMPL);
  },
  async verifyOtp() {
    throw new Error(NOT_IMPL);
  },
};
