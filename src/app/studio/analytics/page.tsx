/**
 * /studio/analytics — lightweight reach + revenue summary derived from settled transactions and
 * video views, with a simple revenue-by-kind breakdown rendered as bars.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { analyticsSummary } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { SxPageHead, SxCard, SxStat, SxEmpty, SxMeter, SX_PAGE } from "@/components/studio-x/SxPrimitives";

export const dynamic = "force-dynamic";

const KIND_COLOR: Record<string, string> = {
  tip: "#ec4899",
  membership: "#8b5cf6",
  ppv: "#f59e0b",
  drop: "#06b6d4",
  gift: "#10b981",
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

  return (
    <div style={SX_PAGE}>
      <SxPageHead
        title="analytics"
        sub="revenue, reach and activity. everything you need to decide what to make next."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginBottom: 18 }}>
        <SxStat label="revenue" value={formatCast(revenueCast)} unit="CAST" sub={formatFiat(revenueCast)} grad />
        <SxStat label="total views" value={formatCast(totalViews)} unit="all videos" />
        <SxStat label="transactions" value={formatCast(txnCount)} unit="settled" />
      </div>

      <SxCard title="revenue by kind" sub="settled CAST, all time">
        {kinds.length === 0 ? (
          <SxEmpty title="no revenue yet" hint="tips, memberships, ppv and drops will break down here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {kinds.map(([kind, cast]) => (
              <div key={kind}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                    {kind}
                  </span>
                  <span className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
                    {formatCast(cast)} CAST · {formatFiat(cast)}
                  </span>
                </div>
                <SxMeter pct={(cast / maxKind) * 100} color={KIND_COLOR[kind] ?? "var(--brand-gradient)"} />
              </div>
            ))}
          </div>
        )}
      </SxCard>
    </div>
  );
}
