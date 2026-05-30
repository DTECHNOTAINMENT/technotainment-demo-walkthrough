// Receipt — /receipt/:id. Server-rendered, signed-in only, noindex.
// getReceipt scopes to the current user; notFound() when missing or not theirs.
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getReceipt } from "@/lib/money";
import { formatCast, formatFiat } from "@/lib/cast";

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
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReceiptPage({ params }: Props) {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in");

  const receipt = await getReceipt(params.id, session.userId);
  if (!receipt) notFound();

  const positive = receipt.cast > 0;
  const amountCast = Math.abs(receipt.cast);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 96px" }}>
      <Link href="/wallet" className="btn btn-glass lower" style={{ padding: "8px 14px", fontSize: 12, marginBottom: 16 }}>
        back to wallet
      </Link>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="brand-hairline" />
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 22 }}>
          {/* header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div
                className="lower"
                style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}
              >
                receipt
              </div>
              <div className="mono" style={{ fontSize: 13, marginTop: 4, color: "var(--ink-2)" }}>
                {receipt.id}
              </div>
            </div>
            <div className="mono" style={{ textAlign: "right", fontSize: 11, color: "var(--ink-3)" }}>
              {fullDate(receipt.createdAt)}
            </div>
          </div>

          {/* amount */}
          <div style={{ padding: "20px 0", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", textAlign: "center" }}>
            <div
              className="lower"
              style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}
            >
              {KIND_LABEL[receipt.kind] ?? receipt.kind}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 10 }}>
              <span className="cast-glyph" style={{ width: 26, height: 26, fontSize: 13 }}>
                c
              </span>
              <span className="tnum brand-grad-text stat-num" style={{ fontSize: 52 }}>
                {positive ? "+" : "−"}
                {formatCast(amountCast)}
              </span>
              <span style={{ fontSize: 16, color: "var(--ink-3)", fontWeight: 700 }}>CAST</span>
            </div>
            <div className="mono lower" style={{ marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>
              {receipt.grossFiat ?? formatFiat(amountCast)}
            </div>
          </div>

          {/* meta */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <Meta k="kind" v={KIND_LABEL[receipt.kind] ?? receipt.kind} />
            <Meta k="payment method" v={receipt.method} />
            <Meta k="ledger id" v={receipt.id} mono />
            <MetaStatus status={receipt.status} />
          </div>

          <div className="mono lower" style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center", paddingTop: 6 }}>
            CAST is a closed-loop platform credit issued by technotainment ltd.
          </div>
        </div>
      </div>
    </main>
  );
}

function Meta({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
      <div className="mono lower" style={{ fontSize: 10, color: "var(--ink-3)" }}>
        {k}
      </div>
      <div className={mono ? "mono" : "lower"} style={{ fontSize: 13, marginTop: 2, fontWeight: 600 }}>
        {v}
      </div>
    </div>
  );
}

function MetaStatus({ status }: { status: string }) {
  return (
    <div style={{ padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10 }}>
      <div className="mono lower" style={{ fontSize: 10, color: "var(--ink-3)" }}>
        status
      </div>
      <div className="lower" style={{ fontSize: 13, marginTop: 2, fontWeight: 700, color: STATUS_COLOR[status] ?? "var(--ink-1)" }}>
        {status}
      </div>
    </div>
  );
}
