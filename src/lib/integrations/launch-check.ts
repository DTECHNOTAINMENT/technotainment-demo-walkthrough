/**
 * Launch gate — docs/INTEGRATIONS.md §3. In dev/preview everything may be a mock
 * and the app always boots. When LAUNCH_MODE=prod, every connector marked
 * requiredForLaunch must have its real env key, or we refuse to start.
 *
 * This exports a FUNCTION; it is NOT run at import time. Server startup calls
 * assertAllRequiredProvidersConfigured() (see docs/INTEGRATIONS.md §3 sketch).
 */
import { CONNECTORS, isConnectorConfigured, type Connector } from "./registry";

/** Connectors that are required for launch but currently lack their env keys. */
export function missingRequiredProviders(): Connector[] {
  return CONNECTORS.filter((c) => c.requiredForLaunch && !isConnectorConfigured(c));
}

/**
 * Throws if LAUNCH_MODE=prod and any required connector is unconfigured.
 * No-op in dev/preview. Call from server startup, not at import time.
 */
export function assertAllRequiredProvidersConfigured(): void {
  if (process.env.LAUNCH_MODE !== "prod") return; // dev/preview: mocks are fine

  const missing = missingRequiredProviders();
  if (missing.length === 0) return;

  const details = missing.map((c) => `  - ${c.name} (set ${c.envKey})`).join("\n");
  throw new Error(
    `LAUNCH_MODE=prod but ${missing.length} required provider(s) are not configured:\n${details}\n` +
      `Supply the env keys above or unset LAUNCH_MODE to run on mocks. See docs/INTEGRATIONS.md §4.`,
  );
}
