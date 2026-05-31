/**
 * Demo admin data (no-DB mode). Lets the entire Operations console render fully populated with
 * zero backend. Real DB data always wins; these are used only when a Prisma read throws.
 */
import { DEMO_ADMINS } from "@/lib/fixtures";

const now = Date.now();
const ago = (h: number) => new Date(now - h * 3600_000);

export function DEMO_OVERVIEW() {
  return { userCount: 18420, creatorCount: 312, openReports: 6, gmvCast: 4_820_000, pendingPayoutCast: 184_000, liveStreams: 17 };
}

export const DEMO_USERS_ADMIN = [
  { id: "U-48210", handle: "@mira.k", email: "mira@demo.tv", displayName: "Mira K", role: "member", kyc: "none", status: "active", lifetimeSpentCast: 18200, flags: [], createdAt: ago(900) },
  { id: "U-NYX", handle: "@nyxsynth", email: "nyx@demo.tv", displayName: "Nyx Okafor", role: "creator", kyc: "verified", status: "active", lifetimeSpentCast: 0, flags: [], createdAt: ago(2400) },
  { id: "U-SPAM", handle: "@spamzz", email: "spam@x.tv", displayName: "spammer", role: "member", kyc: "none", status: "suspended", lifetimeSpentCast: 0, flags: ["fraud signals"], createdAt: ago(120) },
  { id: "U-KAVI", handle: "@kavikitchen", email: "kavi@demo.tv", displayName: "Kavi Rao", role: "creator", kyc: "verified", status: "active", lifetimeSpentCast: 0, flags: [], createdAt: ago(1800) },
  { id: "U-ATLAS", handle: "@atlasfc", email: "atlas@demo.tv", displayName: "Atlas FC", role: "creator", kyc: "pending", status: "active", lifetimeSpentCast: 0, flags: [], createdAt: ago(700) },
  { id: "U-JOON", handle: "@joondraws", email: "joon@demo.tv", displayName: "Joon", role: "member", kyc: "none", status: "active", lifetimeSpentCast: 4200, flags: [], createdAt: ago(300) },
];

export const DEMO_CREATORS_ADMIN = [
  { id: "nyx", name: "Nyx Okafor", handle: "@nyxsynth", category: "modular synth", followers: 226800, takeRatePct: 12, status: "active", createdAt: ago(2400), user: { handle: "@nyxsynth", kyc: "verified", status: "active" }, channel: { handle: "@nyxsynth" } },
  { id: "kavi", name: "Kavi Rao", handle: "@kavikitchen", category: "cooking", followers: 98400, takeRatePct: 12, status: "active", createdAt: ago(1800), user: { handle: "@kavikitchen", kyc: "verified", status: "active" }, channel: { handle: "@kavikitchen" } },
  { id: "atlas", name: "Atlas FC", handle: "@atlasfc", category: "sports", followers: 512000, takeRatePct: 10, status: "active", createdAt: ago(700), user: { handle: "@atlasfc", kyc: "pending", status: "active" }, channel: { handle: "@atlasfc" } },
  { id: "cr-app1", name: "Nova Reed", handle: "@novareed", category: "music", followers: 1200, takeRatePct: 12, status: "review", createdAt: ago(20), user: { handle: "@novareed", kyc: "pending", status: "active" }, channel: null },
  { id: "cr-app2", name: "Pixel Forge", handle: "@pixelforge", category: "gaming", followers: 3400, takeRatePct: 12, status: "review", createdAt: ago(40), user: { handle: "@pixelforge", kyc: "none", status: "active" }, channel: null },
];

export const DEMO_APPLICATIONS = DEMO_CREATORS_ADMIN.filter((c) => c.status === "review").map((c) => ({
  ...c,
  user: { id: `U-${c.id}`, handle: c.user.handle, email: `${c.handle.replace("@", "")}@demo.tv`, displayName: c.name, kyc: c.user.kyc, status: c.user.status },
}));

