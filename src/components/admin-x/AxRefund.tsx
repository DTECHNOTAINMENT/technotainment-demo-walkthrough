"use client";

/**
 * AxRefund — refund a settled spend. POSTs { resource:'finance', action:'refund', txnId }.
 * On success the txn flips to reversed (server re-reads via router.refresh) and the button
 * shows the done state.
 */
import { useState } from "react";
import { useAxAction } from "./useAxAction";

export function AxRefund({ txnId }: { txnId: string }) {
  const { run, busy, error } = useAxAction();
  const [done, setDone] = useState(false);

  async function refund() {
    const res = await run({ resource: "finance", action: "refund", txnId });
    if (res?.refunded) setDone(true);
  }

  if (done) {
    return (
      <span className="lower" style={{ fontSize: 11.5, fontWeight: 800, color: "#10b981" }}>
        refunded
      </span>
    );
  }

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <button
        type="button"
        onClick={() => void refund()}
        disabled={busy}
        className="btn btn-glass lower"
        style={{ padding: "6px 11px", fontSize: 11.5, opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "refunding…" : "refund"}
      </button>
      {error && (
        <span className="lower" style={{ fontSize: 10, color: "#ef4444" }}>
          {error}
        </span>
      )}
    </span>
  );
}

export default AxRefund;
