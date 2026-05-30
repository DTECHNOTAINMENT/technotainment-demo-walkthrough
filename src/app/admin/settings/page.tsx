/**
 * /admin/settings — the control center ("configure, don't code", CLAUDE.md §4b). The owner
 * runs Technotainment from here without a developer:
 *  - branding (company/app/currency/tagline)  → setting 'branding'
 *  - fees & the CAST economy (take rate, CAST per £, hold days) → setting 'fees'
 *  - feature flags (AxFlagToggle → flag action)
 *  - regions + team/RBAC (read-only)
 *  - the audit log of every privileged action.
 * Each save writes a Setting + an AuditEvent and takes effect at runtime — no deploy.
 * Server component reads getSetting (DB-backed, config as fallback) + the lists.
 */
import { listFlags, listTeam, listAudit } from "@/lib/queries/admin";
import { getSetting } from "@/lib/admin";
import { branding, economy } from "@/lib/config";
import { AxPageHead, AxCard, AxRow, AxPill, AxEmpty, AxHint, type Tone, AX_PAGE } from "@/components/admin-x/AxPrimitives";
import { AxSetting, type AxField } from "@/components/admin-x/AxSetting";
import { AxFlagToggle } from "@/components/admin-x/AxFlagToggle";

export const dynamic = "force-dynamic";

const KIND_TONE: Record<string, Tone> = {
  moderation: "live",
  creators: "info",
  trust: "warn",
  finance: "ok",
  security: "warn",
  config: "info",
  users: "neutral",
  system: "neutral",
};

interface BrandingSetting {
  companyName: string;
  appName: string;
  currencyName: string;
  tagline: string;
}
interface FeesSetting {
  takeRatePct: number;
  castPerGbp: number;
  payoutHoldDays: number;
}

const REGIONS: Array<{ r: string; cur: string; tax: string; status: Tone; label: string }> = [
  { r: "United Kingdom", cur: "GBP", tax: "VAT · HMRC", status: "ok", label: "live" },
  { r: "European Union", cur: "EUR", tax: "VAT MOSS · DAC7", status: "ok", label: "live" },
  { r: "United States", cur: "USD", tax: "sales tax · 1099-K", status: "info", label: "beta" },
  { r: "Canada", cur: "CAD", tax: "GST/HST", status: "info", label: "beta" },
  { r: "Australia", cur: "AUD", tax: "GST", status: "neutral", label: "planned" },
  { r: "Brazil", cur: "BRL", tax: "—", status: "neutral", label: "planned" },
];

const BRANDING_FIELDS: AxField[] = [
  { name: "companyName", label: "company name", hint: "the legal / parent brand" },
  { name: "appName", label: "app name", hint: "the consumer product name" },
  { name: "currencyName", label: "currency name", hint: "the platform credit" },
  { name: "tagline", label: "tagline" },
];

const FEES_FIELDS: AxField[] = [
  { name: "takeRatePct", label: "standard take rate", kind: "number", suffix: "%", hint: "the platform's cut of new creator earnings" },
  { name: "castPerGbp", label: "CAST per £1.00", kind: "number", hint: "exchange rate · only affects new purchases" },
  { name: "payoutHoldDays", label: "payout hold", kind: "number", suffix: "days", hint: "clearing window before a payout releases" },
];

