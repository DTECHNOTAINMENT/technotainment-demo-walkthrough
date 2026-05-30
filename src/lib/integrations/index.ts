/**
 * Integrations barrel (docs/INTEGRATIONS.md §1). Re-exports every domain's active
 * adapter (resolved mock-or-real per its env key) plus the connector registry and
 * launch gate. App code imports the active adapter from here or the domain index;
 * it NEVER imports a provider SDK directly.
 *
 *   import { video, payments, auth } from "@/lib/integrations";
 */

// Active adapters (one per domain) —
export { video } from "./video";
export { payments } from "./payments";
export { payouts } from "./payouts";
export { auth } from "./auth";
export { identity } from "./identity";
export { email } from "./email";
export { sms } from "./sms";
export { push } from "./push";
export { risk } from "./risk";
export { contentId } from "./contentId";
export { moderation } from "./moderation";
export { tax } from "./tax";
export { flags } from "./flags";
export { storage } from "./storage";
export { queue } from "./queue";
export { analytics } from "./analytics";
export { searchConsole } from "./searchConsole";

// Port interfaces (so app code can type against them) —
export type { VideoProvider, Playback, LiveStream } from "./video";
export type { PaymentProvider, PaymentMethodId, TopupIntent, TransactionResult } from "./payments";
export type { PayoutProvider, PayoutMethodId, PayoutResult } from "./payouts";
export type { AuthProvider, Role, Session, DevUser } from "./auth";
export type { IdentityProvider, Verification, VerificationStatus } from "./identity";
export type { EmailProvider, EmailMessage } from "./email";
export type { SmsProvider } from "./sms";
export type { PushProvider, PushMessage } from "./push";
export type { RiskProvider, RiskLevel, RiskScore } from "./risk";
export type { ContentIdProvider, ContentIdResult, ContentIdScan } from "./contentId";
export type { ModerationProvider, ModerationVerdict, ModerationResult } from "./moderation";
export type { TaxProvider, TaxEstimate } from "./tax";
export type { FlagsProvider, FlagDefault } from "./flags";
export type { StorageProvider } from "./storage";
export type { QueueProvider, QueueMessage, QueueHandler } from "./queue";
export type { AnalyticsProvider } from "./analytics";
export type { SearchConsoleProvider, SearchStats, SearchStatRow } from "./searchConsole";

// Registry + launch gate —
export {
  CONNECTORS,
  getConnector,
  isConnectorConfigured,
  connectorStatus,
} from "./registry";
export type { Connector, ConnectorId, ConnectorCategory, ConnectorStatus } from "./registry";
export {
  assertAllRequiredProvidersConfigured,
  missingRequiredProviders,
} from "./launch-check";
