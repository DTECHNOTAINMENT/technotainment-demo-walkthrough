/**
 * PushProvider port — docs/INTEGRATIONS.md §4 ("Push"). Real provider: FCM/APNs.
 * Used for go-live alerts and drops.
 */

export interface PushMessage {
  /** Device token or topic to deliver to. */
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushProvider {
  /** Send a push notification. Returns the provider message id. */
  send(message: PushMessage): Promise<{ messageId: string; delivered: boolean }>;
}
