"use client";

/**
 * SupportBar — money-out affordances embedded on public channel/watch pages.
 * Tip (preset CAST amounts), join a membership tier, or buy a product. Every
 * action POSTs to /api/spend and surfaces an inline confirmation + new balance.
 * On 401 we bounce to sign-in. `compact` renders only the tip button (watch page).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCast, formatFiat } from "@/lib/cast";

export interface SupportTier {
  id: string;
  name: string;
  priceCast: number;
  perks: string[];
  popular: boolean;
}

export interface SupportProduct {
  id: string;
  name: string;
  priceCast: number;
  kind: "drop" | "ppv" | "course" | "merch";
}

type SpendKind = "tip" | "membership" | "drop" | "ppv";

interface SpendBody {
  kind: SpendKind;
  cast: number;
  channelId: string;
  tierId?: string;
  productId?: string;
}

interface SpendOk {
  transactionId: string;
  balance: number;
}

const TIP_PRESETS = [50, 100, 500] as const;

export function SupportBar({
  channelId,
  tiers,
  products = [],
  compact = false,
}: {
  channelId: string;
  tiers: SupportTier[];
  products?: SupportProduct[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [tipOpen, setTipOpen] = useState(false);

  async function spend(key: string, body: SpendBody, label: string) {
    setBusy(key);
    setError(null);
    setConfirm(null);
    try {
      const res = await fetch("/api/spend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data: Partial<SpendOk> & { error?: string } = await res.json();
      if (!res.ok || typeof data.balance !== "number") {
        setError(data.error ?? "something went wrong");
        return;
      }
      setBalance(data.balance);
      setConfirm(label);
      setTipOpen(false);
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(null);
    }
  }

  const tip = (cast: number) =>
    spend(`tip-${cast}`, { kind: "tip", cast, channelId }, `tipped ${formatCast(cast)} CAST`);

  const tipButton = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {!tipOpen ? (
        <button
          className="btn btn-grad lower"
          style={{ padding: "10px 18px", alignSelf: "flex-start" }}
          disabled={busy !== null}
          onClick={() => {
            setTipOpen(true);
            setError(null);
          }}
        >
          tip
        </button>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)" }}>
            send a tip
          </span>
          {TIP_PRESETS.map((cast) => (
            <button
              key={cast}
              className="cast-pill tnum"
              style={{ cursor: "pointer" }}
              disabled={busy !== null}
              onClick={() => void tip(cast)}
            >
              <span className="cast-glyph">c</span>
              {busy === `tip-${cast}` ? "…" : formatCast(cast)}
            </button>
          ))}
          <button
            className="btn btn-glass lower"
            style={{ padding: "8px 12px", fontSize: 12 }}
            disabled={busy !== null}
            onClick={() => setTipOpen(false)}
          >
            cancel
          </button>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tipButton}
        <Feedback confirm={confirm} error={error} balance={balance} />
      </div>
    );
  }

  return (
    <section className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div className="lower" style={{ fontWeight: 800, fontSize: 16 }}>
          support this channel
        </div>
        <div className="lower" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
          spend CAST from your wallet · instant.
        </div>
      </div>

      {tipButton}

      {tiers.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            className="lower"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)" }}
          >
            memberships
          </div>
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`tier${t.popular ? " popular" : ""}`}
              style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }} className="lower">
                  {t.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">
                  {formatCast(t.priceCast)} CAST · {formatFiat(t.priceCast)} / mo
                </div>
              </div>
              <button
                className="btn btn-grad lower"
                style={{ padding: "10px 16px" }}
                disabled={busy !== null}
                onClick={() =>
                  void spend(
                    `tier-${t.id}`,
                    { kind: "membership", cast: t.priceCast, channelId, tierId: t.id },
                    `joined ${t.name}`,
                  )
                }
              >
                {busy === `tier-${t.id}` ? "…" : "join"}
              </button>
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            className="lower"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-4)" }}
          >
            store
          </div>
          {products.map((p) => {
            const kind: SpendKind = p.kind === "ppv" ? "ppv" : "drop";
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  border: "1px solid var(--hairline)",
                  borderRadius: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }} className="lower">
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">
                    {formatCast(p.priceCast)} CAST · {formatFiat(p.priceCast)}
                  </div>
                </div>
                <button
                  className="btn btn-glass lower"
                  style={{ padding: "10px 16px" }}
                  disabled={busy !== null}
                  onClick={() =>
                    void spend(
                      `prod-${p.id}`,
                      { kind, cast: p.priceCast, channelId, productId: p.id },
                      `bought ${p.name}`,
                    )
                  }
                >
                  {busy === `prod-${p.id}` ? "…" : "buy"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Feedback confirm={confirm} error={error} balance={balance} />
    </section>
  );
}

function Feedback({
  confirm,
  error,
  balance,
}: {
  confirm: string | null;
  error: string | null;
  balance: number | null;
}) {
  if (!confirm && !error) return null;
  if (error) {
    return (
      <div className="lower" style={{ fontSize: 12, color: "var(--bg-red)" }}>
        {error}
      </div>
    );
  }
  return (
    <div className="lower" style={{ fontSize: 12, color: "#10b981", display: "flex", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontWeight: 700 }}>{confirm} ✓</span>
      {balance !== null && (
        <span className="tnum" style={{ color: "var(--ink-3)" }}>
          balance {formatCast(balance)} CAST
        </span>
      )}
    </div>
  );
}

export default SupportBar;
