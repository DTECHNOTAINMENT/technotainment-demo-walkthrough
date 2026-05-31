"use client";

/**
 * SxSettings — creator studio settings, ported from prototype/v4/studio-settings.jsx.
 * Four tabs: channel (brand · details · follower notifications), payout & tax, moderation
 * (chat rules · blocked terms), and team & roles. There's no settings-write endpoint in
 * this phase's contract, so the form is presentational: inputs are controlled-but-local and
 * toggles flip local state. "save" shows an inline "saved locally in demo" confirm — honest
 * about the missing backend while staying visually complete.
 */
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { StudioCard, Seg, Toggle, Pill } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";

interface Props {
  name: string;
  handle: string;
  category: string;
  bio: string;
  brand: string;
  brand2: string;
  takeRatePct: number;
  payoutLabel: string;
  payoutSub: string;
}

type Tab = "channel" | "payout" | "moderation" | "team";

interface Toggles {
  alerts: boolean;
  dropPings: boolean;
  subGoals: boolean;
  slow: boolean;
  membersChat: boolean;
  automod: boolean;
  raids: boolean;
}

export function SxSettings(initial: Props) {
  const [tab, setTab] = useState<Tab>("channel");
  const [tg, setTg] = useState<Toggles>({
    alerts: true,
    dropPings: true,
    subGoals: true,
    slow: true,
    membersChat: false,
    automod: true,
    raids: true,
  });
  const flip = (k: keyof Toggles) => setTg((t) => ({ ...t, [k]: !t[k] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Seg
        items={[
          { id: "channel", label: "channel" },
          { id: "payout", label: "payout & tax" },
          { id: "moderation", label: "moderation" },
          { id: "team", label: "team" },
        ]}
        value={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {tab === "channel" && <ChannelTab {...initial} tg={tg} flip={flip} />}
      {tab === "payout" && (
        <PayoutTab takeRatePct={initial.takeRatePct} payoutLabel={initial.payoutLabel} payoutSub={initial.payoutSub} />
      )}
      {tab === "moderation" && <ModerationTab tg={tg} flip={flip} />}
      {tab === "team" && <TeamTab name={initial.name} handle={initial.handle} />}
    </div>
  );
}

/* ── channel tab ─────────────────────────────────────────── */

function ChannelTab({
  name: initialName,
  handle,
  category: initialCategory,
  bio: initialBio,
  brand,
  brand2,
  tg,
  flip,
}: Props & { tg: Toggles; flip: (k: keyof Toggles) => void }) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [bio, setBio] = useState(initialBio);
  const [c1, setC1] = useState(brand);
  const [c2, setC2] = useState(brand2);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="brand">
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ padding: 3, borderRadius: "50%", background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
            <span
              style={{
                display: "flex",
                width: 72,
                height: 72,
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--surface)",
                color: "var(--ink-1)",
                fontWeight: 900,
                fontSize: 26,
              }}
            >
              {name.replace(/^@/, "").slice(0, 1).toUpperCase()}
            </span>
          </span>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
            <div className="lower" style={{ fontSize: 13, color: "var(--ink-3)" }}>
              {handle} · {category}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-glass lower" style={{ padding: "8px 13px", fontSize: 12 }}>
                change avatar
              </button>
              <button type="button" className="btn btn-glass lower" style={{ padding: "8px 13px", fontSize: 12 }}>
                change banner
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ColorPick value={c1} onChange={setC1} />
            <ColorPick value={c2} onChange={setC2} />
          </div>
        </div>
      </StudioCard>

      <StudioCard title="channel details">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="display name">
            <input className="st-input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="handle">
            <input className="st-input" value={handle} disabled style={{ opacity: 0.7 }} />
          </Field>
          <Field label="category">
            <input className="st-input" value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <Field label="bio">
            <textarea
              className="st-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="tell people what your channel is about…"
              style={{ resize: "vertical" }}
            />
          </Field>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
            {saved && (
              <span className="lower" style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>
                <Icon name="check" size={13} stroke={2.6} /> saved locally in demo
              </span>
            )}
            <button type="button" onClick={save} className="btn btn-grad lower" style={{ padding: "11px 20px" }}>
              save changes
            </button>
          </div>
        </div>
      </StudioCard>

      <StudioCard title="notifications to followers">
        <Row label="go-live alerts" desc="notify followers the moment you start a stream">
          <Toggle on={tg.alerts} onChange={() => flip("alerts")} ariaLabel="go-live alerts" />
        </Row>
        <Row label="drop announcements" desc="push when you launch a new store product">
          <Toggle on={tg.dropPings} onChange={() => flip("dropPings")} ariaLabel="drop announcements" />
        </Row>
        <Row label="sub-goal celebrations" desc="show a milestone overlay when you hit a target" last>
          <Toggle on={tg.subGoals} onChange={() => flip("subGoals")} ariaLabel="sub-goal celebrations" />
        </Row>
      </StudioCard>
    </div>
  );
}

