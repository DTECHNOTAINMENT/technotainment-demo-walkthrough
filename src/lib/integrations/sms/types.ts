/**
 * SmsProvider port — docs/INTEGRATIONS.md §4 ("SMS / OTP"). Real provider: Twilio.
 * Used for phone OTP and alerts.
 */

export interface SmsProvider {
  /** Send a one-time passcode to a phone number. Returns an opaque challenge id. */
  sendOtp(input: { phone: string }): Promise<{ challengeId: string }>;
  /** Verify a code against a previously issued challenge. */
  verifyOtp(input: { challengeId: string; code: string }): Promise<{ valid: boolean }>;
}
