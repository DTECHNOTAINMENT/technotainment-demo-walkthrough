import { NextResponse } from "next/server";
import { CONNECTORS } from "@/lib/integrations";
import { connectorRuntimeStatus } from "@/lib/connectors";
import { LAUNCH_MODE } from "@/lib/config";

/**
 * Launch-readiness checklist (informational — never blocks the app). Reports each connector's
 * runtime status (live | mock), considering Admin-panel config + env. The owner uses this to see
 * what's still on a stand-in; the app runs regardless. Distinct from /api/health (liveness).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const connectors = await Promise.all(
    CONNECTORS.map(async (c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      requiredForLaunch: c.requiredForLaunch,
      status: await connectorRuntimeStatus(c.id),
    })),
  );
  const missingRequired = connectors.filter((c) => c.requiredForLaunch && c.status === "mock").map((c) => c.id);

  return NextResponse.json({
    launchMode: LAUNCH_MODE,
    // The app always runs; "fullyLive" just means every required connector is configured.
    fullyLive: missingRequired.length === 0,
    liveCount: connectors.filter((c) => c.status === "live").length,
    total: connectors.length,
    missingRequired,
    connectors,
  });
}
