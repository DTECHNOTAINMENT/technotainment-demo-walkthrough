"use client";

// Store tab — product grid + filter chips, mirrors microcast.jsx's store.
// Chips: all | drops | courses | merch | ppv. Filters client-side by product.kind.
// Each product "buy" POSTs to /api/spend (drop/ppv) like SupportBar; no-DB safe.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCast, formatFiat } from "@/lib/cast";
import { reliableImage } from "@/lib/img";
import { SmartImg } from "@/components/ui/SmartImg";

export interface ChannelStoreProduct {
  id: string;
  name: string;
  priceCast: number;
  kind: "drop" | "ppv" | "course" | "merch";
  edition?: string | null;
  imgUrl: string;
}

const FILTERS = [
  { id: "all", label: "all" },
  { id: "drop", label: "drops" },
  { id: "course", label: "courses" },
  { id: "merch", label: "merch" },
  { id: "ppv", label: "ppv" },
] as const;

export function ChannelStore({ channelId, products }: { channelId: string; products: ChannelStoreProduct[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(
    () => (filter === "all" ? products : products.filter((p) => p.kind === filter)),
    [filter, products],
  );

  async function buy(p: ChannelStoreProduct) {
    if (busy) return;
    setBusy(p.id);
    setError(null);
    setConfirm(null);
    const kind = p.kind === "ppv" ? "ppv" : "drop";
    try {
      const res = await fetch("/api/spend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, cast: p.priceCast, channelId, productId: p.id }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data: { balance?: number; error?: string } = await res.json();
      if (!res.ok || typeof data.balance !== "number") {
        setError(data.error ?? "something went wrong");
        return;
      }
      setConfirm(`bought ${p.name} · balance ${formatCast(data.balance)} CAST`);
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip${filter === f.id ? " active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(confirm || error) && (
        <div
          className="lower"
          style={{ fontSize: 12, marginBottom: 14, color: error ? "var(--bg-red)" : "#10b981" }}
        >
          {error ?? `${confirm} ✓`}
        </div>
      )}

      {shown.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {shown.map((p) => (
            <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div
                className="thumb"
                style={{ aspectRatio: "4 / 3", borderRadius: 0 }}
              >
                <SmartImg src={p.imgUrl} fallback={reliableImage(p.id, 480, 360)} />
                <div className="thumb-overlay" />
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    fontSize: 10,
                    fontWeight: 800,
                    color: "white",
                    background: "rgba(0,0,0,0.65)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  {p.kind}
                </span>
              </div>
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                {p.edition && <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.edition}</div>}
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="tnum brand-grad-text" style={{ fontWeight: 800, fontSize: 20 }}>{formatCast(p.priceCast)}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST · {formatFiat(p.priceCast)}</span>
                  </div>
                  <button
                    onClick={() => void buy(p)}
                    className="btn btn-grad lower"
                    style={{ padding: "8px 14px", fontSize: 12 }}
                    disabled={busy !== null}
                  >
                    {busy === p.id ? "…" : "buy"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="lower" style={{ color: "var(--ink-3)" }}>nothing here yet.</p>
      )}
    </>
  );
}

export default ChannelStore;
