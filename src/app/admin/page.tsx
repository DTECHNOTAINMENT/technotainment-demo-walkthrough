/**
 * Admin overview — platform KPI cards, GMV chart, attention queues, CAST economics,
 * revenue lines and the recent audit log. Server component: live KPIs via adminOverview()
 * plus the recent audit trail; the 12-month series are illustrative trend data (the demo DB
 * holds point-in-time rows, not a backfilled history). Spec: prototype/v4/admin-overview.jsx.
 */
import Link from "next/link";
import { adminOverview, listAudit } from "@/lib/queries/admin";
import { formatCast } from "@/lib/cast";
import {
  StatCard,
  StudioCard,
  StudioPageHead,
  Bars,
  SegBar,
  gbpShort,
  type SegBarSegment,
} from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

const MONTHS = ["jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may"];
// Illustrative 12-month trend series for the hero charts/sparklines.
const GMV = [1.82, 1.94, 2.11, 2.34, 2.28, 2.61, 2.92, 2.78, 3.14, 3.42, 3.71, 4.08].map((v) =>
  Math.round(v * 1e6),
);
const REVENUE = GMV.map((v) => Math.round(v * 0.12));
const USERS = [180, 196, 214, 241, 262, 289, 318, 342, 371, 402, 438, 472].map((k) => k * 1000);

const PAY_MIX = [
  { id: "apple-pay", label: "Apple Pay", pct: 31 },
  { id: "visa", label: "Cards", pct: 28 },
  { id: "google-pay", label: "Google Pay", pct: 14 },
  { id: "paypal", label: "PayPal", pct: 11 },
  { id: "sepa", label: "Bank / SEPA", pct: 8 },
  { id: "venmo", label: "Venmo", pct: 5 },
  { id: "usdc", label: "USDC", pct: 3 },
];

const REV_LINES: SegBarSegment[] = [
  { id: "memberships", label: "memberships", cast: 1840000, color: "#8b5cf6" },
  { id: "tips", label: "tips", cast: 1120000, color: "#ec4899" },
  { id: "drops", label: "drops & store", cast: 640000, color: "#06b6d4" },
  { id: "ppv", label: "ppv & tickets", cast: 312000, color: "#f97316" },
  { id: "topups", label: "top-up spread", cast: 168000, color: "#10b981" },
];

