/**
 * SMS resolver (docs/INTEGRATIONS.md §3). Real Twilio adapter only when
 * TWILIO_AUTH_TOKEN is present; otherwise the offline mock (OTP "000000").
 */
import { mockSms } from "./mock";
import { twilioSms } from "./twilio";

export type { SmsProvider } from "./types";

export const sms = process.env.TWILIO_AUTH_TOKEN ? twilioSms : mockSms;
