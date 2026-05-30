// Receipt — /receipt/:id. Server-rendered, signed-in only, noindex.
// getReceipt scopes to the current user; notFound() when missing or not theirs.
// Presentation rebuilt to match prototype/v4/receipt.jsx (brand-hairline card, big
// CAST amount, line items, meta grid, footer). Data wiring (getReceipt) is unchanged.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getReceipt } from "@/lib/money";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "receipt",
  robots: { index: false, follow: false },
};

type Props = { params: { id: string } };

const KIND_LABEL: Record<string, string> = {
  topup: "top-up",
  tip: "tip",
  membership: "membership",
  drop: "drop",
  ppv: "ppv rental",
  gift: "gift",
};

const STATUS_COLOR: Record<string, string> = {
  settled: "#10b981",
  pending: "var(--ink-3)",
  reversed: "var(--bg-red)",
};

function fullDate(d: Date): string {
  return d.toLocaleString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function timeOf(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default async function ReceiptPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const receipt = await getReceipt(params.id, session.userId);
  if (!receipt) notFound();

  const positive = receipt.cast > 0;
  const amountCast = Math.abs(receipt.cast);
  const fiat = receipt.grossFiat ?? formatFiat(amountCast);

  const lines: { label: string; value: string; mono?: boolean }[] =
    receipt.kind === "topup"
      ? [
          { label: `CAST pack · ${formatCast(amountCast)}`, value: fiat },
          { label: "rate", value: "1:100 (£0.01 = 1 CAST)", mono: true },
          { label: "fee", value: "£0.00", mono: true },
        ]
      : [
          { label: `${KIND_LABEL[receipt.kind] ?? receipt.kind} · ${formatCast(amountCast)} CAST`, value: fiat },
          { label: "rate", value: "1:100 (£0.01 = 1 CAST)", mono: true },
        ];

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px 96px" }}>
      <Link href="/wallet" className="btn btn-glass lower" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 14 }}>
        <Icon name="chevL" size={14} stroke={2.4} /> back to wallet
      </Link>

      <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden" }}>
        <div className="brand-hairline" />
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
          {/* header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                receipt
              </div>
              <div className="mono" style={{ fontSize: 13, marginTop: 4, color: "var(--ink-2)" }}>{receipt.id}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{fullDate(receipt.createdAt)}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{timeOf(receipt.createdAt)}</div>
            </div>
          </div>

          {/* big amount */}
          <div style={{ padding: "20px 0", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", textAlign: "center" }}>
            <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              {KIND_LABEL[receipt.kind] ?? receipt.kind}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10 }}>
              <span className="cast-glyph" style={{ width: 26, height: 26, fontSize: 13 }}>c</span>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 56 }}>
                {positive ? "+" : "−"}{formatCast(amountCast)}
              </span>
              <span style={{ fontSize: 16, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
            </div>
            <div className="mono" style={{ marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>{fiat}</div>
          </div>

          {/* line items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>line items</div>
            {lines.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface-2)", borderRadius: 10, fontSize: 13 }}>
                <span>{l.label}</span>
                <span className={l.mono ? "mono" : "tnum"} style={{ fontWeight: 700 }}>{l.value}</span>
              </div>
            ))}
          </div>

          {/* meta */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <Meta k="payment method" v={receipt.method} />
            <Meta k="ledger id" v={receipt.id} mono />
            <Meta k="kind" v={KIND_LABEL[receipt.kind] ?? receipt.kind} />
            <div style={{ padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
              <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>status</div>
              <div className="lower" style={{ fontSize: 13, marginTop: 2, fontWeight: 700, color: STATUS_COLOR[receipt.status] ?? "var(--ink-1)" }}>
                {receipt.status}
              </div>
            </div>
          </div>

          <div className="mono lower" style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center", paddingTop: 6 }}>
            CAST is a closed-loop platform credit issued by technotainment ltd. company no. 14882309 · uk.
          </div>
        </div>
      </div>
    </main>
  );
}

function Meta({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{k}</div>
      <div className={mono ? "mono" : "lower"} style={{ fontSize: 13, marginTop: 2, fontWeight: 600 }}>{v}</div>
    </div>
  );
}
