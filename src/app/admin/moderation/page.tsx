/**
 * Admin moderation — the report queue, sorted by severity (listReports already
 * orders severity desc, then newest). Each row shows the target, reason, report
 * count, severity + status pills, and investigate / strike / remove / dismiss
 * actions. Server component. Spec: prototype/v4/admin-moderation.jsx.
 */
import { listReports } from "@/lib/queries/admin";
import { AdPageHead, AdCard, AdEmpty, AdPill, adPagePad, type PillTone } from "@/components/admin/AdPrimitives";
import { AdReportActions } from "@/components/admin/AdReportActions";

export const dynamic = "force-dynamic";

const SEV_TONE: Record<string, PillTone> = { high: "live", medium: "warn", low: "neutral" };
const STATUS_TONE: Record<string, PillTone> = {
  open: "warn",
  investigating: "info",
  actioned: "ok",
  dismissed: "neutral",
};

const COLS = "1.5fr 1fr 80px 100px 100px auto";

export default async function AdminModerationPage() {
  let reports: Awaited<ReturnType<typeof listReports>> = [];
  let failed = false;
  try {
    reports = await listReports();
  } catch {
    failed = true;
  }

  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div style={adPagePad}>
      <AdPageHead
        eyebrow="trust & safety"
        title="moderation"
        sub="the report queue, highest severity first. investigate, strike, remove or dismiss — every action is audited."
        actions={!failed ? <AdPill tone={openCount > 0 ? "live" : "ok"}>{openCount} open</AdPill> : undefined}
      />

      <AdCard>
        <div
          className="lower"
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            gap: 12,
            padding: "12px 18px",
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink-4)",
            borderBottom: "1px solid var(--hairline)",
            alignItems: "center",
          }}
        >
          <span>target</span>
          <span>reason</span>
          <span style={{ textAlign: "right" }}>reports</span>
          <span>severity</span>
          <span>status</span>
          <span style={{ textAlign: "right" }}>action</span>
        </div>

        {failed ? (
          <AdEmpty>couldn&rsquo;t load the report queue right now. try refreshing.</AdEmpty>
        ) : reports.length === 0 ? (
          <AdEmpty>nothing in the queue — all clear.</AdEmpty>
        ) : (
          reports.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                gap: 12,
                padding: "14px 18px",
                alignItems: "center",
                borderTop: i ? "1px solid var(--hairline)" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.targetId}
                </div>
                <div className="lower tnum" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  {r.id} · {r.targetType}
                </div>
              </div>
              <span className="lower" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                {r.reason}
              </span>
              <span className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                {r.reportCount}
              </span>
              <span>
                <AdPill tone={SEV_TONE[r.severity] ?? "neutral"}>{r.severity}</AdPill>
              </span>
              <span>
                <AdPill tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status}</AdPill>
              </span>
              <AdReportActions id={r.id} status={r.status} />
            </div>
          ))
        )}
      </AdCard>
    </div>
  );
}
