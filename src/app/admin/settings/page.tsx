/**
 * /admin/settings — the control center ("configure, don't code", CLAUDE.md §4b). The owner runs
 * Technotainment from here without a developer: branding, fees & the CAST economy (AxSetting →
 * setting action), feature flags (AxFlagToggle → flag action), regions + team/RBAC (read-only)
 * and the audit log of every privileged action. Each save writes a Setting + an AuditEvent and
 * takes effect at runtime — no deploy. Server component. Spec: prototype/v4/admin-settings.jsx
 * + admin-controls.jsx.
 */
import { listFlags, listTeam, listAudit } from "@/lib/queries/admin";
import { getSetting } from "@/lib/admin";
import { getHomeHero } from "@/lib/settings";
import { listLiveStreams } from "@/lib/queries/public";
import { branding, economy } from "@/lib/config";
import { StudioCard, StudioPageHead, Pill, type PillTone } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";
import { AxSetting, type AxField } from "@/components/admin-x/AxSetting";
import { AxFlagToggle } from "@/components/admin-x/AxFlagToggle";
import {
  AxPaymentMethods,
  AxPolicies,
  AxPages,
  AxBrandingExtras,
  type PaymentMethodsValue,
  type PoliciesValue,
  type PagesValue,
  type AnnouncementValue,
  type BrandingExtrasValue,
} from "@/components/admin-x/AxControls";

export const dynamic = "force-dynamic";

