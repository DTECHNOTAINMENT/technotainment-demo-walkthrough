/**
 * Admin moderation — KPI cards + a two-tab workspace (AxModeration): the report queue with a
 * severity filter (each row → investigate / strike / remove / dismiss via AdReportActions) and
 * the live monitor (a grid of every public live stream). Server component reads listReports +
 * listLiveStreams (both no-DB safe) and hands serialisable rows to the client tab switcher.
 * Spec: prototype/v4/admin-moderation.jsx.
 */
import { listReports } from "@/lib/queries/admin";
import { listLiveStreams } from "@/lib/queries/public";
import { StatCard, StudioPageHead } from "@/components/studio-ui";
import { AxModeration, type ModReport, type LiveStreamRow } from "@/components/admin-x/AxModeration";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  let reports: Awaited<ReturnType<typeof listReports>> = [];
  let liveRaw: Awaited<ReturnType<typeof listLiveStreams>> = [];
  try {
    [reports, liveRaw] = await Promise.all([listReports(), listLiveStreams()]);
  } catch {
    /* no-DB fallbacks already applied inside the queries; render empties on hard failure */
  }

  const openCount = reports.filter((r) => r.status === "open").length;
  const highCount = reports.filter((r) => r.severity === "high").length;

  const modReports: ModReport[] = reports.map((r) => ({
    id: r.id,
    targetType: r.targetType,
    targetId: r.targetId,
    reason: r.reason,
    reportCount: r.reportCount,
    severity: r.severity,
    status: r.status as ModReport["status"],
  }));

  // Mark one stream "flagged" if its creator is the subject of an open stream/user report.
  const flaggedNames = new Set(
    reports.filter((r) => r.status === "open" && (r.targetType === "stream" || r.targetType === "user")).map((r) => r.targetId.toLowerCase()),
  );
  const live: LiveStreamRow[] = liveRaw.map((s) => {
    const creatorName = s.channel.creator.name;
    return {
      id: s.id,
      title: s.title,
      category: s.category,
      creatorName,
      viewers: s.viewers,
      flagged: flaggedNames.has(creatorName.toLowerCase()) || flaggedNames.has(s.channel.creator.handle.toLowerCase()),
    };
  });

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

      <AxModeration reports={modReports} live={live} />
    </div>
  );
}
