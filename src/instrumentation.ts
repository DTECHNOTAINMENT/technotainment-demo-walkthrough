/**
 * Startup hook (Phase 6). In production (LAUNCH_MODE=prod) this refuses to boot unless every
 * launch-required provider has real keys (docs/INTEGRATIONS.md §3). In dev/preview it's a no-op,
 * so the app always runs on mocks. Wired via next.config `experimental.instrumentationHook`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertAllRequiredProvidersConfigured } = await import("@/lib/integrations");
    assertAllRequiredProvidersConfigured(); // throws in prod when required keys are missing
  }
}
