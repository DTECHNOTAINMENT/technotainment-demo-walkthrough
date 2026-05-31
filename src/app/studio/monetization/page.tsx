/**
 * /studio/monetization — the creator's earning control center, ported to match
 * prototype/v4/studio-monetization.jsx. Shows an MRR/summary stat row, the membership
 * tier cards grid (price CAST/mo + fiat, perks, member counts, per-tier MRR, "most members"
 * highlight), and a revenue-levers section (the streams the prototype's switchboard exposes).
 * Server-rendered, owner-scoped. Money is computed in integer CAST and formatted at the edge.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listTiers } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import {
  StudioPageHead,
  StudioCard,
  StatCard,
  Pill,
  SegBar,
  type SegBarSegment,
} from "@/components/studio-ui";
import { StMonetizationControls } from "@/components/studio/StMonetizationControls";

export const dynamic = "force-dynamic";

const TIER_COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

interface Lever {
  id: string;
  icon: string;
  color: string;
  title: string;
  sub: string;
  manage?: { label: string; href: string };
}

const LEVERS: Lever[] = [
  {
    id: "tips",
    icon: "tip",
    color: "#ec4899",
    title: "tips",
    sub: "one-off support on live streams, videos and your channel page.",
  },
  {
    id: "ppv",
    icon: "film",
    color: "#f97316",
    title: "pay-per-view",
    sub: "sell tickets to streams or rent recordings — priced per video in content.",
    manage: { label: "open content", href: "/studio/content" },
  },
  {
    id: "store",
    icon: "bag",
    color: "#06b6d4",
    title: "store · drops, courses & merch",
    sub: "sell digital downloads, courses and physical goods.",
    manage: { label: "open store", href: "/studio/store" },
  },
  {
    id: "gifts",
    icon: "gift",
    color: "#10b981",
    title: "gifted subscriptions",
    sub: "let viewers buy memberships for others — a great live-stream growth driver.",
  },
];

export default async function StudioMonetizationPage() {
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
  const avgCast = totalMembers > 0 ? Math.round(mrrCast / totalMembers) : 0;

  // "most members" highlight: the tier carrying the largest active membership count.
  const topMembers = tiers.reduce((max, t) => Math.max(max, t._count.memberships), 0);

  const segments: SegBarSegment[] = tiers.map((t, i) => ({
    id: t.id,
    label: t.name,
    cast: t._count.memberships * t.priceCast,
    color: TIER_COLORS[i % TIER_COLORS.length],
  }));
  const segTotal = segments.reduce((a, s) => a + s.cast, 0) || 1;

  // switchboard summary: memberships + tips + the 4 levers are on; goals ships off.
  const totalStreams = 6;
  const activeStreams = 5;

  return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="monetization"
        sub="choose how you earn. your membership tiers drive recurring revenue — tune pricing and perks, and turn on the other ways your audience can support you."
        actions={
          <Link href="/studio/earnings" className="btn btn-glass lower" style={{ padding: "12px 16px", textDecoration: "none" }}>
            <Icon name="wallet" size={14} stroke={2.2} /> earnings
          </Link>
        }
      />

      {/* MRR / summary stat row */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <StatCard
          icon="trend"
          label="monthly recurring revenue"
          value={<span className="brand-grad-text">{formatCast(mrrCast)}</span>}
          unit="CAST / mo"
          fiat={`${formatFiat(mrrCast)} / mo`}
        />
        <StatCard icon="heart" label="active members" value={formatCast(totalMembers)} unit="members" />
        <StatCard
          icon="cast"
          label="avg member value"
          value={formatCast(avgCast)}
          unit="CAST / mo"
          fiat={`${formatFiat(avgCast)} / mo`}
        />
        <StatCard label="membership tiers" value={formatCast(tiers.length)} unit="live" />
      </div>

      {/* Revenue split across tiers */}
      {segments.length > 0 && (
        <div
          className="card"
          style={{ background: "var(--surface)", padding: 18, marginBottom: 22, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}
        >
          <div>
            <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              membership revenue split
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6 }}>
              <span className="tnum" style={{ color: "var(--ink-1)", fontWeight: 700 }}>{formatCast(mrrCast)}</span> CAST / mo across {formatCast(tiers.length)} tiers
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <SegBar segments={segments} total={segTotal} />
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              {segments.map((t) => (
                <span key={t.id} className="lower" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-3)" }}>
                  <span className="legdot" style={{ background: t.color }} /> {t.label} · {Math.round((t.cast / segTotal) * 100)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Membership tier cards */}
      <div className="lower" style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-2)", margin: "0 0 12px" }}>
        membership tiers
      </div>

      {tiers.length === 0 ? (
        <div className="card" style={{ background: "var(--surface)", padding: 40, textAlign: "center", border: "1px dashed var(--hairline-2)" }}>
          <div className="lower" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            no tiers yet
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>
            create a membership tier in <Link href="/studio/memberships" style={{ color: "var(--ink-2)" }}>memberships</Link> to start earning recurring CAST.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
          {tiers.map((t, i) => {
            const members = t._count.memberships;
            const color = TIER_COLORS[i % TIER_COLORS.length];
            const mostMembers = members > 0 && members === topMembers;
            return (
              <div key={t.id} className={`tier-edit ${mostMembers ? "popular" : ""}`}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span className="lower" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                      <span className="legdot" style={{ background: color, borderRadius: "50%", width: 11, height: 11 }} /> {t.name}
                    </span>
                    {mostMembers ? <Pill tone="info">most members</Pill> : t.popular ? <Pill tone="ok">popular</Pill> : null}
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

      {/* Active revenue streams summary — the prototype's "X of 6 turned on" switchboard header */}
      <div
        className="card"
        style={{ background: "var(--surface)", padding: 18, margin: "26px 0 16px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}
      >
        <div>
          <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            active revenue streams
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
            <span className="brand-grad-text tnum stat-num" style={{ fontSize: 32 }}>
              {activeStreams}
            </span>
            <span className="lower" style={{ color: "var(--ink-3)", fontSize: 13, fontWeight: 700 }}>
              of {totalStreams} turned on
            </span>
          </div>
        </div>
        <div className="mono" style={{ flex: 1, minWidth: 220, fontSize: 11.5, color: "var(--ink-3)" }}>
          memberships, tips, pay-per-view, store and gifted subs are live — goals are off until you set one below.
        </div>
      </div>

      {/* Revenue levers — the other ways to earn (the prototype's switchboard) */}
      <div className="lower" style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-2)", margin: "26px 0 12px" }}>
        more ways to earn
      </div>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
        {LEVERS.map((l) => (
          <StudioCard key={l.id}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: l.color,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flex: "0 0 44px",
                }}
              >
                <Icon name={l.icon} size={20} stroke={2.2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                    {l.title}
                  </span>
                  <Pill tone="ok">on</Pill>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{l.sub}</div>
                {l.manage && (
                  <Link
                    href={l.manage.href}
                    className="btn btn-glass lower"
                    style={{ marginTop: 12, padding: "9px 13px", fontSize: 12.5, textDecoration: "none", display: "inline-flex" }}
                  >
                    {l.manage.label} <Icon name="arrowR" size={13} stroke={2.2} />
                  </Link>
                )}
              </div>
            </div>
          </StudioCard>
        ))}
      </div>

      {/* Configure each stream — editable tip presets, ppv access window, optional goals */}
      <div className="lower" style={{ fontSize: 13, fontWeight: 800, color: "var(--ink-2)", margin: "26px 0 0" }}>
        configure your streams
      </div>
      <StMonetizationControls totalMembers={totalMembers} mrrCast={mrrCast} />

      <div className="st-hint" style={{ marginTop: 18 }}>
        changing a tier price never affects existing members — current subscribers keep their rate until they cancel.
        turning a stream off hides it from your audience immediately; existing members or rentals are never interrupted.
      </div>
    </div>
  );
}
