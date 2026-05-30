/**
 * Startup hook. The app ALWAYS boots — in dev and prod — running on mocks for any connector
 * that isn't configured yet. We never refuse to start: connectors are added later from the
 * Admin control center (configure, don't code). This just logs a readiness summary so operators
 * can see what's still on a stand-in.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { missingRequiredProviders } = await import("@/lib/integrations");
    const missing = missingRequiredProviders();
    if (missing.length) {
      console.log(
        JSON.stringify({
          level: "info",
          msg: "boot: running with mock providers",
          mockProviders: missing.map((m) => m.id),
          note: "add keys in Admin → connectors to go live per-connector (no redeploy)",
        }),
      );
    }
  } catch {
    /* never block boot */
  }
}
