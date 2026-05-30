/**
 * /studio/store — drops, pay-per-view, courses and merch sold in CAST. Ported to match
 * prototype/v4/studio-store.jsx: KPI StatCards, a product grid with cover art, kind/status
 * pills, a sales meter and per-card earnings. Read-only ("new product" is a stub — full CRUD
 * is out of scope for this phase). Data via listProducts(); money formatted at the edge.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listProducts } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import { StatCard, StudioPageHead, Pill, Meter, type PillTone } from "@/components/studio-ui";

export const dynamic = "force-dynamic";

const KIND_TONE: Record<string, PillTone> = {
  drop: "info",
  course: "ok",
  ppv: "warn",
  merch: "neutral",
};

export default async function StudioStorePage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const products = await listProducts(channelId);
  const revenue = products.reduce((a, p) => a + p.sold * p.priceCast, 0);
  const unitsSold = products.reduce((a, p) => a + p.sold, 0);
  const liveCount = products.filter((p) => p.status === "live").length;
  const topSold = products.reduce((m, p) => Math.max(m, p.sold), 0) || 1;

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="store"
        sub="drops, pay-per-view, courses and merch — sold in CAST, fulfilled by technotainment."
        actions={
          <button className="btn btn-grad lower" style={{ padding: "12px 18px" }} disabled title="coming soon">
            <Icon name="plus" size={15} stroke={2.6} /> new product
          </button>
        }
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard label="store revenue" icon="cast" value={formatCast(revenue)} unit="CAST" fiat={formatFiat(revenue)} />
        <StatCard label="units sold" icon="bag" value={formatCast(unitsSold)} unit="all time" fiat={`across ${products.length} products`} sparkColor="#06b6d4" />
        <StatCard label="live products" icon="check" value={String(liveCount)} unit="published" fiat={`${products.length - liveCount} draft`} sparkColor="#10b981" />
        <StatCard label="catalogue" icon="trend" value={String(products.length)} unit="total" sparkColor="#ec4899" />
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ background: "var(--surface)", padding: 40, textAlign: "center", marginTop: 18, border: "1px dashed var(--hairline-2)" }}>
          <div className="lower" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            no products yet
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>
            drops, ppv, courses and merch you publish will appear here.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginTop: 18 }}>
          {products.map((p) => (
            <div key={p.id} className="card" style={{ background: "var(--surface)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div
                className="thumb"
                style={{ backgroundImage: `url(${p.imgUrl})`, aspectRatio: "16/10", borderRadius: 0, position: "relative" }}
              >
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <Pill tone={KIND_TONE[p.kind] ?? "neutral"}>{p.kind}</Pill>
                  {p.status === "draft" && <Pill tone="neutral">draft</Pill>}
                </div>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>
                    {p.edition ?? p.kind}
                    {p.stock != null ? ` · ${p.stock} in stock` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="tnum" style={{ fontSize: 16, fontWeight: 800 }}>
                    <span className="cast-glyph" style={{ width: 16, height: 16, fontSize: 9, verticalAlign: -2 }}>
                      c
                    </span>{" "}
                    {formatCast(p.priceCast)}
                  </span>
                  <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    <span className="tnum">{formatCast(p.sold)}</span> sold
                  </span>
                </div>
                <Meter value={p.sold / topSold} />
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
                  {formatFiat(p.priceCast)} each · {formatCast(p.sold * p.priceCast)} CAST earned
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