/* ── payout & tax tab ────────────────────────────────────── */

function PayoutTab({
  takeRatePct,
  payoutLabel,
  payoutSub,
}: {
  takeRatePct: number;
  payoutLabel: string;
  payoutSub: string;
}) {
  const [schedule, setSchedule] = useState("auto");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="payout schedule">
        <Seg
          items={[
            { id: "auto", label: "auto · monthly" },
            { id: "manual", label: "manual" },
          ]}
          value={schedule}
          onChange={setSchedule}
        />
        <div className="st-hint" style={{ marginTop: 14 }}>
          {schedule === "auto" ? (
            <>
              auto-payout sends your available balance to <strong>{payoutLabel}</strong> on the 1st of each month.
              minimum balance: none.
            </>
          ) : (
            <>
              manual payouts let you withdraw to <strong>{payoutLabel}</strong> whenever you like, from the earnings
              screen.
            </>
          )}
        </div>
        <div className="st-hint" style={{ marginTop: 8 }}>
          platform take-rate on earnings: <strong className="tnum">{takeRatePct}%</strong>.
        </div>
      </StudioCard>

      <StudioCard title="bank account">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            border: "1px solid var(--hairline)",
            borderRadius: 12,
          }}
        >
          <div style={{ width: 46, height: 30, borderRadius: 6, background: "var(--surface-3)" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{payoutLabel}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              {payoutSub}
            </div>
          </div>
          <Pill tone="ok">verified</Pill>
        </div>
        <button
          type="button"
          className="btn btn-glass lower"
          style={{ marginTop: 12, padding: "10px 14px", fontSize: 13 }}
        >
          <Icon name="plus" size={14} stroke={2.4} /> add method
        </button>
      </StudioCard>

      <StudioCard title="tax & legal">
        {(
          [
            ["legal entity", "Nyx Okafor (sole trader)"],
            ["jurisdiction", "United Kingdom · England & Wales"],
            ["VAT", "not registered"],
            ["tax form", "UK self-assessment · 2025/26"],
          ] as const
        ).map(([k, v], i, arr) => (
          <Row key={k} label={v} desc={k} last={i === arr.length - 1}>
            <button type="button" className="lower" style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 700 }}>
              edit
            </button>
          </Row>
        ))}
        <div style={{ marginTop: 14 }}>
          <button type="button" className="btn btn-glass lower" style={{ padding: "10px 14px", fontSize: 13 }}>
            <Icon name="chevR" size={14} stroke={2.4} /> download tax summary
          </button>
        </div>
      </StudioCard>
    </div>
  );
}

/* ── moderation tab ──────────────────────────────────────── */