export const DEMO_REPORTS = [
  { id: "R-9921", targetType: "stream", targetId: "atlas fc vs northgate", reason: "unlicensed broadcast", reportCount: 12, severity: "high", status: "open", createdAt: ago(3) },
  { id: "R-9922", targetType: "user", targetId: "@spamzz", reason: "spam / scam links", reportCount: 8, severity: "high", status: "open", createdAt: ago(6) },
  { id: "R-9923", targetType: "vod", targetId: "late night q&a", reason: "harassment in chat", reportCount: 3, severity: "medium", status: "investigating", createdAt: ago(20) },
  { id: "R-9924", targetType: "product", targetId: "field recordings vol 4", reason: "misleading description", reportCount: 1, severity: "low", status: "open", createdAt: ago(40) },
  { id: "R-9925", targetType: "clip", targetId: "knife skills", reason: "copyright audio", reportCount: 2, severity: "medium", status: "actioned", createdAt: ago(80) },
];

export const DEMO_ADMIN_TRANSACTIONS = [
  // TXN-2001 (a top-up, +cast) and TXN-2002 (a −800 spend) are referenced by the refund tests:
  // a top-up can't be refunded, a spend can. Keep both ids stable.
  { id: "TXN-2001", userId: "U-48210", channelId: null, kind: "topup", grossFiat: "£40.00", cast: 4000, method: "visa", status: "settled", flag: null, createdAt: ago(2) },
  { id: "TXN-2002", userId: "U-48210", channelId: "ch-nyx", kind: "membership", grossFiat: null, cast: -800, method: "balance", status: "settled", flag: null, createdAt: ago(3) },
  { id: "TXR-9F2A", userId: "U-48210", channelId: "ch-nyx", kind: "membership", grossFiat: null, cast: -800, method: "balance", status: "settled", flag: null, createdAt: ago(2) },
  { id: "TXR-9F2B", userId: "U-48210", channelId: null, kind: "topup", grossFiat: "£50.00", cast: 5000, method: "apple-pay", status: "settled", flag: null, createdAt: ago(3) },
  { id: "TXR-9F2C", userId: "U-JOON", channelId: "ch-atlas", kind: "ppv", grossFiat: null, cast: -300, method: "balance", status: "settled", flag: null, createdAt: ago(5) },
  { id: "TXR-9F2D", userId: "U-JOON", channelId: null, kind: "topup", grossFiat: "£20.00", cast: 2000, method: "visa", status: "settled", flag: "chargeback", createdAt: ago(28) },
  { id: "TXR-9F2E", userId: "U-48210", channelId: "ch-nyx", kind: "tip", grossFiat: null, cast: -250, method: "balance", status: "settled", flag: null, createdAt: ago(30) },
  { id: "TXR-9F2F", userId: "U-48210", channelId: "ch-nyx", kind: "drop", grossFiat: null, cast: -1200, method: "balance", status: "reversed", flag: null, createdAt: ago(52) },
];

export const DEMO_PAYOUT_RUNS = [
  { id: "RUN-2026-05", date: ago(2), creatorCount: 184, cast: 2_400_000, status: "paid", method: "mixed" },
  { id: "RUN-2026-04", date: ago(720), creatorCount: 162, cast: 2_100_000, status: "paid", method: "mixed" },
  { id: "RUN-2026-06", date: ago(0), creatorCount: 12, cast: 184_000, status: "scheduled", method: "mixed" },
];

export const DEMO_HELD_PAYOUTS = [
  { id: "PO-H1", creatorId: "nyx", cast: 96000, feeCast: 0, netFiat: "£960.00", method: "bank", status: "held", date: ago(10), creator: { name: "Nyx Okafor", handle: "@nyxsynth" } },
  { id: "PO-H2", creatorId: "kavi", cast: 48000, feeCast: 0, netFiat: "£480.00", method: "paypal", status: "held", date: ago(12), creator: { name: "Kavi Rao", handle: "@kavikitchen" } },
];

