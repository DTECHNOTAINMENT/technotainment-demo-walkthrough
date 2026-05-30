/**
 * /studio/analytics — reach + revenue summary ported to match prototype/v4/studio-analytics.jsx:
 * KPI StatCards, a revenue-by-kind Bars chart, a revenue-source SegBar, and a per-kind Meter
 * breakdown. Derived from settled transactions + video views via analyticsSummary().
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { analyticsSummary } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { StatCard, StudioCard, StudioPageHead, Bars, SegBar, Meter, type SegBarSegment } from "@/components/studio-ui";

export const dynamic = "force-dynamic";

const KIND_COLOR: Record<string, string> = {
  tip: "#ec4899",
  membership: "#8b5cf6",
  ppv: "#f59e0b",
  drop: "#06b6d4",
  gift: "#10b981",
};
const KIND_LABEL: Record<string, string> = {
  tip: "tips",
  membership: "memberships",
  ppv: "pay-per-view",
  drop: "drops",
  gift: "gifted subs",
  topup: "top-ups",
};

export default async function StudioAnalyticsPage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const { totalViews, revenueCast, byKind, txnCount } = await analyticsSummary(channelId);
  const kinds = Object.entries(byKind).sort((a, b) => b[1] - a[1]);
  const maxKind = kinds.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
  const segTotal = kinds.reduce((a, [, v]) => a + v, 0) || 1;
  const segments: SegBarSegment[] = kinds.map(([id, cast]) => ({
    id,
    label: KIND_LABEL[id] ?? id,
    cast,
    color: KIND_COLOR[id] ?? "#8b5cf6",
  }));

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="analytics"
        sub="revenue, reach and activity. everything you need to decide what to make next."
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard label="revenue" icon="cast" value={formatCast(revenueCast)} unit="CAST" fiat={formatFiat(revenueCast)} />
        <StatCard label="total views" icon="eye" value={formatCast(totalViews)} unit="all videos" sparkColor="#06b6d4" />
        <StatCard label="transactions" icon="trend" value={formatCast(txnCount)} unit="settled" sparkColor="#10b981" />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="revenue by kind" sub="settled CAST, all time">
            {kinds.length === 0 ? (
              <div className="lower" style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", padding: "20px 0" }}>
                no revenue yet — tips, memberships, ppv and drops will break down here.
              </div>
            ) : (
              <>
                <Bars
                  data={kinds.map(([, v]) => v)}
                  labels={kinds.map(([k]) => KIND_LABEL[k] ?? k)}
                  h={190}
                  fmt={(v) => formatCast(v) + " CAST"}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
                  {kinds.map(([kind, cast]) => (
                    <div key={kind}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                          {KIND_LABEL[kind] ?? kind}
                        </span>
                        <span className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
                          {formatCast(cast)} CAST · {formatFiat(cast)}
                        </span>
                      </div>
                      <Meter value={cast / maxKind} color={KIND_COLOR[kind] ?? "var(--brand-gradient)"} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </StudioCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {segments.length > 0 && (
            <StudioCard title="revenue by source" sub="settled CAST">
              <SegBar segments={segments} total={segTotal} />
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
                {segments.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="legdot" style={{ background: r.color }} />
                    <span style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }} className="lower">
                      {r.label}
                    </span>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>
                      {formatCast(r.cast)}
                    </span>
                  </div>
                ))}
              </div>
            </StudioCard>
          )}

          <div className="st-hint">
            analytics here are derived from settled transactions and video views — the live realtime metrics (concurrent
            viewers, retention curves) arrive with realtime in phase 5.
          </div>
        </div>
      </div>
    </div>
  );
}