const KIND_TONE: Record<string, PillTone> = {
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

const REGIONS: Array<{ r: string; cur: string; tax: string; tone: PillTone; label: string }> = [
  { r: "United Kingdom", cur: "GBP", tax: "VAT · HMRC", tone: "ok", label: "live" },
  { r: "European Union", cur: "EUR", tax: "VAT MOSS · DAC7", tone: "ok", label: "live" },
  { r: "United States", cur: "USD", tax: "sales tax · 1099-K", tone: "info", label: "beta" },
  { r: "Canada", cur: "CAD", tax: "GST/HST", tone: "info", label: "beta" },
  { r: "Australia", cur: "AUD", tax: "GST", tone: "neutral", label: "planned" },
  { r: "Brazil", cur: "BRL", tax: "—", tone: "neutral", label: "planned" },
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

// ---- control-center defaults (seeded from the prototype) ----

const mk = (id: string, label: string, on = true) => ({ id, label, on });

const DEFAULT_PAYMENT_METHODS: PaymentMethodsValue = {
  topup: [
    mk("apple-pay", "apple pay"),
    mk("google-pay", "google pay"),
    mk("paypal", "paypal"),
    mk("venmo", "venmo"),
    mk("cashapp", "cash app", false),
    mk("visa", "visa"),
    mk("mastercard", "mastercard"),
    mk("amex", "american express"),
    mk("sepa", "sepa direct debit"),
    mk("ach", "ach", false),
    mk("faster", "faster payments"),
    mk("ideal", "ideal", false),
    mk("klarna", "klarna", false),
    mk("usdc", "usdc", false),
  ],
  payout: [
    mk("bank", "bank transfer"),
    mk("instant", "instant payout", false),
    mk("paypal", "paypal"),
    mk("venmo", "venmo", false),
    mk("wise", "wise"),
    mk("payoneer", "payoneer", false),
    mk("usdc", "usdc", false),
  ],
};

const DEFAULT_POLICIES: PoliciesValue = {
  minAgeWatch: 13,
  minAgeEarn: 18,
  strikes: 3,
  strikeAction: "suspend then ban",
  autoHoldHighRisk: true,
  membersOnlyChatDefault: false,
  blockedTerms: ["scam", "free crypto", "dm me", "telegram"],
  guidelines:
    "be respectful. no harassment, hate speech, illegal content or spam. creators are responsible for the content they broadcast. report anything that breaks these rules.",
};

const DEFAULT_PAGES: PagesValue = {
  pages: [
    { id: "terms", title: "terms of service", path: "/legal/terms", published: true, body: "the terms governing use of the platform." },
    { id: "privacy", title: "privacy policy", path: "/legal/privacy", published: true, body: "how we collect, use and protect personal data." },
    { id: "guidelines", title: "community guidelines", path: "/legal/guidelines", published: true, body: "the rules everyone agrees to." },
    { id: "help", title: "help center", path: "/help", published: true, body: "answers to common questions for fans and creators." },
  ],
};

const DEFAULT_ANNOUNCEMENT: AnnouncementValue = { on: false, text: "" };

export default async function AdminSettingsPage() {
  const [flags, team, audit, brand, fees, payMethods, policies, pages, announcement, brandTheme, homeHero, liveStreams] = await Promise.all([
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
    getSetting<PaymentMethodsValue>("payment-methods", DEFAULT_PAYMENT_METHODS),
    getSetting<PoliciesValue>("policies", DEFAULT_POLICIES),
    getSetting<PagesValue>("pages", DEFAULT_PAGES),
    getSetting<AnnouncementValue>("announcement", DEFAULT_ANNOUNCEMENT),
    getSetting<BrandingExtrasValue>("branding-theme", {
      brandColor: "#8b5cf6",
      brandColor2: "#ec4899",
      defaultTheme: branding.defaultTheme,
    }),
    getHomeHero(),
    listLiveStreams().catch(() => []),
  ]);

  const heroOptions = liveStreams
    .map((s) => `${s.id} — ${s.title} (${s.channel.creator.handle})`)
    .join(" · ");

  const liveFlags = flags.filter((f) => (f.group || "live") === "live");
  const roadmapFlags = flags.filter((f) => f.group === "roadmap");

  return (
    <div className="page-pad" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="platform"
        title="control center"
        sub="run technotainment without a developer — branding, fees, the CAST economy, feature rollouts, regions, your team and the audit trail. every change writes an audit event and takes effect at runtime, no deploy."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* branding */}
        <StudioCard title="branding" sub="names and voice used across the product, emails and SEO">
          <AxSetting settingKey="branding" fields={BRANDING_FIELDS} initial={{ ...brand }} saveLabel="save branding" />
        </StudioCard>

        {/* branding — logo, colours, default theme */}
        <AxBrandingExtras initial={brandTheme} />

        {/* home hero — pinned editorial slot */}
        <StudioCard title="home hero" sub="pin the live stream that headlines the home page">
          <AxSetting
            settingKey="homeHero"
            fields={[{ name: "pinnedStreamId", label: "pinned stream id", hint: "leave blank to auto-pick the top live stream" }]}
            initial={{ pinnedStreamId: homeHero.pinnedStreamId ?? "" }}
            saveLabel="pin hero"
          />
          <div className="st-hint" style={{ marginTop: 14 }}>
            live now: {heroOptions || "—"}
          </div>
        </StudioCard>

        {/* fees & CAST economy */}
        <StudioCard title="fees & CAST economy" sub="the platform credit and the cut technotainment takes">
          <AxSetting settingKey="fees" fields={FEES_FIELDS} initial={{ ...fees }} saveLabel="save fees" />
          <div className="st-hint" style={{ marginTop: 14 }}>
            CAST is a closed-loop credit. balances are a float liability — changing the rate only affects new purchases,
            never issued balances. the take rate applies to new creators.
          </div>
        </StudioCard>

        {/* payment methods — top-up + payout rails */}
        <AxPaymentMethods initial={payMethods} />

        {/* policies — age, enforcement, blocked terms, guidelines */}
        <AxPolicies initial={policies} />

        {/* pages / cms + system announcement */}
        <AxPages initialPages={pages} initialAnnouncement={announcement} />

        {/* feature flags */}
        <div className="st-split-even">
          <FlagCard title="live features" sub="on now · flip rollout any time" flags={liveFlags} />
          <FlagCard title="roadmap — flip on when ready" sub="fully built · turning these on needs no code change" flags={roadmapFlags} />
        </div>

        {/* regions */}
        <StudioCard title="regions & compliance" sub="where technotainment operates and the rules that apply" pad={false}>
          <div className="st-row head" style={{ gridTemplateColumns: "1fr 90px 1fr 90px" }}>
            <span>region</span>
            <span>currency</span>
            <span>tax</span>
            <span style={{ textAlign: "right" }}>status</span>
          </div>
          {REGIONS.map((x) => (
            <div key={x.r} className="st-row" style={{ gridTemplateColumns: "1fr 90px 1fr 90px" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{x.r}</span>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                {x.cur}
              </span>
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {x.tax}
              </span>
              <span style={{ textAlign: "right" }}>
                <Pill tone={x.tone}>{x.label}</Pill>
              </span>
            </div>
          ))}
        </StudioCard>

        {/* team / RBAC */}
        <StudioCard title="team & roles" sub="who can access the back-office · RBAC + enforced MFA" pad={false}>
          {team.length === 0 ? (
            <div className="lower" style={{ padding: "24px 18px", color: "var(--ink-3)", fontSize: 13 }}>
              no team members — seed the operations team to populate RBAC.
            </div>
          ) : (
            <>
              <div className="st-row head" style={{ gridTemplateColumns: "1.4fr 160px 80px" }}>
                <span>member</span>
                <span>role</span>
                <span style={{ textAlign: "center" }}>mfa</span>
              </div>
              {team.map((m) => (
                <div key={m.id} className="st-row" style={{ gridTemplateColumns: "1.4fr 160px 80px" }}>
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
                    <Pill tone={m.role === "owner" ? "info" : "neutral"}>{m.role.replace("_", " ")}</Pill>
                  </span>
                  <span style={{ textAlign: "center" }}>
                    {m.mfa ? (
                      <Icon name="check" size={16} stroke={2.6} style={{ color: "#10b981" }} />
                    ) : (
                      <span className="lower" style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>
                        off
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </>
          )}
        </StudioCard>

        {/* audit log */}
        <StudioCard title="audit log" sub="every privileged action, immutable" pad={false}>
          {audit.length === 0 ? (
            <div className="lower" style={{ padding: "24px 18px", color: "var(--ink-3)", fontSize: 13 }}>
              no audit events yet.
            </div>
          ) : (
            audit.map((e, i) => (
              <div
                key={e.id}
                className="st-row"
                style={{ gridTemplateColumns: "40px 1fr 120px 110px", borderTop: i ? "1px solid var(--hairline)" : "none" }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: "var(--surface-2)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink-3)",
                  }}
                >
                  <Icon name={e.who === "system" ? "settings" : "user"} size={15} stroke={2} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{e.action}</span>
                <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {e.who}
                </span>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <Pill tone={KIND_TONE[e.kind] ?? "neutral"}>{e.kind}</Pill>
                  <span className="lower" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                    {new Date(e.when).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </StudioCard>
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
    <StudioCard title={title} sub={sub} pad={false}>
      {flags.length === 0 ? (
        <div className="lower" style={{ padding: "20px 18px", color: "var(--ink-3)", fontSize: 13 }}>
          no flags in this group.
        </div>
      ) : (
        flags.map((f, i) => (
          <div
            key={f.id}
            className="st-row"
            style={{ gridTemplateColumns: "1fr 90px 50px", borderTop: i ? "1px solid var(--hairline)" : "none" }}
          >
            <div style={{ minWidth: 0 }}>
              <div className="lower" style={{ fontSize: 13.5, fontWeight: 700 }}>
                {f.label}
              </div>
              <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                {f.desc}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Pill tone={f.on ? "info" : "neutral"}>{f.on ? f.rollout : "off"}</Pill>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <AxFlagToggle id={f.id} on={f.on} />
            </div>
          </div>
        ))
      )}
    </StudioCard>
  );
}
