/**
 * FlagsProvider port — docs/INTEGRATIONS.md §4 ("Feature flags"). Real provider:
 * LaunchDarkly/Statsig. Default new flags OFF in prod, ON in preview/dev
 * (docs/DECISIONS.md §3).
 */

export interface FlagsProvider {
  /** Whether a flag is enabled (optionally for a given user/context). */
  isEnabled(key: string, context?: { userId?: string }): Promise<boolean>;
  /** All known flags and their current resolved values. */
  all(context?: { userId?: string }): Promise<Record<string, boolean>>;
}
