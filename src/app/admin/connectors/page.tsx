/**
 * /admin/connectors — the third-party services Technotainment runs on, grouped by category,
 * each with a live/beta/off control (AxConnectorToggle → connector action). Plus read-only
 * API keys and webhook endpoints. Server component reads the DB; toggles re-read on success.
 */
import { listConnectors, listApiKeys, listWebhooks } from "@/lib/queries/admin";
import { AxPageHead, AxCard, AxRow, AxPill, AxEmpty, AxHint, type Tone, AX_PAGE } from "@/components/admin-x/AxPrimitives";
import { AxConnectorToggle } from "@/components/admin-x/AxConnectorToggle";

export const dynamic = "force-dynamic";

const KEY_TONE: Record<string, Tone> = { server: "warn", client: "info" };

function maskSecret(value: string, secret: boolean): string {
  if (!secret) return value;
  // keep the prefix up to the first underscore, mask the rest.
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

  const liveCount = connectors.filter((c) => c.status === "live").length;

  return (
    <div style={AX_PAGE}>
      <AxPageHead
        eyebrow="platform"
        title="connectors"
        sub="the third-party services Technotainment runs on — payments, identity, media, comms, growth — plus the API surface partners build against."
      />

      {connectors.length === 0 ? (
        <AxCard pad>
          <AxEmpty title="no connectors configured" hint="seed the integrations registry to manage providers here." />
        </AxCard>
      ) : (
        <>
          <AxHint>
            {liveCount} of {connectors.length} integrations live. flipping a connector to off stops sending it traffic
            immediately — every change is audited. search console, og-image and the other growth providers feed the SEO console.
          </AxHint>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            {cats.map((cat) => (
              <AxCard key={cat} title={cat} sub={`${byCat.get(cat)!.length} provider(s)`} pad={false}>
                {byCat.get(cat)!.map((c, i) => (
                  <AxRow key={c.id} cols="minmax(0,1fr) 220px" first={i === 0}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                      <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2, lineHeight: 1.45 }}>
                        {c.desc}
                      </div>
                      {c.events && (
                        <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>
                          {c.events}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <AxConnectorToggle id={c.id} status={c.status} />
                    </div>
                  </AxRow>
                ))}
              </AxCard>
            ))}
          </div>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginTop: 16 }}>
        {/* api keys */}
        <AxCard title="api keys" sub="server keys are masked — rotate if exposed" pad={false}>
          {apiKeys.length === 0 ? (
            <AxEmpty title="no api keys" />
          ) : (
            apiKeys.map((k, i) => (
              <AxRow key={k.id} cols="1fr auto" first={i === 0} style={{ alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    {k.label}
                    <AxPill tone={KEY_TONE[k.scope] ?? "neutral"}>{k.scope}</AxPill>
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 5, wordBreak: "break-all" }}>
                    {maskSecret(k.value, k.secret)}
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4 }}>
                    last used {k.lastUsed ?? "—"}
                  </div>
                </div>
              </AxRow>
            ))
          )}
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--hairline)" }}>
            <AxHint>all api access is scoped by role and logged in the audit trail. secret keys never appear in logs or webhooks.</AxHint>
          </div>
        </AxCard>

        {/* webhooks */}
        <AxCard title="webhooks" sub="event delivery endpoints" pad={false}>
          {webhooks.length === 0 ? (
            <AxEmpty title="no webhook endpoints" />
          ) : (
            webhooks.map((w, i) => (
              <AxRow key={w.id} cols="1fr auto" first={i === 0}>
                <div style={{ minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, wordBreak: "break-all" }}>
                    {w.url}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>
                    {w.events}
                    {w.delivered ? ` · ${w.delivered} delivered` : ""}
                  </div>
                </div>
                <AxPill tone={w.status === "healthy" ? "ok" : "warn"}>{w.status}</AxPill>
              </AxRow>
            ))
          )}
        </AxCard>
      </div>
    </div>
  );
}
