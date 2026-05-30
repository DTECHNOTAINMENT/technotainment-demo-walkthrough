/**
 * Real FlagsProvider adapter — LaunchDarkly/Statsig (docs/INTEGRATIONS.md §4;
 * .env.example FEATURE_FLAG_PROVIDER selects which). Selected when
 * FEATURE_FLAG_SDK_KEY is present.
 *
 * Phase 6 real implementation:
 *   // init the SDK with FEATURE_FLAG_SDK_KEY; isEnabled → client.variation(key, ctx, false).
 */
import type { FlagsProvider } from "./types";

const NOT_IMPL = "launchdarkly/statsig flags adapter not yet implemented — Phase 6";

export const launchDarklyFlags: FlagsProvider = {
  async isEnabled() {
    throw new Error(NOT_IMPL);
  },
  async all() {
    throw new Error(NOT_IMPL);
  },
};
