// Home drops rail — ported from prototype/v4/extras.jsx DropsScreen (DropTile) + data.jsx DROPS.
// A horizontal scrollable rail of drop products below the live grid. There's no products query
// wired into home, so these are a small demo list shaped like the prototype's DROPS (4:5 image,
// edition badge, name, price in CAST, buy button). Additive — the live grid is untouched.
// The buy action links into the drops/search surface (no checkout wired here).
import Link from "next/link";
import { formatNum, type CreatorLike } from "@/components/ui/primitives";
import { catImage } from "@/lib/img";

interface Drop {
  id: string;
  name: string;
  edition: string;
  price: number; // CAST
  category: string;
  handle: string;
  creator: CreatorLike;
}

const DROPS: Drop[] = [
  { id: "D1", name: "small bowl · kiln drop 048", edition: "62 / 150", price: 180, category: "ceramics", handle: "@marlowe", creator: { name: "Marlowe Reed", handle: "@marlowe", brand: "#f59e0b", brand2: "#ef4444" } },
  { id: "D2", name: "kavi's house apron", edition: "ships worldwide", price: 240, category: "live cooking", handle: "@kavi", creator: { name: "Kavi Anand", handle: "@kavi", brand: "#10b981", brand2: "#22c55e" } },
  { id: "D3", name: "field recordings · vol 4", edition: "98 / 200", price: 120, category: "modular synth", handle: "@nyx", creator: { name: "Nyx Okafor", handle: "@nyx", brand: "#8b5cf6", brand2: "#ec4899" } },
  { id: "D4", name: "ink drawing · sat 4-hour", edition: "1 of 1", price: 320, category: "illustration", handle: "@joon", creator: { name: "Joon Park", handle: "@joon", brand: "#06b6d4", brand2: "#3b82f6" } },
  { id: "D5", name: "rooftop · live mix · 96k flac", edition: "rentable", price: 80, category: "afro-fusion dj", handle: "@kola", creator: { name: "Kola Diallo", handle: "@kola", brand: "#f43f5e", brand2: "#f59e0b" } },
  { id: "D6", name: "frame-by-frame · tre flip course", edition: "self-paced", price: 480, category: "street skate", handle: "@ines", creator: { name: "Inés Vidal", handle: "@ines", brand: "#3b82f6", brand2: "#8b5cf6" } },
];

function DropTile({ d }: { d: Drop }) {
  const channelHref = `/c/${d.handle.replace(/^@/, "")}`;
  return (
    <div className="tile" style={{ width: 220 }}>
      <Link href={channelHref} style={{ display: "block" }}>
        <div className="thumb" style={{ aspectRatio: "4 / 5", backgroundImage: `url(${catImage(d.category, d.id, 480, 600)})` }}>
          <div className="thumb-overlay" />
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span
              style={{ background: "rgba(0,0,0,0.65)", color: "white", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", backdropFilter: "blur(6px)" }}
            >
              {d.edition}
            </span>
          </div>
          <div style={{ position: "absolute", left: 10, bottom: 10, right: 10, color: "white" }}>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{d.name}</div>
            <div className="lower" style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{d.handle}</div>
          </div>
        </div>
      </Link>
      <div style={{ padding: "10px 2px 2px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span className="tnum" style={{ fontSize: 17, fontWeight: 800, color: "var(--ink-1)" }}>{formatNum(d.price)}</span>
          <span className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
        </div>
        <Link href={channelHref} className="btn btn-grad lower" style={{ padding: "7px 12px", fontSize: 11 }}>
          buy
        </Link>
      </div>
    </div>
  );
}

export function DropsRail() {
  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div className="lower" style={{ fontWeight: 800, fontSize: 18 }}>drops</div>
        <Link href="/search?q=drops" className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
          see all &rarr;
        </Link>
      </div>
      <div className="rail" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
        {DROPS.map((d) => (
          <DropTile key={d.id} d={d} />
        ))}
      </div>
    </section>
  );
}