export const DEMO_CONNECTORS = [
  { id: "stripe", name: "Stripe", cat: "payments", status: "off", desc: "card acquiring, 3DS, Connect payouts", events: "—", createdAt: ago(1000) },
  { id: "mux", name: "Mux", cat: "media", status: "off", desc: "live ingest, transcode, VOD", events: "—", createdAt: ago(1000) },
  { id: "clerk", name: "Clerk", cat: "identity", status: "off", desc: "auth + staff SSO/MFA", events: "—", createdAt: ago(1000) },
  { id: "persona", name: "Persona", cat: "identity", status: "off", desc: "KYC / age verification", events: "—", createdAt: ago(1000) },
  { id: "resend", name: "Resend", cat: "comms", status: "off", desc: "transactional email", events: "—", createdAt: ago(1000) },
  { id: "twilio", name: "Twilio", cat: "comms", status: "off", desc: "SMS / OTP", events: "—", createdAt: ago(1000) },
  { id: "sift", name: "Sift", cat: "risk", status: "off", desc: "fraud & chargeback scoring", events: "—", createdAt: ago(1000) },
  { id: "avalara", name: "Avalara", cat: "tax", status: "off", desc: "VAT / sales tax / DAC7", events: "—", createdAt: ago(1000) },
  { id: "s3", name: "S3 / R2", cat: "infra", status: "off", desc: "object storage + CDN", events: "—", createdAt: ago(1000) },
  { id: "posthog", name: "PostHog", cat: "data", status: "off", desc: "product analytics", events: "—", createdAt: ago(1000) },
  { id: "searchConsole", name: "Search Console", cat: "growth", status: "off", desc: "index coverage + queries", events: "—", createdAt: ago(1000) },
];

export const DEMO_API_KEYS = [
  { id: "pk_live", label: "publishable key", scope: "client", value: "pk_live_demo000000", secret: false, lastUsed: "2m ago", createdAt: ago(500) },
  { id: "sk_live", label: "secret key", scope: "server", value: "sk_live_demo000000", secret: true, lastUsed: "2m ago", createdAt: ago(500) },
];

export const DEMO_WEBHOOKS = [
  { id: "wh1", url: "https://api.technotainment.fm/webhooks/payments", events: "payment.*", status: "healthy", delivered: "99.9%", createdAt: ago(500) },
  { id: "wh2", url: "https://api.technotainment.fm/webhooks/media", events: "media.asset.*", status: "healthy", delivered: "100%", createdAt: ago(500) },
];

export const DEMO_FLAGS = [
  { id: "co-watch", label: "co-watch small rooms", on: false, rollout: "0%", desc: "watch parties (LiveKit)", group: "roadmap", createdAt: ago(300) },
  { id: "native-apps", label: "native mobile apps", on: false, rollout: "0%", desc: "iOS/Android (Expo)", group: "roadmap", createdAt: ago(300) },
  { id: "usdc-topup", label: "USDC top-up", on: false, rollout: "0%", desc: "crypto top-ups (Circle)", group: "roadmap", createdAt: ago(300) },
  { id: "referrals", label: "referrals", on: false, rollout: "0%", desc: "referral/affiliate", group: "roadmap", createdAt: ago(300) },
  { id: "live-chat", label: "live chat", on: true, rollout: "100%", desc: "redis-backed live chat", group: "live", createdAt: ago(300) },
  { id: "tips", label: "tips", on: true, rollout: "100%", desc: "send CAST tips", group: "live", createdAt: ago(300) },
  { id: "memberships", label: "memberships", on: true, rollout: "100%", desc: "channel memberships", group: "live", createdAt: ago(300) },
  { id: "drops", label: "drops", on: true, rollout: "100%", desc: "limited product drops", group: "live", createdAt: ago(300) },
];

export const DEMO_AUDIT = [
  { id: "ae1", who: "ops@technotainment.fm", action: "approved creator nyx", kind: "creators", when: ago(1) },
  { id: "ae2", who: "trust@technotainment.fm", action: "strike on report R-9925", kind: "moderation", when: ago(4) },
  { id: "ae3", who: "finance@technotainment.fm", action: "approved payout run RUN-2026-05", kind: "finance", when: ago(48) },
  { id: "ae4", who: "ops@technotainment.fm", action: "flag live-chat → on", kind: "config", when: ago(72) },
  { id: "ae5", who: "ops@technotainment.fm", action: "suspended user @spamzz", kind: "moderation", when: ago(96) },
];

export const DEMO_TEAM = DEMO_ADMINS.map((a) => ({ id: a.id, name: a.name, email: a.email, role: a.role, mfa: a.mfa, createdAt: ago(1000) }));
