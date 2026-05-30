/**
 * /studio/memberships — tier manager. Cards per tier with monthly CAST price, member counts and
 * perks, plus an MRR roll-up across active members.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listTiers } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { SxPageHead, SxCard, SxStat, SxEmpty, SxPill, SX_PAGE } from "@/components/studio-x/SxPrimitives";

export const dynamic = "force-dynamic";

export default async function StudioMembershipsPage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const tiers = await listTiers(channelId);
  const totalMembers = tiers.reduce((a, t) => a + t._count.memberships, 0);
  const mrrCast = tiers.reduce((a, t) => a + t._count.memberships * t.priceCast, 0);

  return (
    <div style={SX_PAGE}>
      <SxPageHead
        title="memberships"
        sub="design your tiers, set monthly CAST pricing, and decide what each tier unlocks."
        actions={
          <button className="btn btn-grad lower" style={{ padding: "11px 16px" }} disabled title="coming soon">
            + new tier
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
        <SxStat label="monthly recurring revenue" value={formatCast(mrrCast)} unit="CAST/mo" sub={`${formatFiat(mrrCast)} / mo`} grad />
        <SxStat label="paying members" value={formatCast(totalMembers)} unit="active" />
        <SxStat label="tiers" value={String(tiers.length)} unit="published" />
      </div>

      {tiers.length === 0 ? (
        <SxEmpty title="no tiers yet" hint="create a membership tier to start earning recurring CAST." />
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          {tiers.map((t) => {
            const members = t._count.memberships;
            return (
              <SxCard
                key={t.id}
                title={t.name}
                action={t.popular ? <SxPill tone="info">most popular</SxPill> : undefined}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className="cast-glyph">c</span>
                  <span className="tnum" style={{ fontSize: 28, fontWeight: 800 }}>
                    {formatCast(t.priceCast)}
                  </span>
                  <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
                    CAST/mo
                  </span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
                  {formatFiat(t.priceCast)}/mo · {formatCast(members)} members · {formatCast(members * t.priceCast)} CAST mrr
                </div>

                <div
                  className="lower"
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--ink-3)",
                    margin: "16px 0 10px",
                  }}
                >
                  perks
                </div>
                {t.perks.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "var(--ink-4)" }}>no perks set</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {t.perks.map((p, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--ink-2)" }}>
                        <span style={{ color: "#10b981", fontWeight: 900, flex: "0 0 14px" }}>✓</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </SxCard>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 16 }}>
        changing a price never affects existing members — current subscribers keep their rate until they cancel.
      </p>
    </div>
  );
}
