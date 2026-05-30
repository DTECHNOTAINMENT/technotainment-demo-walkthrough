/**
 * Runtime connector configuration — the "configure, don't code" backbone for integrations
 * (CLAUDE.md §4b). Connector credentials are stored in the DB (via the Setting table, key
 * `connector:<id>`) and managed from Admin → connectors. The app reads them at runtime, so an
 * owner switches a connector from mock → live by pasting keys in the panel — no env var, no deploy.
 *
 * Resolution order for "is this connector live?":
 *   1. DB config (Admin) — enabled AND all required credentials present  → live
 *   2. env var fallback (still supported for infra-as-code / CI)         → live
 *   3. otherwise                                                          → mock
 *
 * Real provider adapters read their keys via `getConnectorCredentials(id)` so implementing one
 * later is an isolated task that needs no changes to call sites. Until a real adapter exists, the
 * functional path stays on the mock even when "configured" — the app never breaks.
 */
import { prisma } from "@/lib/db";
import { getConnector, type ConnectorId } from "@/lib/integrations";

export interface ConnectorConfig {
  enabled: boolean;
  credentials: Record<string, string>;
}

const KEY = (id: string) => `connector:${id}`;

export async function getConnectorConfig(id: string): Promise<ConnectorConfig | null> {
  const row = await prisma.setting.findUnique({ where: { key: KEY(id) } });
  return row ? (row.valueJson as unknown as ConnectorConfig) : null;
}

export async function getConnectorCredentials(id: string): Promise<Record<string, string>> {
  const cfg = await getConnectorConfig(id);
  return cfg?.credentials ?? {};
}

/** The env-var names a connector needs (primary + alternates), from the registry. */
export function connectorEnvKeys(id: string): string[] {
  const c = getConnector(id as ConnectorId);
  if (!c) return [];
  return [c.envKey, ...(c.altEnvKeys ?? [])].filter(Boolean) as string[];
}

function hasEnv(id: string): boolean {
  return connectorEnvKeys(id).some((k) => !!process.env[k]);
}

function dbConfigured(cfg: ConnectorConfig | null, id: string): boolean {
  if (!cfg?.enabled) return false;
  const keys = connectorEnvKeys(id);
  // "configured" = enabled and at least one expected credential is filled in.
  return keys.length === 0 || keys.some((k) => !!cfg.credentials[k]?.trim());
}

/** Runtime status used by Admin + /api/ready. Async because it consults the DB. */
export async function connectorRuntimeStatus(id: string): Promise<"live" | "mock"> {
  const cfg = await getConnectorConfig(id);
  return dbConfigured(cfg, id) || hasEnv(id) ? "live" : "mock";
}

/** Whether the connector is configured (DB or env) — i.e. ready to use its real adapter. */
export async function isConnectorLive(id: string): Promise<boolean> {
  return (await connectorRuntimeStatus(id)) === "live";
}
