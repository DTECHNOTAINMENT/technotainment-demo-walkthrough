"use client";

import { useAdAction } from "./useAdAction";

/**
 * AdReportActions — enforcement buttons for a moderation report:
 * investigate / strike / remove / dismiss. Posts to /api/admin/action then
 * router.refresh(). Optimistic disable-while-pending.
 */
export function AdReportActions({
  id,
  status,
}: {
  id: string;
  status: "open" | "investigating" | "actioned" | "dismissed";
}) {
  const { pending, error, run } = useAdAction();
  const resolved = status === "actioned" || status === "dismissed";

  if (resolved) {
    return (
      <span className="lower" style={{ fontSize: 11, color: "var(--ink-4)" }}>
        {status === "actioned" ? "actioned" : "dismissed"}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap" }}>
      {error ? (
        <span className="lower" style={{ fontSize: 10.5, color: "#ef4444" }} title={error}>
          failed
        </span>
      ) : null}
      {status !== "investigating" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run({ resource: "report", action: "investigate", id })}
          className="btn btn-glass lower"
          style={{ padding: "6px 10px", fontSize: 11.5, opacity: pending ? 0.6 : 1 }}
        >
          investigate
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => run({ resource: "report", action: "dismiss", id })}
        className="btn btn-glass lower"
        style={{ padding: "6px 10px", fontSize: 11.5, opacity: pending ? 0.6 : 1 }}
      >
        dismiss
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run({ resource: "report", action: "strike", id })}
        className="btn btn-glass lower"
        style={{ padding: "6px 10px", fontSize: 11.5, color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)", opacity: pending ? 0.6 : 1 }}
      >
        strike
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => run({ resource: "report", action: "remove", id })}
        className="btn btn-grad lower"
        style={{ padding: "6px 12px", fontSize: 11.5, opacity: pending ? 0.6 : 1 }}
      >
        remove
      </button>
    </div>
  );
}
