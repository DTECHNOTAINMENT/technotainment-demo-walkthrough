/**
 * Analytics resolver (docs/INTEGRATIONS.md §3). Real PostHog/Segment adapter only
 * when POSTHOG_KEY or SEGMENT_WRITE_KEY is present; otherwise the logging mock.
 */
import { mockAnalytics } from "./mock";
import { posthogAnalytics } from "./posthog";

export type { AnalyticsProvider } from "./types";

export const analytics =
  process.env.POSTHOG_KEY || process.env.SEGMENT_WRITE_KEY ? posthogAnalytics : mockAnalytics;
