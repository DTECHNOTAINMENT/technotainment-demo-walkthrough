"use client";

/**
 * AxControls — the owner control-center panels that aren't a single AxSetting form:
 * payment methods (top-up + payout rails), policies, pages/CMS + announcement, and the
 * branding extras (logo, brand colours, default theme). Each panel assembles its own value
 * object and POSTs { resource:'setting', key, value } via the unified admin action endpoint,
 * so a save writes a Setting + an AuditEvent and takes effect at runtime — no deploy
 * ("configure, don't code", CLAUDE.md §4b). Spec: prototype/v4/admin-controls.jsx.
 */
import { useState } from "react";
import { useAxAction } from "./useAxAction";
import { StudioCard, Toggle, Dropzone } from "@/components/studio-ui";
import { Icon } from "@/components/ui/Icon";

// ---- shared little helpers ----

function SaveBar({
  onSave,
  busy,
  saved,
  error,
  label = "save",
}: {
  onSave: () => void;
  busy: boolean;
  saved: boolean;
  error: string | null;
  label?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 14 }}>
      {error && (
        <span className="lower" style={{ fontSize: 12, color: "#ef4444" }}>
          {error}
        </span>
      )}
      {saved && !error && (
        <span className="lower" style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>
          saved · audited · live now
        </span>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={busy}
        className="btn btn-grad lower"
        style={{ padding: "11px 18px", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "saving…" : label}
      </button>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "13px 0",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lower" style={{ fontSize: 13.5, fontWeight: 600 }}>
          {label}
        </div>
        {desc && (
          <div className="lower" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
            {desc}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function Chips({ items, onRemove, onAdd }: { items: string[]; onRemove: (t: string) => void; onAdd: () => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((t) => (
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
          <button type="button" onClick={() => onRemove(t)} style={{ color: "var(--ink-4)", display: "inline-flex" }} aria-label={`remove ${t}`}>
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <button type="button" onClick={onAdd} className="chip" style={{ padding: "6px 12px", fontSize: 12.5 }}>
        <Icon name="plus" size={13} stroke={2.4} /> add
      </button>
    </div>
  );
}

// =====================================================================
// PAYMENT METHODS
// =====================================================================

export interface PayMethod {
  id: string;
  label: string;
  on: boolean;
}
export interface PaymentMethodsValue {
  topup: PayMethod[];
  payout: PayMethod[];
}

function MethodList({ list, onFlip }: { list: PayMethod[]; onFlip: (id: string) => void }) {
  return (
    <div>
      {list.map((m, i) => (
        <div
          key={m.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 0",
            borderTop: i ? "1px solid var(--hairline)" : "none",
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              flex: "0 0 28px",
              borderRadius: 7,
              background: "var(--surface-2)",
              border: "1px solid var(--hairline)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink-3)",
            }}
          >
            <Icon name="wallet" size={14} stroke={2} />
          </span>
          <span className="lower" style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>
            {m.label}
          </span>
          <span
            className="lower"
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.04em",
              padding: "3px 9px",
              borderRadius: 999,
              background: m.on ? "rgba(16,185,129,0.12)" : "var(--surface-2)",
              color: m.on ? "#10b981" : "var(--ink-3)",
              border: `1px solid ${m.on ? "rgba(16,185,129,0.3)" : "var(--hairline)"}`,
            }}
          >
            {m.on ? "live" : "off"}
          </span>
          <Toggle on={m.on} onChange={() => onFlip(m.id)} ariaLabel={`toggle ${m.label}`} />
        </div>
      ))}
    </div>
  );
}

export function AxPaymentMethods({ initial }: { initial: PaymentMethodsValue }) {
  const { run, busy, error } = useAxAction();
  const [topup, setTopup] = useState<PayMethod[]>(initial.topup);
  const [payout, setPayout] = useState<PayMethod[]>(initial.payout);
  const [saved, setSaved] = useState(false);

  const flip = (setter: React.Dispatch<React.SetStateAction<PayMethod[]>>) => (id: string) => {
    setSaved(false);
    setter((list) => list.map((m) => (m.id === id ? { ...m, on: !m.on } : m)));
  };

  async function save() {
    const res = await run({ resource: "setting", key: "payment-methods", value: { topup, payout } });
    if (res?.ok) setSaved(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="top-up methods" sub="which ways fans can buy CAST — toggle any on or off platform-wide">
        <MethodList list={topup} onFlip={flip(setTopup)} />
      </StudioCard>
      <StudioCard title="payout methods" sub="which ways creators can cash out">
        <MethodList list={payout} onFlip={flip(setPayout)} />
      </StudioCard>
      <SaveBar onSave={() => void save()} busy={busy} saved={saved} error={error} label="save methods" />
      <div className="st-hint">
        turning a method off hides it everywhere immediately. each one still needs its provider connected under{" "}
        <strong>connectors</strong> before it can go live for real.
      </div>
    </div>
  );
}

// =====================================================================
// POLICIES
// =====================================================================

export interface PoliciesValue {
  minAgeWatch: number;
  minAgeEarn: number;
  strikes: number;
  strikeAction: string;
  autoHoldHighRisk: boolean;
  membersOnlyChatDefault: boolean;
  blockedTerms: string[];
  guidelines: string;
}

export function AxPolicies({ initial }: { initial: PoliciesValue }) {
  const { run, busy, error } = useAxAction();
  const [v, setV] = useState<PoliciesValue>(initial);
  const [saved, setSaved] = useState(false);

  function patch<K extends keyof PoliciesValue>(key: K, value: PoliciesValue[K]) {
    setSaved(false);
    setV((s) => ({ ...s, [key]: value }));
  }

  function addTerm() {
    const term = typeof window !== "undefined" ? window.prompt("blocked term") : null;
    const t = term?.trim().toLowerCase();
    if (t && !v.blockedTerms.includes(t)) patch("blockedTerms", [...v.blockedTerms, t]);
  }

  async function save() {
    const res = await run({ resource: "setting", key: "policies", value: v });
    if (res?.ok) setSaved(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="age & access">
        <div className="st-split-even">
          <div>
            <label className="st-label">minimum age to watch</label>
            <input
              className="st-input tnum"
              type="number"
              value={v.minAgeWatch}
              onChange={(e) => patch("minAgeWatch", Number(e.target.value))}
            />
            <div className="lower" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }}>
              collected at signup
            </div>
          </div>
          <div>
            <label className="st-label">minimum age to earn / spend</label>
            <input
              className="st-input tnum"
              type="number"
              value={v.minAgeEarn}
              onChange={(e) => patch("minAgeEarn", Number(e.target.value))}
            />
          </div>
        </div>
      </StudioCard>

      <StudioCard title="enforcement">
        <div className="st-split-even">
          <div>
            <label className="st-label">strikes before ban</label>
            <input
              className="st-input tnum"
              type="number"
              value={v.strikes}
              onChange={(e) => patch("strikes", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="st-label">escalation</label>
            <input
              className="st-input"
              value={v.strikeAction}
              onChange={(e) => patch("strikeAction", e.target.value)}
            />
          </div>
        </div>
        <Row label="auto-hold high-risk content" desc="AI holds risky uploads / messages for human review">
          <Toggle on={v.autoHoldHighRisk} onChange={(n) => patch("autoHoldHighRisk", n)} ariaLabel="auto-hold high-risk" />
        </Row>
        <Row label="members-only chat by default" desc="new creators start with members-only live chat">
          <Toggle on={v.membersOnlyChatDefault} onChange={(n) => patch("membersOnlyChatDefault", n)} ariaLabel="members-only chat default" />
        </Row>
      </StudioCard>

      <StudioCard title="blocked terms" sub="messages containing these are auto-hidden in chat">
        <Chips
          items={v.blockedTerms}
          onRemove={(t) => patch("blockedTerms", v.blockedTerms.filter((x) => x !== t))}
          onAdd={addTerm}
        />
      </StudioCard>

      <StudioCard title="community guidelines" sub="shown to users · the rules everyone agrees to">
        <textarea
          className="st-input"
          rows={4}
          value={v.guidelines}
          onChange={(e) => patch("guidelines", e.target.value)}
          style={{ resize: "vertical" }}
        />
        <SaveBar onSave={() => void save()} busy={busy} saved={saved} error={error} label="save policies" />
      </StudioCard>
    </div>
  );
}

// =====================================================================
// PAGES / CMS + ANNOUNCEMENT
// =====================================================================

export interface CmsPage {
  id: string;
  title: string;
  path: string;
  published: boolean;
  body: string;
}
export interface PagesValue {
  pages: CmsPage[];
}
export interface AnnouncementValue {
  on: boolean;
  text: string;
}

export function AxPages({
  initialPages,
  initialAnnouncement,
}: {
  initialPages: PagesValue;
  initialAnnouncement: AnnouncementValue;
}) {
  const pagesAct = useAxAction();
  const annAct = useAxAction();
  const [pages, setPages] = useState<CmsPage[]>(initialPages.pages);
  const [editing, setEditing] = useState<string | null>(null);
  const [pagesSaved, setPagesSaved] = useState(false);
  const [ann, setAnn] = useState<AnnouncementValue>(initialAnnouncement);
  const [annSaved, setAnnSaved] = useState(false);

  function patchPage(id: string, key: keyof CmsPage, value: CmsPage[keyof CmsPage]) {
    setPagesSaved(false);
    setPages((list) => list.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }

  async function savePages() {
    const res = await pagesAct.run({ resource: "setting", key: "pages", value: { pages } });
    if (res?.ok) setPagesSaved(true);
  }
  async function saveAnnouncement() {
    const res = await annAct.run({ resource: "setting", key: "announcement", value: ann });
    if (res?.ok) setAnnSaved(true);
  }

  const COLS = "1fr 1fr 90px 70px";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <StudioCard title="pages" sub="legal, help and marketing content — edit without a developer" pad={false}>
        <div className="st-row head" style={{ gridTemplateColumns: COLS }}>
          <span>page</span>
          <span>path</span>
          <span style={{ textAlign: "center" }}>published</span>
          <span style={{ textAlign: "right" }}>edit</span>
        </div>
        {pages.map((pg) => (
          <div key={pg.id}>
            <div className="st-row" style={{ gridTemplateColumns: COLS }}>
              <span className="lower" style={{ fontSize: 13.5, fontWeight: 600 }}>
                {pg.title}
              </span>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {pg.path}
              </span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <Toggle on={pg.published} onChange={(n) => patchPage(pg.id, "published", n)} ariaLabel={`publish ${pg.title}`} />
              </span>
              <span style={{ textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn-glass lower"
                  style={{ padding: "5px 10px", fontSize: 11.5 }}
                  onClick={() => setEditing((e) => (e === pg.id ? null : pg.id))}
                >
                  {editing === pg.id ? "close" : "edit"}
                </button>
              </span>
            </div>
            {editing === pg.id && (
              <div style={{ padding: "0 18px 16px" }}>
                <textarea
                  className="st-input"
                  rows={6}
                  value={pg.body}
                  onChange={(e) => patchPage(pg.id, "body", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            )}
          </div>
        ))}
        <div style={{ padding: "0 18px 16px" }}>
          <SaveBar onSave={() => void savePages()} busy={pagesAct.busy} saved={pagesSaved} error={pagesAct.error} label="save pages" />
        </div>
      </StudioCard>

      <StudioCard title="system announcement" sub="show a banner to everyone — maintenance, launches, notices">
        <Row label="show announcement banner" desc="appears at the top of the app for all users">
          <Toggle
            on={ann.on}
            onChange={(n) => {
              setAnnSaved(false);
              setAnn((s) => ({ ...s, on: n }));
            }}
            ariaLabel="show announcement banner"
          />
        </Row>
        {ann.on && (
          <div style={{ marginTop: 12 }}>
            <input
              className="st-input"
              placeholder="e.g. scheduled maintenance sunday 02:00–03:00 UTC"
              value={ann.text}
              onChange={(e) => {
                setAnnSaved(false);
                setAnn((s) => ({ ...s, text: e.target.value }));
              }}
            />
          </div>
        )}
        <SaveBar onSave={() => void saveAnnouncement()} busy={annAct.busy} saved={annSaved} error={annAct.error} label="save announcement" />
      </StudioCard>
    </div>
  );
}

// =====================================================================
// BRANDING EXTRAS — logo / colours / default theme
// =====================================================================

export interface BrandingExtrasValue {
  brandColor: string;
  brandColor2: string;
  defaultTheme: "dark" | "light" | "system";
}

export function AxBrandingExtras({ initial }: { initial: BrandingExtrasValue }) {
  const { run, busy, error } = useAxAction();
  const [v, setV] = useState<BrandingExtrasValue>(initial);
  const [saved, setSaved] = useState(false);

  function patch<K extends keyof BrandingExtrasValue>(key: K, value: BrandingExtrasValue[K]) {
    setSaved(false);
    setV((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    // merge into the existing 'branding' setting key (text fields are saved separately by AxSetting;
    // here we patch only the visual identity keys so a save doesn't clobber names — the action
    // endpoint upserts the whole value, so we send the extras under their own keys).
    const res = await run({ resource: "setting", key: "branding-theme", value: v });
    if (res?.ok) setSaved(true);
  }

  const themes: Array<BrandingExtrasValue["defaultTheme"]> = ["dark", "light", "system"];

  return (
    <StudioCard title="logo & visual identity" sub="logo, brand colours and the default theme — applied platform-wide">
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <label className="st-label">logo</label>
          <div style={{ width: 200 }}>
            <Dropzone title="upload logo" sub="svg or png" icon="sparkle" accept="image/*" />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <label className="st-label">brand colours</label>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={v.brandColor}
                onChange={(e) => patch("brandColor", e.target.value)}
                aria-label="primary brand colour"
                style={{ width: 40, height: 40, border: "1px solid var(--hairline)", borderRadius: 9, background: "transparent", cursor: "pointer" }}
              />
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {v.brandColor}
              </span>
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={v.brandColor2}
                onChange={(e) => patch("brandColor2", e.target.value)}
                aria-label="secondary brand colour"
                style={{ width: 40, height: 40, border: "1px solid var(--hairline)", borderRadius: 9, background: "transparent", cursor: "pointer" }}
              />
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                {v.brandColor2}
              </span>
            </label>
          </div>

          <label className="st-label" style={{ marginTop: 16 }}>
            default theme
          </label>
          <div
            style={{
              display: "inline-flex",
              gap: 2,
              padding: 3,
              background: "var(--surface-2)",
              borderRadius: 10,
              border: "1px solid var(--hairline)",
            }}
          >
            {themes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch("defaultTheme", t)}
                className="lower"
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: v.defaultTheme === t ? "var(--surface)" : "transparent",
                  color: v.defaultTheme === t ? "var(--ink-1)" : "var(--ink-3)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
      <SaveBar onSave={() => void save()} busy={busy} saved={saved} error={error} label="save visual identity" />
    </StudioCard>
  );
}
