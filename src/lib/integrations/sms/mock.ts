/**
 * Mock SmsProvider — docs/INTEGRATIONS.md §4. No Twilio account needed.
 * The OTP is always "000000" in dev; verifyOtp accepts only that code.
 */
import { mockId } from "../_shared/mockId";
import type { SmsProvider } from "./types";

/** Fixed dev OTP (docs/INTEGRATIONS.md §4 — "OTP always 000000 in dev"). */
export const MOCK_OTP = "000000";

export const mockSms: SmsProvider = {
  async sendOtp({ phone }) {
    const challengeId = mockId("otp", `${phone}`);
    console.info("[mock:sms] OTP for", phone, "is", MOCK_OTP);
    return { challengeId };
  },

  async verifyOtp({ code }) {
    return { valid: code === MOCK_OTP };
  },
};