export default async function AdminOverviewPage() {
  let kpi: Awaited<ReturnType<typeof adminOverview>> | null = null;
  let audit: Awaited<ReturnType<typeof listAudit>> = [];
  let failed = false;
  try {
    [kpi, audit] = await Promise.all([adminOverview(), listAudit(5)]);
  } catch {
    failed = true;
  }

  if (failed || !kpi) {
    return (
      <div className="page-pad" style={{ maxWidth: 1500, margin: "0 auto" }}>
        <StudioPageHead
          eyebrow="technotainment · operations"
          title="platform overview"
          sub="everything moving across technotainment right now — money, people, content and system health."
        />
        <StudioCard>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>
            couldn&rsquo;t load platform metrics right now. try refreshing.
          </p>
        </StudioCard>
      </div>
    );
  }

  const revTotal = REV_LINES.reduce((s, r) => s + r.cast, 0);
  const k = kpi;

  const attention = [
    { label: "open reports", n: k.openReports, route: "/admin/moderation", icon: "flame" },
    { label: "active creators", n: k.creatorCount, route: "/admin/creators", icon: "sparkle" },
    { label: "pending payouts", n: k.pendingPayoutCast, route: "/admin/finance", icon: "wallet", cast: true },
    { label: "total users", n: k.userCount, route: "/admin/users", icon: "user" },
  ];

  return (
    <div className="page-pad" style={{ maxWidth: 1500, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="technotainment · operations"
        title="platform overview"
        sub="everything moving across technotainment right now — money, people, content and system health."
        actions={
          <span className="onair" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
            all systems · 99.98%
          </span>
        }
      />

      <div className="kpi-grid">
        <StatCard
          label="gmv · settled top-ups"
          icon="cast"
          value={gbpShort(k.gmvCast)}
          unit="processed"
          delta="+9.9%"
          deltaUp
          fiat={`${formatCast(k.gmvCast)} CAST`}
          spark={GMV.slice(-8)}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="platform revenue"
          icon="trend"
          value={gbpShort(Math.round(k.gmvCast * 0.12))}
          unit="net take"
          delta="+9.9%"
          deltaUp
          fiat="12% blended rate"
          spark={REVENUE.slice(-8)}
          sparkColor="#10b981"
        />
        <StatCard
          label="users"
          icon="users"
          value={formatCast(k.userCount)}
          unit="total"
          fiat={`${formatCast(k.creatorCount)} creators`}
          spark={USERS.slice(-8)}
          sparkColor="#06b6d4"
        />
        <StatCard
          label="live now"
          icon="flame"
          value={formatCast(k.liveStreams)}
          unit="streams"
          delta="on air"
          deltaUp
          fiat="concurrent broadcasts"
          spark={[0.9, 1.0, 1.1, 1.0, 1.2, 1.25, 1.2, 1.28]}
          sparkColor="#ef4444"
        />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard
            title="gross merchandise value · 12 months"
            sub="all CAST flowing through the platform"
            action={
              <Link
                href="/admin/finance"
                className="btn btn-glass lower"
                style={{ padding: "8px 12px", fontSize: 12, textDecoration: "none" }}
              >
                finance <Icon name="arrowR" size={13} stroke={2.2} />
              </Link>
            }
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 38 }}>
                {gbpShort(k.gmvCast)}
              </span>
              <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
                this month
              </span>
              <span className="tnum" style={{ color: "#10b981", fontSize: 13, fontWeight: 800, marginLeft: "auto" }}>
                ▲ 9.9% MoM
              </span>
            </div>
            <Bars data={GMV} labels={MONTHS} h={180} fmt={(v) => formatCast(v) + " CAST"} />
          </StudioCard>

          <div className="st-split-even">
            <StudioCard title="needs attention" pad={false}>
              {attention.map((q, i) => (
                <Link
                  key={q.label}
                  href={q.route}
                  className="st-row"
                  style={{
                    gridTemplateColumns: "34px 1fr auto",
                    width: "100%",
                    textAlign: "left",
                    textDecoration: "none",
                    color: "var(--ink-1)",
                    borderTop: i ? "1px solid var(--hairline)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "var(--surface-2)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-2)",
                    }}
                  >
                    <Icon name={q.icon} size={16} stroke={2} />
                  </span>
                  <span className="lower" style={{ fontSize: 13, fontWeight: 600 }}>
                    {q.label}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="tnum" style={{ fontWeight: 800, fontSize: 15 }}>
                      {q.cast ? gbpShort(q.n) : formatCast(q.n)}
                    </span>
                    <Icon name="chevR" size={15} stroke={2.2} style={{ color: "var(--ink-4)" }} />
                  </span>
                </Link>
              ))}
            </StudioCard>

            <StudioCard title="payment mix" sub="inbound · this month">
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {PAY_MIX.map((m) => (
                  <div key={m.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="lower" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                        {m.label}
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {m.pct}%
                      </span>
                    </div>
                    <div className="meter">
                      <span style={{ width: `${m.pct * 2.6}%`, background: "var(--brand-gradient)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </StudioCard>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* CAST economics */}
          <div className="card" style={{ background: "var(--surface)", overflow: "hidden" }}>
            <div className="brand-hairline" />
            <div style={{ padding: 18 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--ink-3)",
                }}
              >
                pending payouts · float liability
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                <span className="tnum brand-grad-text stat-num" style={{ fontSize: 38 }}>
                  {formatCast(k.pendingPayoutCast)}
                </span>
                <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
                  CAST
                </span>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>
                ≈ {gbpShort(k.pendingPayoutCast)} held for creators
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 10 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--ink-4)",
                    }}
                  >
                    settled gmv
                  </div>
                  <div className="tnum stat-num" style={{ fontSize: 20, marginTop: 4 }}>
                    {gbpShort(k.gmvCast)}
                  </div>
                </div>
                <div style={{ padding: 12, background: "var(--surface-2)", borderRadius: 10 }}>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--ink-4)",
                    }}
                  >
                    fx rate
                  </div>
                  <div className="tnum stat-num" style={{ fontSize: 20, marginTop: 4 }}>
                    100:£1
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue lines */}
          <StudioCard title="revenue by line" sub="this month">
            <SegBar segments={REV_LINES} total={revTotal} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
              {REV_LINES.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="legdot" style={{ background: r.color }} />
                  <span className="lower" style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>
                    {r.label}
                  </span>
                  <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {gbpShort(r.cast)}
                  </span>
                </div>
              ))}
            </div>
          </StudioCard>

          {/* Recent admin activity */}
          <StudioCard
            title="audit log"
            sub="recent operator actions"
            action={
              <Link
                href="/admin/settings"
                className="btn btn-glass lower"
                style={{ padding: "7px 11px", fontSize: 12, textDecoration: "none" }}
              >
                all
              </Link>
            }
            pad={false}
          >
            <div style={{ padding: "8px 8px 12px" }}>
              {audit.length === 0 ? (
                <div className="lower" style={{ padding: "20px 12px", fontSize: 12.5, color: "var(--ink-3)" }}>
                  no operator actions yet.
                </div>
              ) : (
                audit.map((e) => (
                  <div key={e.id} className="act-row">
                    <span
                      className="act-ico"
                      style={{
                        background: e.who === "system" ? "var(--surface-3)" : "var(--brand-gradient)",
                        color: e.who === "system" ? "var(--ink-2)" : "white",
                      }}
                    >
                      <Icon name={e.who === "system" ? "settings" : "user"} size={15} stroke={2} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{e.action}</div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {e.who} ·{" "}
                        {new Date(e.when).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
}
