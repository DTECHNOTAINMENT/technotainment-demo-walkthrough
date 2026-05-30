"use client";

import { useAdAction } from "./useAdAction";

/**
 * AdUserActions — per-user moderation buttons. Suspend/reinstate toggles by the
 * current status; "verify kyc" sets the user's kyc to verified. Posts to
 * /api/admin/action then router.refresh(). Optimistic disable-while-pending.
 */
export function AdUserActions({
  id,
  status,
  kyc,
}: {
  id: string;
  status: "active" | "pending" | "suspended";
  kyc: "none" | "pending" | "verified" | "failed";
}) {
  const { pending, error, run } = useAdAction();
  const suspended = status === "suspended";

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
      {error ? (
        <span className="lower" style={{ fontSize: 10.5, color: "#ef4444" }} title={error}>
          failed
        </span>
      ) : null}

      {kyc !== "verified" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run({ resource: "user", action: "kyc", id, kyc: "verified" })}
          className="btn btn-glass lower"
          style={{ padding: "6px 10px", fontSize: 11.5, opacity: pending ? 0.6 : 1 }}
        >
          verify kyc
        </button>
      ) : null}

      {suspended ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run({ resource: "user", action: "reinstate", id })}
          className="btn btn-glass lower"
          style={{ padding: "6px 10px", fontSize: 11.5, color: "#10b981", borderColor: "rgba(16,185,129,0.3)", opacity: pending ? 0.6 : 1 }}
        >
          reinstate
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run({ resource: "user", action: "suspend", id })}
          className="btn btn-glass lower"
          style={{ padding: "6px 10px", fontSize: 11.5, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", opacity: pending ? 0.6 : 1 }}
        >
          suspend
        </button>
      )}
    </div>
  );
}