export default async function AdminSettingsPage() {
  const [flags, team, audit, brand, fees] = await Promise.all([
    listFlags(),
    listTeam(),
    listAudit(),
    getSetting<BrandingSetting>("branding", {
      companyName: branding.companyName,
      appName: branding.appName,
      currencyName: branding.currencyName,
      tagline: branding.tagline,
    }),
    getSetting<FeesSetting>("fees", {
      takeRatePct: Math.round(economy.platformTakeRate * 100),
      castPerGbp: economy.castPerGbp,
      payoutHoldDays: economy.payoutHoldDays,
    }),
  ]);

  const liveFlags = flags.filter((f) => (f.group || "live") === "live");
  const roadmapFlags = flags.filter((f) => f.group === "roadmap");

  return (
    <div style={AX_PAGE}>
      <AxPageHead
        eyebrow="platform"
        title="control center"
        sub="run Technotainment without a developer — branding, fees and the CAST economy, feature rollouts, regions, your team and the audit trail. every change writes an audit event and takes effect at runtime, no deploy."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* branding */}
        <AxCard title="branding" sub="names and voice used across the product, emails and SEO">
          <AxSetting settingKey="branding" fields={BRANDING_FIELDS} initial={{ ...brand }} saveLabel="save branding" />
        </AxCard>

        {/* fees & CAST economy */}
        <AxCard title="fees & CAST economy" sub="the platform credit and the cut Technotainment takes">
          <AxSetting settingKey="fees" fields={FEES_FIELDS} initial={{ ...fees }} saveLabel="save fees" />
          <div style={{ marginTop: 14 }}>
            <AxHint>
              CAST is a closed-loop credit. balances are a float liability — changing the rate only affects new purchases,
              never issued balances. the take rate applies to new creators.
            </AxHint>
          </div>
        </AxCard>

        {/* feature flags */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
          <FlagCard title="live features" sub="on now · flip rollout any time" flags={liveFlags} />
          <FlagCard title="roadmap — flip on when ready" sub="fully built · turning these on needs no code change" flags={roadmapFlags} />
        </div>

        {/* regions */}
        <AxCard title="regions & compliance" sub="where Technotainment operates and the rules that apply" pad={false}>
          <AxRow cols="1fr 70px 1fr 80px" head first>
            <span>region</span>
            <span>currency</span>
            <span>tax</span>
            <span style={{ textAlign: "right" }}>status</span>
          </AxRow>
          {REGIONS.map((x) => (
            <AxRow key={x.r} cols="1fr 70px 1fr 80px">
              <span style={{ fontSize: 13, fontWeight: 600 }}>{x.r}</span>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                {x.cur}
              </span>
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {x.tax}
              </span>
              <span style={{ textAlign: "right" }}>
                <AxPill tone={x.status}>{x.label}</AxPill>
              </span>
            </AxRow>
          ))}
        </AxCard>

        {/* team / RBAC */}
        <AxCard title="team & roles" sub="who can access the back-office · RBAC + enforced MFA" pad={false}>
          {team.length === 0 ? (
            <AxEmpty title="no team members" hint="seed the operations team to populate RBAC." />
          ) : (
            <>
              <AxRow cols="1.4fr 1fr 70px" head first>
                <span>member</span>
                <span>role</span>
                <span style={{ textAlign: "right" }}>mfa</span>
              </AxRow>
              {team.map((m) => (
                <AxRow key={m.id} cols="1.4fr 1fr 70px">
                  <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        flex: "0 0 34px",
                        background: "var(--surface-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--ink-2)",
                      }}
                    >
                      {m.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {m.email}
                      </div>
                    </div>
                  </div>
                  <span>
                    <AxPill tone={m.role === "owner" ? "info" : "neutral"}>{m.role.replace("_", " ")}</AxPill>
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {m.mfa ? (
                      <span style={{ color: "#10b981", fontWeight: 900 }}>✓</span>
                    ) : (
                      <span className="lower" style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                        off
                      </span>
                    )}
                  </span>
                </AxRow>
              ))}
            </>
          )}
        </AxCard>

        {/* audit log */}
        <AxCard title="audit log" sub="every privileged action, immutable" pad={false}>
          {audit.length === 0 ? (
            <AxEmpty title="no audit events yet" hint="privileged actions across the back-office are recorded here." />
          ) : (
            <>
              <AxRow cols="1fr 130px 150px" head first>
                <span>action</span>
                <span>who</span>
                <span style={{ textAlign: "right" }}>kind · when</span>
              </AxRow>
              {audit.map((e) => (
                <AxRow key={e.id} cols="1fr 130px 150px">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{e.action}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {e.who}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <AxPill tone={KIND_TONE[e.kind] ?? "neutral"}>{e.kind}</AxPill>
                    <span className="lower" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                      {new Date(e.when).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                </AxRow>
              ))}
            </>
          )}
        </AxCard>
      </div>
    </div>
  );
}

function FlagCard({
  title,
  sub,
  flags,
}: {
  title: string;
  sub: string;
  flags: Array<{ id: string; label: string; desc: string; on: boolean; rollout: string }>;
}) {
  return (
    <AxCard title={title} sub={sub} pad={false}>
      {flags.length === 0 ? (
        <AxEmpty title="no flags in this group" />
      ) : (
        flags.map((f, i) => (
          <AxRow key={f.id} cols="1fr 70px 44px" first={i === 0}>
            <div style={{ minWidth: 0 }}>
              <div className="lower" style={{ fontSize: 13.5, fontWeight: 700 }}>
                {f.label}
              </div>
              <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                {f.desc}
              </div>
            </div>
            <span style={{ textAlign: "center" }}>
              <AxPill tone={f.on ? "info" : "neutral"}>{f.on ? f.rollout : "off"}</AxPill>
            </span>
            <span style={{ display: "flex", justifyContent: "flex-end" }}>
              <AxFlagToggle id={f.id} on={f.on} />
            </span>
          </AxRow>
        ))
      )}
    </AxCard>
  );
}
