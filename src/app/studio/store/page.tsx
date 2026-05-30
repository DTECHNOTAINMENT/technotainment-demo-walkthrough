/**
 * /studio/store — drops, pay-per-view, courses and merch sold in CAST. Read-only grid of the
 * channel's products; "new product" is a stub (full CRUD is out of scope for this phase).
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listProducts } from "@/lib/queries/studio";
import { formatCast, formatFiat } from "@/lib/cast";
import { SxPageHead, SxCard, SxStat, SxEmpty, SxPill, SxMeter, SX_PAGE } from "@/components/studio-x/SxPrimitives";

export const dynamic = "force-dynamic";

const KIND_TONE: Record<string, "info" | "ok" | "warn" | "neutral"> = {
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
    <div style={SX_PAGE}>
      <SxPageHead
        title="store"
        sub="drops, pay-per-view, courses and merch — sold in CAST, fulfilled by technotainment."
        actions={
          <button className="btn btn-grad lower" style={{ padding: "11px 16px" }} disabled title="coming soon">
            + new product
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 18 }}>
        <SxStat label="store revenue" value={formatCast(revenue)} unit="CAST" sub={formatFiat(revenue)} grad />
        <SxStat label="units sold" value={formatCast(unitsSold)} unit="all time" sub={`across ${products.length} products`} />
        <SxStat label="live products" value={String(liveCount)} unit="published" sub={`${products.length - liveCount} draft`} />
        <SxStat label="catalogue" value={String(products.length)} unit="total" />
      </div>

      {products.length === 0 ? (
        <SxEmpty title="no products yet" hint="drops, ppv, courses and merch you publish will appear here." />
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {products.map((p) => (
            <div key={p.id} className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  aspectRatio: "16 / 10",
                  backgroundImage: `url(${p.imgUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <SxPill tone={KIND_TONE[p.kind] ?? "neutral"}>{p.kind}</SxPill>
                  {p.status === "draft" && <SxPill tone="neutral">draft</SxPill>}
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
                    {formatCast(p.priceCast)} CAST
                  </span>
                  <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    <span className="tnum">{formatCast(p.sold)}</span> sold
                  </span>
                </div>
                <SxMeter pct={(p.sold / topSold) * 100} />
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
