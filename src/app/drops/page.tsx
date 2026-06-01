// Drops index — /drops. The canonical destination for "drops · see all" (was /search?q=drops).
// Public, SSR. Lists live drops across channels (real products when a DB is attached, else the
// in-memory demo set), each linking to the seller's channel.
import type { Metadata } from "next";
import Link from "next/link";
import { listTopCreators } from "@/lib/queries/public";
import { buildMetadata } from "@/lib/seo/meta";
import { PublicShell } from "@/components/app/PublicShell";
import { channelHref } from "@/lib/links";
import { catImage, reliableImage } from "@/lib/img";
import { SmartImg } from "@/components/ui/SmartImg";
import { formatCast } from "@/lib/cast";
import { fxAllProducts } from "@/lib/fixtures";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "drops",
    description: "limited drops, merch and collectibles from creators — spend CAST.",
    path: "/drops",
  });
}

export default async function DropsPage() {
  // Channel categories (for representative imagery) + the demo drop catalogue.
  const creators = await listTopCreators(40).catch(() => []);
  const catByChannel = new Map<string, string>();
  for (const c of creators) {
    if (c.channel) catByChannel.set(c.channel.id, c.category ?? "");
    catByChannel.set(`ch-${c.id}`, c.category ?? "");
  }
  const drops = fxAllProducts();

  return (
    <PublicShell>
      <main className="page-pad" style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 96 }}>
        <div style={{ margin: "8px 0 22px" }}>
          <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            store
          </div>
          <h1 className="lower" style={{ margin: "6px 0 0", fontSize: "clamp(26px, 3.4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            drops
          </h1>
          <div style={{ fontSize: 14, color: "var(--ink-3)", marginTop: 6 }} className="lower">
            limited drops, merch and collectibles — spend CAST. {drops.length} live now.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {drops.map((p) => {
            const cat = catByChannel.get(p.channelId) ?? "";
            return (
              <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div className="thumb" style={{ aspectRatio: "4/3", borderRadius: 0 }}>
                  <SmartImg src={p.imgUrl || catImage(cat, p.id)} fallback={reliableImage(p.id, 480, 360)} />
                  <div className="thumb-overlay" />
                  <span style={{ position: "absolute", top: 10, left: 10, fontSize: 10, fontWeight: 800, color: "white", background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 6, letterSpacing: "0.1em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
                    {p.kind}
                  </span>
                </div>
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                  {p.edition && (
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{p.edition}</div>
                  )}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span className="tnum brand-grad-text" style={{ fontWeight: 800, fontSize: 20 }}>{formatCast(p.priceCast)}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
                    </div>
                    <Link href={channelHref(p.handle)} className="btn btn-grad lower" style={{ padding: "8px 14px", fontSize: 12, textDecoration: "none" }}>
                      view
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </PublicShell>
  );
}
