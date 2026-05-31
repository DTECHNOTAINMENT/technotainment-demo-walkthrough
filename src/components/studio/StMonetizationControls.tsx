"use client";

/**
 * StMonetizationControls — the interactive monetization configuration surface, mirroring
 * prototype/v4/studio-monetization.jsx. Owns local state for:
 *   - editable suggested-tip chips (add / remove preset amounts),
 *   - the pay-per-view access-window selector (24h / 48h / 72h / buy-to-keep),
 *   - an optional goals panel (members / tips goal) with a progress Meter + enable toggle.
 * Server data (member count, mrr) is passed down; nothing here writes to the DB — saving is a
 * toast in the prototype and lands with the settings API in a later phase.
 */
import { useState } from "react";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import { StudioCard, Meter, Toggle } from "@/components/studio-ui";

const PRESET_TIP = 1000;
const WINDOWS = [
  { id: 24, label: "24 hours" },
  { id: 48, label: "48 hours" },
  { id: 72, label: "72 hours" },
  { id: 0, label: "buy to keep" },
];

type GoalKind = "members" | "tips";

export function StMonetizationControls({ totalMembers, mrrCast }: { totalMembers: number; mrrCast: number }) {
  const [tipAmts, setTipAmts] = useState<number[]>([50, 100, 250, 500]);
  const [ppvWindow, setPpvWindow] = useState(48);
  const [goalsOn, setGoalsOn] = useState(false);
  const [goalKind, setGoalKind] = useState<GoalKind>("members");
  const [goalTarget, setGoalTarget] = useState(1400);

  const goalCurrent = goalKind === "members" ? totalMembers : Math.min(mrrCast, 50_000);
  const goalLabel = goalKind === "members" ? "members goal" : "tips goal · CAST this month";

  return (
    <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", marginTop: 14 }}>
      {/* Tip-amount management */}
      <StudioCard title="tips · suggested amounts" sub="edit the presets your audience sees">
        <div className="lower" style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>
          suggested amounts (CAST)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {tipAmts.map((a, i) => (
            <span
              key={`${a}-${i}`}
              className="tnum"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 11px",
                borderRadius: 999,
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              {formatCast(a)}
              {tipAmts.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTipAmts(tipAmts.filter((_, j) => j !== i))}
                  aria-label={`remove ${a} CAST`}
                  style={{ color: "var(--ink-4)", display: "inline-flex" }}
                >
                  <Icon name="close" size={11} />
                </button>
              )}
            </span>
          ))}
          <button
            type="button"
            onClick={() => setTipAmts([...tipAmts, PRESET_TIP])}
            className="chip"
            style={{ padding: "6px 11px", fontSize: 12.5 }}
          >
            <Icon name="plus" size={12} stroke={2.4} /> add
          </button>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 10 }}>
          {tipAmts.length} preset{tipAmts.length === 1 ? "" : "s"} · tap a chip&apos;s × to remove
        </div>
      </StudioCard>

      {/* PPV access window */}
      <StudioCard title="pay-per-view · access window" sub="how long a rental stays unlocked">
        <label className="st-label">access window</label>
        <select
          className="st-input"
          value={ppvWindow}
          onChange={(e) => setPpvWindow(Number(e.target.value))}
          style={{ padding: "9px 10px", width: "100%" }}
        >
          {WINDOWS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
        <div className="st-hint" style={{ marginTop: 12 }}>
          {ppvWindow === 0
            ? "buyers keep this content forever once purchased."
            : `buyers get ${ppvWindow}h of access from purchase. set per video in the content editor, or per stream when you go live.`}
        </div>
      </StudioCard>

      {/* Goals */}
      <StudioCard
        title="goals"
        sub="show a live progress bar to rally support"
        action={<Toggle on={goalsOn} onChange={setGoalsOn} ariaLabel="enable goals" />}
      >
        {goalsOn ? (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <select
                className="st-input"
                value={goalKind}
                onChange={(e) => setGoalKind(e.target.value as GoalKind)}
                style={{ padding: "9px 10px", flex: 1 }}
              >
                <option value="members">members goal</option>
                <option value="tips">monthly tips goal</option>
              </select>
              <input
                className="st-input tnum"
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(Math.max(1, Number(e.target.value)))}
                style={{ width: 120, padding: "9px 10px" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 5 }}>
              <span className="lower" style={{ color: "var(--ink-3)" }}>
                {goalLabel}
              </span>
              <span className="tnum" style={{ fontWeight: 700 }}>
                {formatCast(goalCurrent)} / {formatCast(goalTarget)}
              </span>
            </div>
            <Meter value={goalTarget > 0 ? goalCurrent / goalTarget : 0} />
            {goalKind === "tips" && (
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
                {formatFiat(goalTarget)} target
              </div>
            )}
          </>
        ) : (
          <div className="st-hint">turn goals on to show a live progress bar on your channel — e.g. &ldquo;members goal: 1,400 by june&rdquo; or &ldquo;tips goal: 50,000 CAST this month&rdquo;.</div>
        )}
      </StudioCard>
    </div>
  );
}
