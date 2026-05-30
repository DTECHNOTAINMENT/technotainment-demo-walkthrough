"use client";

/**
 * TopupFlow — the money-in funnel: amount → method → (express settles | card 3DS) → success.
 * Mirrors prototype/v4/topup.jsx, wired to the real /api/wallet/topup contract:
 *   POST { methodId, cast } -> { transactionId, needs3ds, status, clientSecret?, balance? }
 *   if needs3ds: POST { confirm: transactionId, code } -> { status:"settled", balance }
 */
import { useState } from "react";
import Link from "next/link";
import type { PaymentMethodId } from "@/lib/integrations";
import { formatCast, formatFiat } from "@/lib/cast";
import { CARD_METHODS, TOPUP_GROUPS, TOPUP_METHODS, methodById } from "./methods";

const PRESETS = [500, 1000, 2500, 5000, 10000] as const;
const MIN_CAST = 100;

type Step = "amount" | "method" | "3ds" | "success";

interface TopupResponse {
  transactionId: string;
  needs3ds: boolean;
  status: "pending" | "settled";
  clientSecret?: string;
  balance?: number;
  error?: string;
}

interface ConfirmResponse {
  status: "settled";
  balance: number;
  error?: string;
}

export function TopupFlow() {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState<string>("");
  const [methodId, setMethodId] = useState<PaymentMethodId>("apple-pay");
  const [txnId, setTxnId] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = custom ? Math.max(0, Math.floor(Number(custom)) || 0) : amount;
  const valid = Number.isInteger(value) && value >= MIN_CAST;

  async function startTopup() {
    if (!valid) {
      setError(`minimum top-up is ${formatCast(MIN_CAST)} CAST`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ methodId, cast: value }),
      });
      const data: TopupResponse = await res.json();
      if (!res.ok) {
        setError(data.error ?? "top-up failed");
        return;
      }
      setTxnId(data.transactionId);
      if (data.needs3ds) {
        setStep("3ds");
      } else {
        setBalance(typeof data.balance === "number" ? data.balance : null);
        setStep("success");
      }
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(false);
    }
  }

  async function confirm3ds() {
    if (!txnId) return;
    if (!/^\d{6}$/.test(code)) {
      setError("enter the 6-digit code");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: txnId, code }),
      });
      const data: ConfirmResponse = await res.json();
      if (!res.ok || data.status !== "settled") {
        setError(data.error ?? "verification failed · try again");
        return;
      }
      setBalance(data.balance);
      setStep("success");
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden" }}>
      <div className="brand-hairline" />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        {/* progress */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["amount", "method", "success"] as const).map((s, i) => {
            const order: Step[] = ["amount", "method", step === "3ds" ? "3ds" : "success"];
            const active = order.indexOf(step) >= i || step === "success";
            return (
              <span
                key={s}
                style={{ flex: 1, height: 3, borderRadius: 2, background: active ? "var(--brand-gradient)" : "var(--surface-3)" }}
              />
            );
          })}
        </div>

        {step === "amount" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p className="lower" style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
              CAST is a closed-loop platform credit · 100 CAST = {formatFiat(100)}. balances never expire.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
              {PRESETS.map((p) => {
                const selected = !custom && amount === p;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setAmount(p);
                      setCustom("");
                      setError(null);
                    }}
                    style={{
                      padding: "16px 14px",
                      textAlign: "left",
                      borderRadius: 12,
                      background: selected ? "var(--ink-1)" : "var(--surface-2)",
                      color: selected ? "var(--bg)" : "var(--ink-1)",
                      border: "1px solid var(--hairline)",
                    }}
                  >
                    <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>
                      {formatCast(p)}
                    </div>
                    <div className="lower" style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>
                      CAST · {formatFiat(p)}
                    </div>
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid var(--hairline)",
                borderRadius: 10,
                background: "var(--surface-2)",
              }}
            >
              <span className="cast-glyph">c</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_CAST}
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  setError(null);
                }}
                placeholder={`custom amount (min ${MIN_CAST})`}
                className="mono"
                style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 14 }}
              />
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
            </div>
            {error && <ErrorLine msg={error} />}
            <button
              onClick={() => {
                if (!valid) {
                  setError(`minimum top-up is ${formatCast(MIN_CAST)} CAST`);
                  return;
                }
                setError(null);
                setStep("method");
              }}
              className="btn btn-grad lower"
              style={{ padding: 14, fontSize: 15 }}
            >
              continue · {formatCast(valid ? value : MIN_CAST)} CAST
            </button>
          </div>
        )}

        {step === "method" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p className="lower" style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
              charged {formatFiat(value)} in your local currency · one-time, never stored on-device.
            </p>
            {TOPUP_GROUPS.map((g) => {
              const items = TOPUP_METHODS.filter((m) => m.group === g.id);
              if (!items.length) return null;
              return (
                <div key={g.id}>
                  <div
                    className="lower"
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--ink-4)",
                      margin: "2px 0 8px",
                    }}
                  >
                    {g.label}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((m) => {
                      const selected = methodId === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMethodId(m.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "11px 13px",
                            width: "100%",
                            border: `1.5px solid ${selected ? "transparent" : "var(--hairline)"}`,
                            borderRadius: 12,
                            textAlign: "left",
                            background: selected
                              ? "linear-gradient(var(--surface), var(--surface)) padding-box, var(--brand-gradient) border-box"
                              : "var(--surface)",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="lower" style={{ fontSize: 13, fontWeight: 700 }}>
                              {m.label}
                            </div>
                            {m.sub && (
                              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                                {m.sub}
                              </div>
                            )}
                          </div>
                          {m.instant && (
                            <span
                              className="lower"
                              style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                color: "#10b981",
                                padding: "3px 7px",
                                borderRadius: 999,
                                background: "rgba(16,185,129,0.12)",
                              }}
                            >
                              instant
                            </span>
                          )}
                          {CARD_METHODS.has(m.id) && (
                            <span className="lower" style={{ fontSize: 9.5, color: "var(--ink-4)" }}>
                              3ds
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {error && <ErrorLine msg={error} />}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setError(null);
                  setStep("amount");
                }}
                className="btn btn-glass lower"
                style={{ flex: 1, padding: 14 }}
              >
                back
              </button>
              <button
                onClick={() => void startTopup()}
                disabled={busy}
                className="btn btn-grad lower"
                style={{ flex: 2, padding: 14, fontSize: 15, opacity: busy ? 0.6 : 1 }}
              >
                {busy ? "processing…" : `pay ${formatFiat(value)}`}
              </button>
            </div>
          </div>
        )}

        {step === "3ds" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="lower" style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
              your bank sent a code to authorise {formatFiat(value)} via {methodById(methodId).label}. enter the 6 digits.
            </p>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              inputMode="numeric"
              maxLength={6}
              placeholder="······"
              className="mono"
              style={{
                width: "100%",
                height: 56,
                textAlign: "center",
                fontSize: 28,
                letterSpacing: "0.5em",
                fontWeight: 800,
                borderRadius: 10,
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                color: "var(--ink-1)",
                outline: "none",
              }}
            />
            {error && <ErrorLine msg={error} />}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setCode("123456")} className="btn btn-glass lower" style={{ flex: 1, padding: 14 }}>
                auto-fill (demo)
              </button>
              <button
                onClick={() => void confirm3ds()}
                disabled={busy}
                className="btn btn-grad lower"
                style={{ flex: 2, padding: 14, fontSize: 15, opacity: busy ? 0.6 : 1 }}
              >
                {busy ? "verifying…" : `verify · pay ${formatFiat(value)}`}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                padding: 24,
                borderRadius: 14,
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--brand-gradient)",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <div className="lower" style={{ marginTop: 14, fontSize: 16, fontWeight: 800 }}>
                topped up · added to wallet
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)" }}>
                <span className="brand-grad-text tnum" style={{ fontWeight: 800, fontSize: 22 }}>
                  +{formatCast(value)}
                </span>{" "}
                CAST
              </div>
              {balance !== null && (
                <div className="tnum lower" style={{ marginTop: 10, fontSize: 13 }}>
                  new balance · {formatCast(balance)} CAST · {formatFiat(balance)}
                </div>
              )}
              {txnId && (
                <div className="mono" style={{ marginTop: 10, fontSize: 11, color: "var(--ink-3)" }}>
                  receipt · {txnId}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {txnId && (
                <Link href={`/receipt/${txnId}`} className="btn btn-glass lower" style={{ flex: 1, padding: 14, textAlign: "center" }}>
                  view receipt
                </Link>
              )}
              <Link href="/wallet" className="btn btn-grad lower" style={{ flex: 2, padding: 14, fontSize: 15, textAlign: "center" }}>
                done
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorLine({ msg }: { msg: string }) {
  return (
    <div className="lower" style={{ fontSize: 12, color: "var(--bg-red)", textAlign: "center" }}>
      {msg}
    </div>
  );
}

export default TopupFlow;
