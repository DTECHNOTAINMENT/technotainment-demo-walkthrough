/**
 * /admin/connectors — the third-party services Technotainment runs on, grouped by category as a
 * card grid (icon, status, description, events, add/edit-keys + live/beta/off control). Plus the
 * API keys + webhooks surface. Keeps AxConnectorConfig (add-keys form) + AxConnectorToggle wired
 * to /api/admin/action. Server component reads the DB; toggles re-read on success.
 * Spec: prototype/v4/admin-connectors.jsx.
 */
import { listConnectors, listApiKeys, listWebhooks } from "@/lib/queries/admin";
import { StudioCard, StudioPageHead, Pill, type PillTone } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";
import { AxConnectorToggle } from "@/components/admin-x/AxConnectorToggle";
import { AxConnectorConfig } from "@/components/admin-x/AxConnectorConfig";
import { connectorEnvKeys, getConnectorConfig, connectorRuntimeStatus } from "@/lib/connectors";

export const dynamic = "force-dynamic";

const KEY_TONE: Record<string, PillTone> = { server: "warn", client: "info" };
const CAT_ICON: Record<string, string> = {
  payments: "wallet",
  identity: "user",
  risk: "flame",
  media: "film",
  comms: "share",
  tax: "trend",
  data: "grid",
  growth: "trend",
  trust: "check",
  infra: "settings",
};

function maskSecret(value: string, secret: boolean): string {
  if (!secret) return value;
  const i = value.indexOf("_");
  const prefix = i > 0 ? value.slice(0, i + 1) : "";
  return `${prefix}${"•".repeat(18)}`;
}

export default async function AdminConnectorsPage() {
  const [connectors, apiKeys, webhooks] = await Promise.all([listConnectors(), listApiKeys(), listWebhooks()]);

  // group by category, preserving first-seen order.
  const cats: string[] = [];
  const byCat = new Map<string, typeof connectors>();
  for (const c of connectors) {
    if (!byCat.has(c.cat)) {
      byCat.set(c.cat, []);
      cats.push(c.cat);
    }
    byCat.get(c.cat)!.push(c);
  }

  // Runtime config (DB-backed) per connector, so the panel can show/edit keys + live status.
  const configById = new Map(
    await Promise.all(
      connectors.map(async (c) => {
        const [cfg, status] = await Promise.all([getConnectorConfig(c.id), connectorRuntimeStatus(c.id)]);
        return [
          c.id,
          {
            envKeys: connectorEnvKeys(c.id),
            enabled: cfg?.enabled ?? false,
            filled: Object.keys(cfg?.credentials ?? {}),
            status,
          },
        ] as const;
      }),
    ),
  );

  const liveCount = connectors.filter((c) => configById.get(c.id)?.status === "live").length;

  return (
    <div className="page-pad" style={{ maxWidth: 1450, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="platform"
        title="connectors"
        sub="the third-party services technotainment runs on — payments, identity, media, comms, growth — plus the API surface partners build against."
        actions={
          <Pill tone="info">
            {liveCount} of {connectors.length} live
          </Pill>
        }
      />

      {connectors.length === 0 ? (
        <StudioCard>
          <div className="lower" style={{ fontSize: 13, color: "var(--ink-3)" }}>
            no connectors configured — seed the integrations registry to manage providers here.
          </div>
        </StudioCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {cats.map((cat) => (
            <div key={cat}>
              <div
                className="sb-section"
                style={{ padding: "0 0 10px", fontSize: 11, letterSpacing: "0.1em" }}
              >
                {cat}
              </div>
              <div
                style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}
              >
                {byCat.get(cat)!.map((c) => {
                  const cfg = configById.get(c.id)!;
                  return (
                    <div
                      key={c.id}
                      className="card"
                      style={{ background: "var(--surface)", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <span
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "var(--surface-2)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: "0 0 40px",
                            color: "var(--ink-2)",
                          }}
                        >
                          <Icon name={CAT_ICON[c.cat] ?? "grid"} size={19} stroke={2} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                          <div
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: "var(--ink-4)",
                            }}
                          >
                            {c.cat}
                          </div>
                        </div>
                        <Pill tone={cfg.status === "live" ? "ok" : "neutral"}>{cfg.status}</Pill>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5, flex: 1 }}>{c.desc}</p>
                      {c.events && (
                        <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
                          {c.events}
                        </span>
                      )}
                      <div
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
                      >
                        <AxConnectorConfig
                          id={c.id}
                          envKeys={cfg.envKeys}
                          enabled={cfg.enabled}
                          filled={cfg.filled}
                          status={cfg.status}
                        />
                        <AxConnectorToggle id={c.id} status={c.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="st-split" style={{ marginTop: 22 }}>
        {/* api keys */}
        <StudioCard title="API keys" sub="server keys are masked — rotate if exposed" pad={false}>
          {apiKeys.length === 0 ? (
            <div className="lower" style={{ padding: "24px 18px", color: "var(--ink-3)", fontSize: 13 }}>
              no API keys.
            </div>
          ) : (
            apiKeys.map((k, i) => (
              <div
                key={k.id}
                className="st-row"
                style={{ gridTemplateColumns: "1fr", borderTop: i ? "1px solid var(--hairline)" : "none" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    {k.label} <Pill tone={KEY_TONE[k.scope] ?? "neutral"}>{k.scope}</Pill>
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 5, wordBreak: "break-all" }}
                  >
                    {maskSecret(k.value, k.secret)}
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>
                    last used {k.lastUsed ?? "—"}
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="st-hint" style={{ margin: "12px 16px 16px" }}>
            all API access is scoped by role and logged in the audit trail. secret keys never appear in logs or
            webhooks. use restricted keys for partners.
          </div>
        </StudioCard>

        {/* webhooks */}
        <StudioCard title="webhooks" sub="event delivery endpoints" pad={false}>
          {webhooks.length === 0 ? (
            <div className="lower" style={{ padding: "24px 18px", color: "var(--ink-3)", fontSize: 13 }}>
              no webhook endpoints.
            </div>
          ) : (
            webhooks.map((w, i) => (
              <div
                key={w.id}
                className="st-row"
                style={{ gridTemplateColumns: "1fr auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    className="mono"
                    style={{ fontSize: 12.5, fontWeight: 600, wordBreak: "break-all" }}
                  >
                    {w.url}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
                    {w.events}
                    {w.delivered ? ` · ${w.delivered} delivered` : ""}
                  </div>
                </div>
                <Pill tone={w.status === "healthy" ? "ok" : "warn"}>{w.status}</Pill>
              </div>
            ))
          )}
        </StudioCard>
      </div>
    </div>
  );
}
