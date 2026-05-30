/**
 * /studio/audience — the member roster ported to match prototype/v4/studio-audience.jsx:
 * KPI StatCards, a `.st-row` member table (avatar + handle + tier + joined date), and a
 * "members by tier" card with Meters. Consent-scoped. Data via listMembers()/listTiers().
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listMembers, listTiers } from "@/lib/queries/studio";
import { formatCast } from "@/lib/cast";
import { StatCard, StudioCard, StudioPageHead, Meter } from "@/components/studio-ui";

export const dynamic = "force-dynamic";

const TIER_COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

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
  const ROW = "1fr 150px 110px";

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="audience"
        sub="who's watching, who's paying, and how your community is growing — within the consent each person granted you."
      />

      <div className="kpi-grid">
        <StatCard label="members" icon="heart" value={formatCast(totalMembers)} unit="paying" sparkColor="#ec4899" />
        <StatCard label="tiers" icon="cast" value={String(tiers.length)} unit="active" />
      </div>

      <div className="st-split" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard title="members" sub={`${formatCast(totalMembers)} paying · most recent first`} pad={false}>
            {members.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <p className="lower" style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
                  no members yet — paying members appear here once they join a tier.
                </p>
              </div>
            ) : (
              <>
                <div className="st-row head" style={{ gridTemplateColumns: ROW }}>
                  <span>member</span>
                  <span>tier</span>
                  <span style={{ textAlign: "right" }}>joined</span>
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
                  </div>
                ))}
              </>
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

          <div className="st-hint">
            audience data here is aggregated and consent-scoped. you only ever see what each viewer allowed in their
            privacy settings — and their copy is deleted within 7 days of withdrawal.
          </div>
        </div>
      </div>
    </div>
  );
}
