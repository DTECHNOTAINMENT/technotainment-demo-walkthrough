/**
 * /studio/audience — the member roster ported to match prototype/v4/studio-audience.jsx:
 * KPI StatCards, a `.st-row` member table (avatar + handle + tier + joined date), and a
 * "members by tier" card with Meters. Consent-scoped. Data via listMembers()/listTiers().
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listMembers, listTiers } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { StatCard, StudioCard, StudioPageHead, Meter, AreaSpark } from "@/components/studio-ui";

export const dynamic = "force-dynamic";

const TIER_COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

// 12-month member-growth series + month labels (demo shape; realtime growth lands in phase 5).
const MEMBER_SERIES = [612, 690, 745, 812, 905, 988, 1074, 1180, 1262, 1340, 1418, 1505];
const MONTHS = ["jun", "jul", "aug", "sep", "oct", "nov", "dec", "jan", "feb", "mar", "apr", "may"];

// "where they watch" — top surfaces, 30 days (demo; consent-scoped aggregate).
const SURFACES: [string, number][] = [
  ["microcast page", 46],
  ["live stream", 31],
  ["small rooms metacast", 14],
  ["search & explore", 9],
];

export default async function StudioAudiencePage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const [members, tiers] = await Promise.all([listMembers(channelId), listTiers(channelId)]);
  const totalMembers = members.length;
  const byTier = tiers.map((t, i) => ({ name: t.name, count: t._count.memberships, color: TIER_COLORS[i % TIER_COLORS.length] }));
  const ROW = "1fr 150px 90px 110px";

  // MRR = sum of each member's locked monthly price. churn is a derived demo aggregate.
  const mrrCast = members.reduce((a, m) => a + m.priceCastLocked, 0);
  const churnPct = 2.3;
  // lifetime CAST per member: locked monthly price × whole months active since they joined.
  const now = Date.now();
  const lifetime = (m: (typeof members)[number]): number => {
    const months = Math.max(1, Math.round((now - new Date(m.startedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return m.priceCastLocked * months;
  };
  // "new this period" — members who joined in the last 30 days.
  const newThisPeriod = members.filter((m) => now - new Date(m.startedAt).getTime() < 1000 * 60 * 60 * 24 * 30).length;

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="audience"
        sub="who's watching, who's paying, and how your community is growing — within the consent each person granted you."
      />

      <div className="kpi-grid">
        <StatCard
          label="members"
          icon="heart"
          value={formatCast(totalMembers)}
          unit="paying"
          fiat={`${formatCast(newThisPeriod)} new this period`}
          sparkColor="#ec4899"
        />
        <StatCard
          label="mrr"
          icon="cast"
          value={formatCast(mrrCast)}
          unit="CAST / mo"
          fiat={`${formatFiat(mrrCast)} / mo`}
          sparkColor="#8b5cf6"
        />
        <StatCard
          label="churn"
          icon="trend"
          value={`${churnPct}%`}
          unit="monthly"
          delta="−0.4%"
          deltaUp={false}
          fiat="cancellations vs. last period"
          sparkColor="#10b981"
        />
        <StatCard label="tiers" icon="cast" value={String(tiers.length)} unit="active" />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="member growth · 12 months" sub="net paying members">
            <AreaSpark data={MEMBER_SERIES} h={200} stroke="#ec4899" fill="rgba(236,72,153,0.2)" />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {MONTHS.filter((_, i) => i % 2 === 0).map((m) => (
                <span key={m} className="mono" style={{ fontSize: 10, color: "var(--ink-4)" }}>
                  {m}
                </span>
              ))}
            </div>
          </StudioCard>

          <StudioCard title="members" sub={`${formatCast(totalMembers)} paying · most recent first`} pad={false}>
            {members.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <p className="lower" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
                  no members yet — paying members appear here once they join a tier.
                </p>
              </div>
            ) : (
              <div className="tbl-scroll">
                <div style={{ minWidth: 520 }}>
                <div className="st-row head" style={{ gridTemplateColumns: ROW }}>
                  <span>member</span>
                  <span>tier</span>
                  <span style={{ textAlign: "right" }}>since</span>
                  <span style={{ textAlign: "right" }}>lifetime</span>
                </div>
                {members.map((m) => (
                  <div key={m.id} className="st-row" style={{ gridTemplateColumns: ROW }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "var(--surface-3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 800,
                          color: "var(--ink-2)",
                          flex: "0 0 34px",
                        }}
                      >
                        {m.user.handle.replace(/^@/, "").slice(0, 2).toUpperCase()}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.user.displayName ?? m.user.handle}
                        </div>
                        <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                          {m.user.handle}
                        </div>
                      </div>
                    </div>
                    <div className="lower" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                      {m.tier.name}
                    </div>
                    <div className="lower" style={{ textAlign: "right", fontSize: 12, color: "var(--ink-3)" }}>
                      {new Date(m.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                      {formatCast(lifetime(m))}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </StudioCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="members by tier">
            {byTier.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-4)" }}>no tiers yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {byTier.map((t) => (
                  <div key={t.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                        {t.name}
                      </span>
                      <span className="tnum" style={{ fontSize: 13, fontWeight: 800 }}>
                        {formatCast(t.count)}
                      </span>
                    </div>
                    <Meter value={totalMembers ? t.count / totalMembers : 0} color={t.color} />
                  </div>
                ))}
              </div>
            )}
          </StudioCard>

          <StudioCard title="where they watch" sub="top surfaces · 30 days">
            {SURFACES.map(([k, v]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span className="lower" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                    {k}
                  </span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                    {v}%
                  </span>
                </div>
                <Meter value={v / 100} />
              </div>
            ))}
          </StudioCard>

          <div className="st-hint">
            audience data here is aggregated and consent-scoped. you only ever see what each viewer allowed in their
            privacy settings — and their copy is deleted within 7 days of withdrawal.
          </div>
        </div>
      </div>
    </div>
  );
}
