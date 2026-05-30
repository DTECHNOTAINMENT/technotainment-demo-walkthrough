/**
 * Real AnalyticsProvider adapter — PostHog (docs/DECISIONS.md §1) or Segment
 * (.env.example SEGMENT_WRITE_KEY) behind the same port. Selected when POSTHOG_KEY
 * or SEGMENT_WRITE_KEY is present.
 *
 * Phase 6 real implementation:
 *   // import { PostHog } from "posthog-node";
 *   // capture → client.capture({ distinctId, event, properties }); identify → client.identify.
 */
import type { AnalyticsProvider } from "./types";

const NOT_IMPL = "posthog/segment analytics adapter not yet implemented — Phase 6";

export const posthogAnalytics: AnalyticsProvider = {
  async capture() {
    throw new Error(NOT_IMPL);
  },
  async identify() {
    throw new Error(NOT_IMPL);
  },
};
