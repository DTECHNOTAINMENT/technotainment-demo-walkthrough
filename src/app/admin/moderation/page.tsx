/**
 * Admin moderation — KPI cards + the report queue, highest severity first (listReports
 * orders severity desc, then newest). Each row shows a type icon, target, reason, report
 * count, severity + status pills, and investigate / strike / remove / dismiss actions
 * (AdReportActions → /api/admin/action). Server component. Spec: prototype/v4/admin-moderation.jsx.
 */
import { listReports } from "@/lib/queries/admin";
import { StatCard, StudioCard, StudioPageHead, Pill, type PillTone } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";
import { AdReportActions } from "@/components/admin/AdReportActions";

export const dynamic = "force-dynamic";

const SEV_TONE: Record<string, PillTone> = { high: "live", medium: "warn", low: "neutral" };
const STATUS_TONE: Record<string, PillTone> = {
  open: "warn",
  investigating: "info",
  actioned: "ok",
  dismissed: "neutral",
};
const TYPE_ICON: Record<string, string> = {
  stream: "flame",
  product: "bag",
  user: "user",
  vod: "film",
  clip: "play",
};

const COLS = "40px 1.5fr 110px 80px 100px auto";

export default async function AdminModerationPage() {
  let reports: Awaited<ReturnType<typeof listReports>> = [];
  let failed = false;
  try {
    reports = await listReports();
  } catch {
    failed = true;
  }

  const openCount = reports.filter((r) => r.status === "open").length;
  const highCount = reports.filter((r) => r.severity === "high").length;

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="trust & safety"
        title="moderation"
        sub="reports, severity triage and enforcement — keep the platform safe and compliant. every action is audited."
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard
          label="open reports"
          icon="flame"
          value={String(openCount)}
          unit="to review"
          delta={`${highCount} high`}
          deltaUp={false}
          fiat="needs attention"
          spark={[28, 31, 29, 34, 32, 36, 35, openCount || 1]}
          sparkColor="#ef4444"
        />
        <StatCard
          label="auto-flagged"
          icon="settings"
          value="312"
          unit="last 24h"
          delta="AI mod"
          deltaUp
          fiat="86% precision"
          spark={[210, 240, 260, 280, 290, 300, 308, 312]}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="actions taken"
          icon="check"
          value="1,840"
          unit="this month"
          delta="+12%"
          deltaUp
          fiat="strikes + removals"
          spark={[1.4, 1.5, 1.6, 1.65, 1.7, 1.78, 1.8, 1.84]}
          sparkColor="#10b981"
        />
        <StatCard
          label="median response"
          icon="clock"
          value="8m"
          unit="to high sev"
          delta="−2m"
          deltaUp
          fiat="SLA: 15m"
          spark={[12, 11, 10, 10, 9, 9, 8, 8]}
          sparkColor="#06b6d4"
        />
      </div>

      <StudioCard pad={false} style={{ marginTop: 18 }}>
        <div className="st-row head" style={{ gridTemplateColumns: COLS }}>
          <span />
          <span>target · reason</span>
          <span>severity</span>
          <span style={{ textAlign: "right" }}>reports</span>
          <span>status</span>
          <span style={{ textAlign: "right" }}>action</span>
        </div>

        {failed ? (
          <div className="lower" style={{ padding: "32px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            couldn&rsquo;t load the report queue right now. try refreshing.
          </div>
        ) : reports.length === 0 ? (
          <div className="lower" style={{ padding: "32px 18px", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
            nothing in the queue — all clear.
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="st-row" style={{ gridTemplateColumns: COLS }}>
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
                <Icon name={TYPE_ICON[r.targetType] ?? "flame"} size={15} stroke={2} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.targetId}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {r.id} · {r.reason}
                </div>
              </div>
              <div>
                <Pill tone={SEV_TONE[r.severity] ?? "neutral"}>{r.severity}</Pill>
              </div>
              <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                {r.reportCount}
              </div>
              <div>
                <Pill tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status}</Pill>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <AdReportActions id={r.id} status={r.status} />
              </div>
            </div>
          ))
        )}
      </StudioCard>
    </div>
  );
}
