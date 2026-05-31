"use client";

/**
 * SxWithdraw — creator withdrawal panel. Caps the amount at availableCast, lets the creator
 * pick a payout method, and POSTs /api/studio/withdraw. If the creator's KYC isn't verified the
 * API errors before the first payout, so SxKycButton (POST /api/studio/kyc) is offered inline.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCast, formatFiat } from "@/lib/cast";
import { SX_INPUT, SX_LABEL, SxPill } from "./SxPrimitives";

interface MethodOpt {
  id: string;
  label: string;
  sub: string | null;
}

// fee + speed metadata per payout rail, mirroring the prototype's PAYOUT_METHODS.
// processingRate is applied to the withdrawal amount in CAST.
const RAIL_META: { type: string; match: RegExp; feeLabel: string; processingRate: number; speed: string }[] = [
  { type: "bank", match: /bank|sepa|faster|ach|account/i, feeLabel: "free", processingRate: 0, speed: "1–2 days" },
  { type: "instant", match: /instant/i, feeLabel: "1.5%", processingRate: 0.015, speed: "minutes" },
  { type: "paypal", match: /paypal/i, feeLabel: "2.0%", processingRate: 0.02, speed: "instant" },
  { type: "wise", match: /wise/i, feeLabel: "0.8%", processingRate: 0.008, speed: "1 day" },
  { type: "payoneer", match: /payoneer/i, feeLabel: "1.2%", processingRate: 0.012, speed: "1–2 days" },
  { type: "usdc", match: /usdc|crypto|circle/i, feeLabel: "1.0%", processingRate: 0.01, speed: "minutes" },
];

function railFor(m: MethodOpt) {
  const hay = `${m.label} ${m.sub ?? ""}`;
  return RAIL_META.find((r) => r.match.test(hay)) ?? RAIL_META[0];
}

interface WithdrawResponse {
  payoutId?: string;
  status?: "held" | "pending" | "paid";
  netFiat?: string;
  error?: string;
}

export function SxWithdraw({
  availableCast,
  pendingCast,
  minPayoutCast,
  methods,
  kycVerified,
}: {
  availableCast: number;
  pendingCast: number;
  minPayoutCast: number;
  methods: MethodOpt[];
  kycVerified: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(availableCast);
  const [methodId, setMethodId] = useState<string>(methods.find((m) => m)?.id ?? "");
  const [verified, setVerified] = useState(kycVerified);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<WithdrawResponse | null>(null);

  const capped = Math.max(0, Math.min(availableCast, Math.floor(amount) || 0));
  const belowMin = capped < minPayoutCast;
  const canWithdraw = capped > 0 && !belowMin && availableCast > 0;

  const selected = methods.find((m) => m.id === methodId) ?? methods[0] ?? null;
  const rail = selected ? railFor(selected) : RAIL_META[0];
  const processingFee = Math.round(capped * rail.processingRate);
  const netCast = Math.max(0, capped - processingFee);

  async function withdraw() {
    if (!canWithdraw) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/withdraw", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cast: capped, payoutMethodId: methodId || undefined }),
      });
      const data: WithdrawResponse = await res.json();
      if (!res.ok || !data.payoutId) {
        setError(data.error ?? "withdrawal failed · try again");
        return;
      }
      setDone(data);
      router.refresh();
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, textAlign: "center", padding: "8px 0" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--brand-gradient)",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 26,
            fontWeight: 900,
          }}
        >
          ✓
        </div>
        <div>
          <div className="lower" style={{ fontSize: 15, fontWeight: 800 }}>
            withdrawal on its way
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            <span className="brand-grad-text tnum" style={{ fontWeight: 800 }}>
              {formatCast(capped)}
            </span>{" "}
            CAST · {done.netFiat ?? formatFiat(capped)}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
            {done.payoutId}
          </span>
          <SxPill tone="warn">{done.status ?? "held"}</SxPill>
        </div>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setAmount(Math.max(0, availableCast - capped));
          }}
          className="btn btn-glass lower"
          style={{ padding: 12 }}
        >
          done
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center" }}>
        <div
          className="lower"
          style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}
        >
          available to withdraw
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "center", marginTop: 8 }}>
          <span className="cast-glyph">c</span>
          <span className="tnum brand-grad-text stat-num" style={{ fontSize: 40, fontWeight: 800 }}>
            {formatCast(availableCast)}
          </span>
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>
          {formatFiat(availableCast)} · {formatCast(pendingCast)} CAST clearing (7-day hold)
        </div>
      </div>

      <div>
        <label style={SX_LABEL}>amount to withdraw</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="tnum"
            style={{ ...SX_INPUT, flex: 1 }}
            type="number"
            min={0}
            max={availableCast}
            value={amount}
            onChange={(e) => setAmount(Math.min(availableCast, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
          />
          <button
            type="button"
            onClick={() => setAmount(availableCast)}
            className="btn btn-glass lower"
            style={{ padding: "11px 14px", fontSize: 12 }}
          >
            max
          </button>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
          = {formatFiat(capped)} · minimum payout {formatCast(minPayoutCast)} CAST
        </div>
      </div>

      {methods.length > 0 && (
        <div>
          <label style={SX_LABEL}>payout method</label>
          <select style={SX_INPUT} value={methodId} onChange={(e) => setMethodId(e.target.value)}>
            {methods.map((m) => {
              const r = railFor(m);
              return (
                <option key={m.id} value={m.id}>
                  {m.label}
                  {m.sub ? ` · ${m.sub}` : ""} · {r.feeLabel} · {r.speed}
                </option>
              );
            })}
          </select>
          {selected && (
            <div className="lower" style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--ink-3)" }}>
              <span>
                fee <span style={{ color: rail.processingRate === 0 ? "#10b981" : "var(--ink-2)", fontWeight: 700 }}>{rail.feeLabel}</span>
              </span>
              <span>arrives in {rail.speed}</span>
            </div>
          )}
        </div>
      )}

      {/* fee breakdown → net preview */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 14,
          background: "var(--surface-2)",
          borderRadius: 12,
          fontSize: 12.5,
        }}
      >
        {[
          ["withdrawing", `${formatCast(capped)} CAST`],
          [`processing fee · ${rail.feeLabel}`, processingFee > 0 ? `−${formatCast(processingFee)} CAST` : "free"],
          ["platform fee", "included · taken at earning"],
          ["fx rate", "100 CAST = £1.00"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="lower" style={{ color: "var(--ink-3)" }}>
              {k}
            </span>
            <span className="tnum" style={{ fontWeight: 600 }}>
              {v}
            </span>
          </div>
        ))}
        <div style={{ height: 1, background: "var(--hairline)", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
          <span className="lower">you receive</span>
          <span className="brand-grad-text tnum" style={{ fontSize: 16 }}>
            {formatFiat(netCast)}
          </span>
        </div>
      </div>

      {!verified && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 14,
            borderRadius: 12,
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div className="lower" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>
            verify your identity before your first payout
          </div>
          <SxKycButton onVerified={() => setVerified(true)} />
        </div>
      )}

      {belowMin && capped > 0 && (
        <div className="lower" style={{ fontSize: 12, color: "var(--bg-red)" }}>
          minimum payout is {formatCast(minPayoutCast)} CAST
        </div>
      )}
      {error && (
        <div className="lower" style={{ fontSize: 12, color: "var(--bg-red)" }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void withdraw()}
        disabled={!canWithdraw || !verified || busy}
        className="btn btn-grad lower"
        style={{ padding: 13, opacity: canWithdraw && verified && !busy ? 1 : 0.5 }}
      >
        {busy ? "processing…" : `withdraw ${formatFiat(netCast)}`}
      </button>
    </div>
  );
}

export function SxKycButton({ onVerified }: { onVerified?: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/kyc", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; kyc?: string; error?: string };
      if (!res.ok || data.kyc !== "verified") {
        setError(data.error ?? "verification failed · try again");
        return;
      }
      onVerified?.();
      router.refresh();
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void verify()}
        disabled={busy}
        className="btn btn-grad lower"
        style={{ padding: "10px 14px", fontSize: 13, opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "verifying…" : "verify identity (demo)"}
      </button>
      {error && (
        <div className="lower" style={{ fontSize: 11.5, color: "var(--bg-red)", marginTop: 6 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default SxWithdraw;
