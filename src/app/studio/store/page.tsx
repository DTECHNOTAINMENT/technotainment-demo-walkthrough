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
import { StatCard, StudioPageHead } from "@/components/studio-ui";
import { StStore } from "@/components/studio/StStore";

export const dynamic = "force-dynamic";

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

  return (
    <div className="page-pad" style={{ maxWidth: 1400, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="store"
        sub="drops, pay-per-view, courses and merch — sold in CAST, fulfilled by technotainment."
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard label="store revenue" icon="cast" value={formatCast(revenue)} unit="CAST" fiat={formatFiat(revenue)} />
        <StatCard label="units sold" icon="bag" value={formatCast(unitsSold)} unit="all time" fiat={`across ${products.length} products`} sparkColor="#06b6d4" />
        <StatCard label="live products" icon="check" value={String(liveCount)} unit="published" fiat={`${products.length - liveCount} draft`} sparkColor="#10b981" />
        <StatCard label="catalogue" icon="trend" value={String(products.length)} unit="total" sparkColor="#ec4899" />
      </div>

      <div style={{ marginTop: 18 }}>
        <StStore
          initial={products.map((p) => ({
            id: p.id,
            kind: p.kind,
            name: p.name,
            priceCast: p.priceCast,
            edition: p.edition,
            imgUrl: p.imgUrl,
            status: p.status,
            sold: p.sold,
            stock: p.stock,
          }))}
        />
      </div>
    </div>
  );
}
