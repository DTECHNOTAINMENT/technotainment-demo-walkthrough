/**
 * Mock AnalyticsProvider — docs/INTEGRATIONS.md §4. No PostHog/Segment account
 * needed: logs events to the console so flows are observable offline.
 */
import type { AnalyticsProvider } from "./types";

export const mockAnalytics: AnalyticsProvider = {
  async capture({ userId, event, properties }) {
    console.info("[mock:analytics] capture", { userId, event, properties });
  },

  async identify({ userId, traits }) {
    console.info("[mock:analytics] identify", { userId, traits });
  },
};