function ModerationTab({ tg, flip }: { tg: Toggles; flip: (k: keyof Toggles) => void }) {
  const [terms, setTerms] = useState<string[]>(["spam", "scam links", "slurs", "self-promo"]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="chat rules">
        <Row label="slow mode" desc="one message every 5 seconds per viewer">
          <Toggle on={tg.slow} onChange={() => flip("slow")} ariaLabel="slow mode" />
        </Row>
        <Row label="members-only chat" desc="only paying members can post during streams">
          <Toggle on={tg.membersChat} onChange={() => flip("membersChat")} ariaLabel="members-only chat" />
        </Row>
        <Row label="auto-moderation" desc="hold risky messages for review automatically">
          <Toggle on={tg.automod} onChange={() => flip("automod")} ariaLabel="auto-moderation" />
        </Row>
        <Row label="allow raids" desc="let other creators send their viewers your way" last>
          <Toggle on={tg.raids} onChange={() => flip("raids")} ariaLabel="allow raids" />
        </Row>
      </StudioCard>

      <StudioCard title="blocked terms" sub="messages containing these are hidden">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {terms.map((t) => (
            <span
              key={t}
              className="lower"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 12px",
                borderRadius: 999,
                background: "var(--surface-2)",
                border: "1px solid var(--hairline)",
                fontSize: 12.5,
              }}
            >
              {t}
              <button
                type="button"
                aria-label={`remove ${t}`}
                onClick={() => setTerms((arr) => arr.filter((x) => x !== t))}
                style={{ color: "var(--ink-4)", display: "inline-flex" }}
              >
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
          <button type="button" className="chip lower" style={{ padding: "6px 12px", fontSize: 12.5 }}>
            <Icon name="plus" size={13} stroke={2.4} /> add
          </button>
        </div>
      </StudioCard>
    </div>
  );
}

/* ── team tab ────────────────────────────────────────────── */

function TeamTab({ name, handle }: { name: string; handle: string }) {
  const owner = { name, role: "owner" as const, handle };
  const team: { name: string; role: "owner" | "moderator" | "editor"; handle: string }[] = [
    owner,
    { name: "Sam Field", role: "moderator", handle: "@samf" },
    { name: "Ada Lin", role: "editor", handle: "@ada.edits" },
  ];
  return (
    <StudioCard title="team & roles" sub="invite people to help run your channel" pad={false}>
      {team.map((p, i) => (
        <div
          key={i}
          className="st-row"
          style={{ display: "grid", gridTemplateColumns: "1fr 120px 70px", alignItems: "center" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--surface-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                color: "var(--ink-2)",
                flex: "0 0 auto",
              }}
            >
              {initials(p.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>
                {p.name}
              </div>
              <div className="lower" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                {p.handle}
              </div>
            </div>
          </div>
          <div>
            <Pill tone={p.role === "owner" ? "info" : "neutral"}>{p.role}</Pill>
          </div>
          <div style={{ textAlign: "right" }}>
            {p.role !== "owner" && (
              <button type="button" aria-label={`manage ${p.name}`} style={{ color: "var(--ink-3)" }}>
                <Icon name="chevR" size={18} />
              </button>
            )}
          </div>
        </div>
      ))}
      <div style={{ padding: 16, borderTop: "1px solid var(--hairline)" }}>
        <button type="button" className="btn btn-grad-stroke lower" style={{ padding: "10px 16px", fontSize: 13 }}>
          <Icon name="plus" size={14} stroke={2.4} /> invite teammate
        </button>
      </div>
    </StudioCard>
  );
}

/* ── shared bits ─────────────────────────────────────────── */

function Row({
  label,
  desc,
  children,
  last = false,
}: {
  label: ReactNode;
  desc?: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--hairline)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="st-label">{label}</label>
      {children}
    </div>
  );
}

function ColorPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const swatch: CSSProperties = {
    width: 40,
    height: 40,
    border: "1px solid var(--hairline)",
    borderRadius: 10,
    background: "none",
    cursor: "pointer",
    padding: 0,
  };
  return (
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label="brand colour" style={swatch} />
  );
}

function initials(full: string): string {
  return full
    .replace(/^@/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default SxSettings;
