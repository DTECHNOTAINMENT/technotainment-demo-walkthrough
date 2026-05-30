/**
 * /studio/earnings — creator wallet: available/pending/paid balances, a withdraw panel
 * (SxWithdraw, with inline KYC), payout history, and saved payout methods.
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCreatorChannel } from "@/lib/studio";
import { earningsView } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { economy } from "@/lib/config";
import { SxWithdraw } from "@/components/studio-x/SxWithdraw";
import { SxCard, SxStat, SxEmpty, SxPill } from "@/components/studio-x/SxPrimitives";
import { StudioPageHead } from "@/components/studio-ui";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "ok" | "warn" | "neutral"> = {
  paid: "ok",
  held: "warn",
  pending: "neutral",
};

export default async function StudioEarningsPage() {
  let creatorId: string;
  let userId: string;
  try {
    const { creator } = await requireCreatorChannel();
    creatorId = creator.id;
    userId = creator.userId;
  } catch {
    redirect("/studio/onboarding");
  }

  const [{ summary, payouts, methods }, user] = await Promise.all([
    earningsView(creatorId),
    prisma.user.findUnique({ where: { id: userId }, select: { kyc: true } }),
  ]);
  const kycVerified = user?.kyc === "verified";

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="earnings"
        sub="your CAST balance, payouts to your bank, and a plain-language breakdown of every fee."
      />

      {/* balance hero */}
      <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <div className="brand-hairline" />
        <div style={{ padding: "26px 24px" }}>
          <div
            className="lower"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}
          >
            available to withdraw
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
            <span className="cast-glyph">c</span>
            <span className="tnum brand-grad-text stat-num" style={{ fontSize: "clamp(44px,7vw,72px)", fontWeight: 800 }}>
              {formatCast(summary.availableCast)}
            </span>
            <span className="lower" style={{ fontSize: 16, color: "var(--ink-3)", fontWeight: 700 }}>
              CAST
            </span>
          </div>
          <div className="mono" style={{ marginTop: 8, fontSize: 13, color: "var(--ink-3)" }}>
            = {formatFiat(summary.availableCast)} · {formatCast(summary.pendingCast)} CAST clearing (7-day hold)
          </div>
        </div>
      </div>

      {/* summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
        <SxStat label="gross · lifetime" value={formatCast(summary.grossCast)} unit="CAST" sub={formatFiat(summary.grossCast)} />
        <SxStat label="net · after 12% fee" value={formatCast(summary.netCast)} unit="CAST" sub={formatFiat(summary.netCast)} grad />
        <SxStat label="pending · clearing" value={formatCast(summary.pendingCast)} unit="CAST" sub={formatFiat(summary.pendingCast)} />
        <SxStat label="paid out" value={formatCast(summary.paidCast)} unit="CAST" sub={formatFiat(summary.paidCast)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(280px,1fr)", gap: 16, alignItems: "start" }}>
        {/* left — payout history */}
        <SxCard title="payout history" sub="withdrawals to your linked account" pad={false}>
          {payouts.length === 0 ? (
            <div style={{ padding: 18 }}>
              <SxEmpty title="no payouts yet" hint="withdraw your available CAST to see it here." />
            </div>
          ) : (
            <>
              <Row head>
                <span>reference · date</span>
                <span style={{ textAlign: "right" }}>CAST</span>
                <span style={{ textAlign: "right" }}>fiat</span>
                <span style={{ textAlign: "right" }}>status</span>
              </Row>
              {payouts.map((p) => (
                <Row key={p.id}>
                  <div>
                    <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>
                      {p.id}
                    </div>
                    <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                      {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                      {p.method}
                    </div>
                  </div>
                  <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                    {formatCast(p.cast)}
                  </div>
                  <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>
                    {p.netFiat ?? formatFiat(p.cast)}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <SxPill tone={STATUS_TONE[p.status] ?? "neutral"}>{p.status}</SxPill>
                  </div>
                </Row>
              ))}
            </>
          )}
        </SxCard>

        {/* right — withdraw + methods */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SxCard title="withdraw CAST" sub="cash out your cleared balance">
            <SxWithdraw
              availableCast={summary.availableCast}
              pendingCast={summary.pendingCast}
              minPayoutCast={economy.minPayoutCast}
              kycVerified={kycVerified}
              methods={methods.map((m) => ({ id: m.id, label: m.label, sub: m.sub }))}
            />
          </SxCard>

          <SxCard title="payout methods" sub="where your CAST cashes out">
            {methods.length === 0 ? (
              <SxEmpty title="no methods on file" hint="add one during onboarding or in settings." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {methods.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 13px",
                      border: "1px solid var(--hairline)",
                      borderRadius: 12,
                    }}
                  >
                    <span style={{ width: 40, height: 28, borderRadius: 6, background: "var(--brand-gradient)", flex: "0 0 40px" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                        {m.label}
                      </div>
                      <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                        {m.sub ?? m.methodId} · {m.fee}
                      </div>
                    </div>
                    {m.isDefault && <SxPill tone="ok">default</SxPill>}
                  </div>
                ))}
              </div>
            )}
          </SxCard>
        </div>
      </div>
    </div>
  );
}

function Row({ children, head = false }: { children: React.ReactNode; head?: boolean }) {
  return (
    <div
      className={head ? "lower" : undefined}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 110px 120px 90px",
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
