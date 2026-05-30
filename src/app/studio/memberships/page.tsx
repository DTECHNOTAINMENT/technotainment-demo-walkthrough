/**
 * /studio/memberships — tier manager ported to match prototype/v4/studio-audience.jsx
 * memberships screen: an MRR summary strip with a SegBar split across tiers, then a grid of
 * tier cards (`.tier-edit`) showing monthly CAST price, member counts, MRR and perks. Read-only
 * ("new tier" stub). Data via listTiers(); money formatted at the edge.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listTiers } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import { StudioPageHead, Pill, SegBar, type SegBarSegment } from "@/components/studio-ui";

export const dynamic = "force-dynamic";

const TIER_COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

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

  const segments: SegBarSegment[] = tiers.map((t, i) => ({
    id: t.id,
    label: t.name,
    cast: t._count.memberships * t.priceCast,
    color: TIER_COLORS[i % TIER_COLORS.length],
  }));
  const segTotal = segments.reduce((a, s) => a + s.cast, 0) || 1;

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="memberships"
        sub="design your tiers, set monthly CAST pricing, and decide what each tier unlocks."
        actions={
          <button className="btn btn-grad lower" style={{ padding: "12px 18px" }} disabled title="coming soon">
            <Icon name="plus" size={15} stroke={2.6} /> new tier
          </button>
        }
      />

      {/* MRR strip */}
      <div className="card" style={{ background: "var(--surface)", padding: 18, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
        <div>
          <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            monthly recurring revenue
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span className="brand-grad-text tnum stat-num" style={{ fontSize: 34 }}>
              {formatCast(mrrCast)}
            </span>
            <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
              CAST / mo · {formatFiat(mrrCast)}
            </span>
          </div>
        </div>
        {segments.length > 0 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <SegBar segments={segments} total={segTotal} />
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              {segments.map((t) => (
                <span key={t.id} className="lower" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-3)" }}>
                  <span className="legdot" style={{ background: t.color }} /> {t.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {tiers.length === 0 ? (
        <div className="card" style={{ background: "var(--surface)", padding: 40, textAlign: "center", border: "1px dashed var(--hairline-2)" }}>
          <div className="lower" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            no tiers yet
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>
            create a membership tier to start earning recurring CAST.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          {tiers.map((t, i) => {
            const members = t._count.memberships;
            const color = TIER_COLORS[i % TIER_COLORS.length];
            return (
              <div key={t.id} className={`tier-edit ${t.popular ? "popular" : ""}`}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="lower" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                      <span className="legdot" style={{ background: color, borderRadius: "50%", width: 11, height: 11 }} /> {t.name}
                    </span>
                    {t.popular && <Pill tone="info">most popular</Pill>}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                    <span className="cast-glyph" style={{ width: 20, height: 20, fontSize: 11 }}>
                      c
                    </span>
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
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div
                    className="lower"
                    style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}
                  >
                    perks
                  </div>
                  {t.perks.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: "var(--ink-4)" }}>no perks set</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {t.perks.map((p, pi) => (
                        <div key={pi} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--ink-2)" }}>
                          <Icon name="check" size={14} stroke={2.6} style={{ color, flex: "0 0 14px", marginTop: 2 }} />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="st-hint" style={{ marginTop: 16 }}>
        changing a price never affects existing members — current subscribers keep their rate until they cancel. new
        pricing applies to new joins only.
      </div>
    </div>
  );
}
