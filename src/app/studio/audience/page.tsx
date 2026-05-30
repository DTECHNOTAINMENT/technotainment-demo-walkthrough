/**
 * /studio/audience — the member roster: who's paying, on which tier, since when.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listMembers, listTiers } from "@/lib/queries/studio";
import { formatCast } from "@/lib/cast";
import { SxPageHead, SxCard, SxStat, SxEmpty, SxMeter, SX_PAGE } from "@/components/studio-x/SxPrimitives";

export const dynamic = "force-dynamic";

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
  const byTier = tiers.map((t) => ({ name: t.name, count: t._count.memberships }));

  return (
    <div style={SX_PAGE}>
      <SxPageHead
        title="audience"
        sub="who's paying and how your community is growing — within the consent each person granted you."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
        <SxStat label="members" value={formatCast(totalMembers)} unit="paying" grad />
        <SxStat label="tiers" value={String(tiers.length)} unit="active" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(260px,1fr)", gap: 16, alignItems: "start" }}>
        <SxCard title="members" sub={`${formatCast(totalMembers)} paying · most recent first`} pad={false}>
          {members.length === 0 ? (
            <div style={{ padding: 18 }}>
              <SxEmpty title="no members yet" hint="paying members appear here once they join a tier." />
            </div>
          ) : (
            <>
              <RosterRow head>
                <span>member</span>
                <span>tier</span>
                <span style={{ textAlign: "right" }}>joined</span>
              </RosterRow>
              {members.map((m) => (
                <RosterRow key={m.id}>
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
                </RosterRow>
              ))}
            </>
          )}
        </SxCard>

        <SxCard title="members by tier">
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
                  <SxMeter pct={totalMembers ? (t.count / totalMembers) * 100 : 0} />
                </div>
              ))}
            </div>
          )}
        </SxCard>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 16 }}>
        audience data here is aggregated and consent-scoped — you only ever see what each viewer allowed.
      </p>
    </div>
  );
}

function RosterRow({ children, head = false }: { children: React.ReactNode; head?: boolean }) {
  return (
    <div
      className={head ? "lower" : undefined}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 150px 110px",
        gap: 12,
        alignItems: "center",
        padding: "12px 18px",
        borderBottom: "1px solid var(--hairline)",
        fontSize: head ? 10.5 : 13,
        fontWeight: head ? 800 : undefined,
        letterSpacing: head ? "0.06em" : undefined,
        textTransform: head ? "uppercase" : undefined,
        color: head ? "var(--ink-4)" : undefined,
      }}
    >
      {children}
    </div>
  );
}
