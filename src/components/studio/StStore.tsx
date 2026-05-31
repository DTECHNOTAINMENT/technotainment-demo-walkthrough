"use client";

/**
 * StStore — client store manager. Owns the kind filter chips, the product grid (cover art,
 * kind/status pills, sales meter, per-card earnings) and the "new product" modal. There is no
 * create-product API yet, so submitting the modal adds an optimistic card to local state and
 * shows a "saved in demo" note (honest). Mirrors prototype/v4/studio-store.jsx.
 */
import { useMemo, useState } from "react";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import { Pill, Meter, type PillTone } from "@/components/studio-ui";

export interface StoreProduct {
  id: string;
  kind: string;
  name: string;
  priceCast: number;
  edition: string | null;
  imgUrl: string | null;
  status: string;
  sold: number;
  stock: number | null;
}

const KIND_TONE: Record<string, PillTone> = {
  drop: "info",
  course: "ok",
  ppv: "warn",
  merch: "neutral",
};

const KIND_META: { id: string; label: string; icon: string }[] = [
  { id: "drop", label: "drop", icon: "bag" },
  { id: "ppv", label: "ppv", icon: "film" },
  { id: "course", label: "course", icon: "bookmark" },
  { id: "merch", label: "merch", icon: "gift" },
];

const FILTERS = ["all", "drop", "ppv", "course", "merch"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: "1px solid var(--hairline)",
  background: "var(--surface-2)",
  color: "var(--ink-1)",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  marginBottom: 8,
};

export function StStore({ initial }: { initial: StoreProduct[] }) {
  const [products, setProducts] = useState<StoreProduct[]>(initial);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const list = useMemo(
    () => products.filter((p) => (filter === "all" ? true : p.kind === filter)),
    [products, filter],
  );
  const topSold = products.reduce((m, p) => Math.max(m, p.sold), 0) || 1;

  function addProduct(p: StoreProduct) {
    setProducts((cur) => [p, ...cur]);
    setOpen(false);
  }

  return (
    <>
      {/* kind filter chips + new product */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
              style={{ padding: "7px 14px", fontSize: 12.5 }}
            >
              <span className="lower">{f === "all" ? "all products" : f}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn btn-grad lower" style={{ padding: "10px 16px" }}>
          <Icon name="plus" size={15} stroke={2.6} /> new product
        </button>
      </div>

      {list.length === 0 ? (
        <div className="card" style={{ background: "var(--surface)", padding: 40, textAlign: "center", border: "1px dashed var(--hairline-2)" }}>
          <div className="lower" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-2)" }}>
            nothing here yet
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>
            create a {filter === "all" ? "product" : filter} to fill this shelf.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {list.map((p) => (
            <div key={p.id} className="card" style={{ background: "var(--surface)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div
                className="thumb"
                style={{ backgroundImage: p.imgUrl ? `url(${p.imgUrl})` : undefined, aspectRatio: "16/10", borderRadius: 0, position: "relative", background: p.imgUrl ? undefined : "var(--surface-2)" }}
              >
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  <Pill tone={KIND_TONE[p.kind] ?? "neutral"}>{p.kind}</Pill>
                  {p.status !== "live" && <Pill tone="neutral">{p.status}</Pill>}
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

      {open && <NewProductModal onClose={() => setOpen(false)} onCreate={addProduct} />}
    </>
  );
}

function NewProductModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: StoreProduct) => void }) {
  const [kind, setKind] = useState("drop");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(180);
  const [edition, setEdition] = useState("");

  function submit() {
    if (!name.trim()) return;
    onCreate({
      id: `local-${Date.now()}`,
      kind,
      name: name.trim(),
      priceCast: Math.max(0, Math.round(price) || 0),
      edition: edition.trim() || null,
      imgUrl: `https://picsum.photos/seed/${encodeURIComponent(name.trim())}/640/400`,
      status: "live",
      sold: 0,
      stock: kind === "merch" ? 150 : null,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ background: "var(--surface)", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
            new product
          </div>
          <button type="button" onClick={onClose} aria-label="close" style={{ color: "var(--ink-3)" }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle} className="lower">
              type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {KIND_META.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setKind(m.id)}
                  className="card"
                  style={{
                    padding: "14px 8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    background: kind === m.id ? "var(--surface-2)" : "var(--surface)",
                    borderColor: kind === m.id ? "var(--hairline-2)" : "var(--hairline)",
                    boxShadow: "none",
                  }}
                >
                  <Icon name={m.icon} size={20} stroke={2} style={{ color: kind === m.id ? "var(--ink-1)" : "var(--ink-3)" }} />
                  <span className="lower" style={{ fontSize: 11.5, fontWeight: 700, color: kind === m.id ? "var(--ink-1)" : "var(--ink-3)" }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle} className="lower">
              name
            </label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={kind === "merch" ? "patch-sheet riso poster" : kind === "course" ? "intro to modular routing" : "field recordings · vol 5"}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle} className="lower">
                price · CAST
              </label>
              <input
                className="tnum"
                style={inputStyle}
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Math.max(0, Math.round(Number(e.target.value) || 0)))}
              />
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }}>
                {formatFiat(Math.max(0, Math.round(price) || 0))}
              </div>
            </div>
            <div>
              <label style={labelStyle} className="lower">
                {kind === "ppv" ? "access window" : kind === "merch" ? "stock qty" : "edition"}
              </label>
              <input
                style={inputStyle}
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder={kind === "ppv" ? "48h rental" : kind === "merch" ? "150" : "limited / open"}
              />
            </div>
          </div>
          <label
            className="dropzone"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 24, cursor: "pointer" }}
          >
            <input type="file" hidden />
            <Icon name="bag" size={22} stroke={2} style={{ color: "var(--ink-3)" }} />
            <div className="lower" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
              attach the file or cover art
            </div>
          </label>
          <button type="button" onClick={submit} disabled={!name.trim()} className="btn btn-grad lower" style={{ padding: 13, opacity: name.trim() ? 1 : 0.5 }}>
            publish to store
          </button>
          <div className="lower" style={{ fontSize: 11, color: "var(--ink-4)", textAlign: "center" }}>
            saved in demo · there&apos;s no create-product api yet, so this card lives in your session.
          </div>
        </div>
      </div>
    </div>
  );
}
