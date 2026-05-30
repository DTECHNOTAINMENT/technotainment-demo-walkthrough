/**
 * Admin overview — platform KPI cards + a short "what needs attention" list.
 * Server component: data via adminOverview(). The layout already gates staff.
 * Spec: prototype/v4/admin-overview.jsx.
 */
import Link from "next/link";
import { adminOverview } from "@/lib/queries/admin";
import { formatCast, formatFiat } from "@/lib/cast";
import { AdPageHead, AdStatCard, AdCard, adPagePad, adKpiGrid } from "@/components/admin/AdPrimitives";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  let kpi: Awaited<ReturnType<typeof adminOverview>> | null = null;
  let failed = false;
  try {
    kpi = await adminOverview();
  } catch {
    failed = true;
  }

  if (failed || !kpi) {
    return (
      <div style={adPagePad}>
        <AdPageHead
          eyebrow="technotainment · operations"
          title="platform overview"
          sub="everything moving across technotainment right now — money, people, content and system health."
        />
        <AdCard style={{ padding: 28 }}>
          <p className="lower" style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>
            couldn&rsquo;t load platform metrics right now. try refreshing.
          </p>
        </AdCard>
      </div>
    );
  }

  const attention: { label: string; count: number; href: string; tone: string }[] = [
    { label: "open reports to review", count: kpi.openReports, href: "/admin/moderation", tone: "#ef4444" },
    { label: "pending payouts to clear", count: kpi.pendingPayoutCast, href: "/admin/finance", tone: "#f59e0b" },
  ];

  return (
    <div style={adPagePad}>
      <AdPageHead
        eyebrow="technotainment · operations"
        title="platform overview"
        sub="everything moving across technotainment right now — money, people, content and system health."
      />

      <div style={adKpiGrid}>
        <AdStatCard label="users" value={formatCast(kpi.userCount)} unit="total" accent="#06b6d4" />
        <AdStatCard label="active creators" value={formatCast(kpi.creatorCount)} unit="earning" accent="#8b5cf6" />
        <AdStatCard
          label="open reports"
          value={formatCast(kpi.openReports)}
          unit="to review"
          accent="#ef4444"
          hint={kpi.openReports > 0 ? "needs attention" : "queue clear"}
        />
        <AdStatCard
          label="gmv · settled top-ups"
          value={formatFiat(kpi.gmvCast)}
          unit="processed"
          accent="#10b981"
          hint={`${formatCast(kpi.gmvCast)} CAST`}
        />
        <AdStatCard
          label="pending payouts"
          value={formatFiat(kpi.pendingPayoutCast)}
          unit="held"
          accent="#f97316"
          hint={`${formatCast(kpi.pendingPayoutCast)} CAST`}
        />
        <AdStatCard label="live now" value={formatCast(kpi.liveStreams)} unit="streams" accent="#ec4899" />
      </div>

      <AdCard style={{ marginTop: 16 }}>
        <div
          className="lower"
          style={{
            padding: "14px 18px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          what needs attention
        </div>
        {attention.map((q, i) => (
          <Link
            key={q.label}
            href={q.href}
            className="lower"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              textDecoration: "none",
              color: "var(--ink-1)",
              borderTop: i ? "1px solid var(--hairline)" : "none",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: q.tone, flex: "0 0 8px" }} />
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{q.label}</span>
            <span className="tnum" style={{ fontWeight: 800, fontSize: 15 }}>
              {q.label.includes("payout") ? formatFiat(q.count) : formatCast(q.count)}
            </span>
            <span style={{ color: "var(--ink-4)", fontSize: 14 }}>›</span>
          </Link>
        ))}
      </AdCard>
    </div>
  );
}
