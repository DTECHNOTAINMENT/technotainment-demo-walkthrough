import { NextResponse } from "next/server";
import { CONNECTORS, connectorStatus, missingRequiredProviders } from "@/lib/integrations";
import { LAUNCH_MODE } from "@/lib/config";

/**
 * Launch-readiness probe (Phase 6). Reports per-connector status (mock | live | error) and,
 * in prod, whether every required provider is configured. Distinct from /api/health (liveness):
 * this is the go-live checklist surfaced as JSON for the owner + the Admin → connectors view.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const connectors = CONNECTORS.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    requiredForLaunch: c.requiredForLaunch,
    status: connectorStatus(c.id),
  }));
  const missing = missingRequiredProviders();
  const ready = LAUNCH_MODE !== "prod" ? true : missing.length === 0;

  return NextResponse.json({
    launchMode: LAUNCH_MODE,
    ready,
    missingRequired: missing,
    connectors,
  });
}
