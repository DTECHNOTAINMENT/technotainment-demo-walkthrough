/**
 * AnalyticsProvider port — docs/INTEGRATIONS.md §4 ("Analytics"). Real provider:
 * PostHog/Segment. Consent-scoped (docs/DECISIONS.md §3): callers must only send
 * events the user has granted.
 */

export interface AnalyticsProvider {
  /** Track a product event. */
  capture(input: {
    userId?: string;
    event: string;
    properties?: Record<string, string | number | boolean>;
  }): Promise<void>;
  /** Associate traits with a user. */
  identify(input: {
    userId: string;
    traits?: Record<string, string | number | boolean>;
  }): Promise<void>;
}
