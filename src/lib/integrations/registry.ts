/**
 * Connector registry — the single source of truth for /admin/connectors
 * (docs/DATA_MODEL.md → Connector; docs/INTEGRATIONS.md §4/§5). Each connector
 * declares its category, whether it's required for launch, and the ONE env var
 * that flips it from mock → live. `connectorStatus()` reports mock | live | error
 * by inspecting whether that env var is set.
 *
 * Categories (docs/DATA_MODEL.md): payments, identity, risk, media, comms, tax,
 * data, growth, trust, infra.
 */

export type ConnectorCategory =
  | "payments"
  | "identity"
  | "risk"
  | "media"
  | "comms"
  | "tax"
  | "data"
  | "growth"
  | "trust"
  | "infra";

export type ConnectorId =
  | "video"
  | "payments"
  | "payouts"
  | "auth"
  | "identity"
  | "email"
  | "sms"
  | "push"
  | "risk"
  | "contentId"
  | "moderation"
  | "tax"
  | "flags"
  | "storage"
  | "queue"
  | "analytics"
  | "searchConsole";

export type ConnectorStatus = "mock" | "live" | "error";

export interface Connector {
  id: ConnectorId;
  name: string;
  category: ConnectorCategory;
  requiredForLaunch: boolean;
  /** The env var(s) whose presence selects the real adapter. */
  envKey: string;
  /** Alternative env keys that also enable the real adapter (OR semantics). */
  altEnvKeys?: string[];
}

/**
 * Required-for-launch flags follow docs/INTEGRATIONS.md §4. Env keys match the
 * resolver in each domain's index.ts and the names in .env.example.
 */
export const CONNECTORS: readonly Connector[] = [
  { id: "video", name: "Video / live (Mux)", category: "media", requiredForLaunch: true, envKey: "MUX_TOKEN_ID" },
  { id: "payments", name: "Payments — in (Stripe)", category: "payments", requiredForLaunch: true, envKey: "STRIPE_SECRET_KEY" },
  { id: "payouts", name: "Payouts — out (Stripe Connect)", category: "payments", requiredForLaunch: true, envKey: "STRIPE_SECRET_KEY" },
  { id: "auth", name: "Auth (Clerk)", category: "identity", requiredForLaunch: true, envKey: "CLERK_SECRET_KEY", altEnvKeys: ["AUTH_CLIENT_SECRET"] },
  { id: "identity", name: "KYC / identity (Persona)", category: "identity", requiredForLaunch: true, envKey: "PERSONA_API_KEY" },
  { id: "email", name: "Email (Resend)", category: "comms", requiredForLaunch: true, envKey: "RESEND_API_KEY", altEnvKeys: ["SENDGRID_API_KEY"] },
  { id: "sms", name: "SMS / OTP (Twilio)", category: "comms", requiredForLaunch: true, envKey: "TWILIO_AUTH_TOKEN" },
  { id: "tax", name: "Tax (Avalara)", category: "tax", requiredForLaunch: true, envKey: "AVALARA_LICENSE_KEY" },
  { id: "storage", name: "CDN / storage (S3 / R2)", category: "infra", requiredForLaunch: true, envKey: "STORAGE_ACCESS_KEY_ID" },
  // Recommended / post-launch (not gating go-live) —
  { id: "push", name: "Push (FCM / APNs)", category: "comms", requiredForLaunch: false, envKey: "FCM_SERVER_KEY" },
  { id: "risk", name: "Risk / fraud (Sift)", category: "risk", requiredForLaunch: false, envKey: "SIFT_API_KEY" },
  { id: "contentId", name: "Content-ID (Audible Magic)", category: "trust", requiredForLaunch: false, envKey: "AUDIBLE_MAGIC_API_KEY" },
  { id: "moderation", name: "Moderation AI (Hive / OpenAI)", category: "trust", requiredForLaunch: false, envKey: "HIVE_API_KEY", altEnvKeys: ["OPENAI_API_KEY"] },
  { id: "flags", name: "Feature flags (LaunchDarkly / Statsig)", category: "data", requiredForLaunch: false, envKey: "FEATURE_FLAG_SDK_KEY" },
  { id: "queue", name: "Async queue (AWS SQS)", category: "infra", requiredForLaunch: false, envKey: "AWS_SQS_QUEUE_URL" },
  { id: "analytics", name: "Analytics (PostHog / Segment)", category: "data", requiredForLaunch: false, envKey: "POSTHOG_KEY", altEnvKeys: ["SEGMENT_WRITE_KEY"] },
  { id: "searchConsole", name: "Search Console / SEO (Google)", category: "growth", requiredForLaunch: false, envKey: "GOOGLE_SEARCH_CONSOLE_KEY" },
] as const;

/** Look up a connector by id. */
export function getConnector(id: ConnectorId): Connector | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

/** True when any of the connector's env keys is set to a non-empty value. */
export function isConnectorConfigured(connector: Connector): boolean {
  const keys = [connector.envKey, ...(connector.altEnvKeys ?? [])];
  return keys.some((k) => {
    const v = process.env[k];
    return v != null && v !== "";
  });
}

/**
 * Live status for /admin/connectors: "live" when its env key is present, else
 * "mock". Returns "error" when the id is unknown (defensive — shouldn't happen).
 */
export function connectorStatus(id: ConnectorId): ConnectorStatus {
  const connector = getConnector(id);
  if (!connector) return "error";
  return isConnectorConfigured(connector) ? "live" : "mock";
}
