"use client";

/**
 * AxPayoutRun — run (approve) or hold the next payout batch. "run batch" generates a
 * runId ('RUN-'+Date.now()) and POSTs payout-run-approve, which clears every held payout
 * to paid and upserts the PayoutRun. "hold" pauses an existing run by id.
 */
import { useState } from "react";
import { formatCast } from "@/lib/cast";
import { useAxAction } from "./useAxAction";

export function AxPayoutRun({ heldCount, holdRunId }: { heldCount: number; holdRunId?: string }) {
  const { run, busy, error } = useAxAction();
  const [cleared, setCleared] = useState<number | null>(null);

  async function approve() {
    const runId = "RUN-" + Date.now();
    const res = await run({ resource: "finance", action: "payout-run-approve", runId });
    if (res && typeof res.cleared === "number") setCleared(res.cleared);
  }

  async function hold() {
    if (!holdRunId) return;
    await run({ resource: "finance", action: "payout-run-hold", runId: holdRunId });
  }

  if (cleared !== null) {
    return (
      <span className="lower" style={{ fontSize: 12.5, fontWeight: 800, color: "#10b981" }}>
        cleared {formatCast(cleared)} payouts
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {holdRunId && (
          <button
            type="button"
            onClick={() => void hold()}
            disabled={busy}
            className="btn btn-glass lower"
            style={{ padding: "11px 15px", opacity: busy ? 0.6 : 1 }}
          >
            hold run
          </button>
        )}
        <button
          type="button"
          onClick={() => void approve()}
          disabled={busy || heldCount === 0}
          className="btn btn-grad lower"
          style={{ padding: "11px 17px", opacity: busy || heldCount === 0 ? 0.55 : 1 }}
        >
          {busy ? "running…" : `run payout batch · ${formatCast(heldCount)}`}
        </button>
      </div>
      {error && (
        <span className="lower" style={{ fontSize: 11, color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default AxPayoutRun;
