/**
 * Mock FlagsProvider — docs/INTEGRATIONS.md §4. Reads the local FLAG_DEFAULTS and
 * resolves each flag by current environment (dev/preview → on, prod → off for new
 * flags). No LaunchDarkly/Statsig account needed.
 */
import { FLAG_DEFAULTS } from "./defaults";
import type { FlagsProvider } from "./types";

/** Treat anything other than LAUNCH_MODE=prod as a dev/preview environment. */
function isProd(): boolean {
  return process.env.LAUNCH_MODE === "prod";
}

function resolve(key: string): boolean {
  const def = FLAG_DEFAULTS[key];
  if (def == null) return false; // unknown flags default off
  return isProd() ? def.prod : def.dev;
}

export const mockFlags: FlagsProvider = {
  async isEnabled(key) {
    return resolve(key);
  },

  async all() {
    const out: Record<string, boolean> = {};
    for (const key of Object.keys(FLAG_DEFAULTS)) out[key] = resolve(key);
    return out;
  },
};
