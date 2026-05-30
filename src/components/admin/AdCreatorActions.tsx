"use client";

import { useAdAction } from "./useAdAction";

/**
 * AdApplicationActions — approve / decline buttons for a creator application
 * (status = review). On approve the channel is created server-side.
 */
export function AdApplicationActions({ id }: { id: string }) {
  const { pending, error, run } = useAdAction();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {error ? (
        <span className="lower" style={{ fontSize: 10.5, color: "#ef4444" }} title={error}>
          failed
        </span>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => run({ resource: "creator", action: "decline", id })}
        className="btn btn-glass lower"
        style={{ padding: "8px 12px", fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", opacity: pending ? 0.6 : 1 }}
      >
        decline
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run({ resource: "creator", action: "approve", id })}
        className="btn btn-grad lower"
        style={{ padding: "8px 14px", fontSize: 12, opacity: pending ? 0.6 : 1 }}
      >
        approve
      </button>
    </div>
  );
}

/**
 * AdCreatorRowActions — roster controls: edit take-rate (prompt → take-rate
 * action) and toggle payout-hold on/off. Posts to /api/admin/action then
 * router.refresh(). Optimistic disable-while-pending.
 */
export function AdCreatorRowActions({
  id,
  takeRatePct,
  payoutHold,
}: {
  id: string;
  takeRatePct: number;
  payoutHold: boolean;
}) {
  const { pending, error, run } = useAdAction();

  function editTakeRate() {
    const raw = window.prompt("set take-rate (%)", String(takeRatePct));
    if (raw == null) return;
    const value = Number(raw.trim());
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      window.alert("enter a take-rate between 0 and 100");
      return;
    }
    void run({ resource: "creator", action: "take-rate", id, value });
  }

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
      {error ? (
        <span className="lower" style={{ fontSize: 10.5, color: "#ef4444" }} title={error}>
          failed
        </span>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={editTakeRate}
        className="btn btn-glass lower"
        style={{ padding: "6px 10px", fontSize: 11.5, opacity: pending ? 0.6 : 1 }}
      >
        take · {takeRatePct}%
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run({ resource: "creator", action: "payout-hold", id, value: !payoutHold })}
        className="btn btn-glass lower"
        style={{
          padding: "6px 10px",
          fontSize: 11.5,
          color: payoutHold ? "#10b981" : "#f59e0b",
          borderColor: payoutHold ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {payoutHold ? "release payouts" : "hold payouts"}
      </button>
    </div>
  );
}
