"use client";

/**
 * SxOnboard — the "become a creator" multi-step flow. Mirrors prototype/v4/studio-onboarding.jsx
 * (5 steps: start → channel → membership → payout → review) and POSTs the assembled payload to
 * /api/studio/onboard, then routes to /studio on success.
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCast, formatFiat } from "@/lib/cast";
import { SX_INPUT, SX_LABEL } from "./SxPrimitives";

const STEPS = ["start", "channel", "membership", "payout", "review"] as const;
type StepName = (typeof STEPS)[number];

const CATEGORIES = ["modular synth", "live cooking", "gaming", "talk show", "music", "education", "sport", "art"];
const PERK_SUGGESTIONS = [
  "members-only chat",
  "early stream alerts",
  "downloadable extras",
  "monthly q&a",
  "10% off drops",
  "your name in credits",
];

const PAYOUT_METHODS: { id: string; label: string; sub: string }[] = [
  { id: "bank", label: "bank transfer", sub: "uk faster payments · free · 1–2 days" },
  { id: "instant", label: "instant payout", sub: "to debit card · 1.5% · minutes" },
  { id: "paypal", label: "paypal", sub: "balance · free · same day" },
  { id: "wise", label: "wise", sub: "multi-currency · network fee · 1 day" },
  { id: "payoneer", label: "payoneer", sub: "global · free · 1–2 days" },
  { id: "usdc", label: "usdc", sub: "on-chain · network gas · minutes" },
];

const VALUE_PROPS = [
  { title: "go live in minutes", desc: "stream from your encoder or the browser — followers get pinged the moment you start." },
  { title: "memberships & tips", desc: "recurring CAST income from members, one-off tips, gifted subs. you set the tiers." },
  { title: "sell drops & ppv", desc: "merch, courses, pay-per-view — fulfilled by technotainment, paid in CAST." },
  { title: "you keep your audience", desc: "your members are yours. if you ever leave, the relationship leaves with you." },
];

interface OnboardResponse {
  ok?: boolean;
  creatorId?: string;
  channelId?: string;
  error?: string;
}

export function SxOnboard({
  defaultName,
  defaultHandle,
}: {
  defaultName: string;
  defaultHandle: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(defaultName);
  const [handle, setHandle] = useState(defaultHandle.startsWith("@") ? defaultHandle : `@${defaultHandle}`);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [bio, setBio] = useState("");
  const [brand, setBrand] = useState("#7c3aed");
  const [brand2, setBrand2] = useState("#ec4899");
  const [tierName, setTierName] = useState("supporter");
  const [tierPrice, setTierPrice] = useState(250);
  const [perks, setPerks] = useState<string[]>(["members-only chat", "early stream alerts"]);
  const [payout, setPayout] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);

  const cleanHandle = handle.replace(/^@+/, "").trim();
  const previewHandle = cleanHandle ? `@${cleanHandle}` : "@handle";
  const togglePerk = (p: string) =>
    setPerks((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const stepName: StepName = STEPS[step];
  const canNext = useMemo(() => {
    switch (stepName) {
      case "channel":
        return name.trim().length > 0 && cleanHandle.length > 0;
      case "membership":
        return tierName.trim().length > 0 && tierPrice > 0;
      case "payout":
        return !!payout;
      case "review":
        return agree;
      default:
        return true;
    }
  }, [stepName, name, cleanHandle, tierName, tierPrice, payout, agree]);

  async function submit() {
    if (!payout) return;
    setBusy(true);
    setError(null);
    const method = PAYOUT_METHODS.find((m) => m.id === payout);
    try {
      const res = await fetch("/api/studio/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: previewHandle,
          category,
          bio: bio.trim() || undefined,
          brand,
          brand2,
          firstTier: { name: tierName.trim(), priceCast: Math.round(tierPrice), perks },
          payoutMethod: { methodId: payout, label: method?.label ?? payout },
        }),
      });
      const data: OnboardResponse = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "could not create your channel · try again");
        return;
      }
      router.push("/studio");
      router.refresh();
    } catch {
      setError("network error · try again");
    } finally {
      setBusy(false);
    }
  }

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 22px",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            className="lower"
            style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.03em", color: "var(--ink-1)" }}
          >
            technotainment
          </span>
          <span
            className="lower"
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "white",
              background: "var(--brand-gradient)",
              padding: "3px 9px",
              borderRadius: 999,
            }}
          >
            become a creator
          </span>
        </div>
      </div>

      {/* progress */}
      <div style={{ maxWidth: 620, width: "100%", margin: "0 auto", padding: "22px 20px 0" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                background: i <= step ? "var(--brand-gradient)" : "var(--surface-2)",
              }}
            />
          ))}
        </div>
        <div
          className="lower"
          style={{
            fontSize: 11,
            color: "var(--ink-4)",
            marginTop: 8,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          step {step + 1} of {STEPS.length} · {stepName}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "24px 20px 40px", overflowY: "auto" }}>
        <div style={{ maxWidth: 620, width: "100%" }}>
          {stepName === "start" && (
            <div>
              <h1
                className="lower"
                style={{
                  fontSize: "clamp(30px,5vw,42px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  margin: "8px 0 10px",
                  color: "var(--ink-1)",
                }}
              >
                turn your channel on.
              </h1>
              <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, maxWidth: 520 }}>
                you already watch, tip and collect on technotainment. creating is the same world, flipped around —
                go live, build a membership, and get paid in CAST you can withdraw to your bank.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                  gap: 12,
                  margin: "26px 0",
                }}
              >
                {VALUE_PROPS.map((v) => (
                  <div key={v.title} className="card" style={{ padding: 16, background: "var(--surface)" }}>
                    <div className="lower" style={{ fontSize: 13.5, fontWeight: 800 }}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.5 }}>{v.desc}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                technotainment takes a flat 12% of creator earnings — no monthly fee, no payout minimum, no
                per-transaction surcharge.
              </p>
            </div>
          )}

          {stepName === "channel" && (
            <div>
              <Heading title="your channel" sub="this is what viewers see across technotainment." />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="channel name">
                  <input style={SX_INPUT} value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="handle">
                  <input
                    style={SX_INPUT}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@yourname"
                  />
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
                    {previewHandle} · technotainment.app/c/{previewHandle}
                  </div>
                </Field>
                <Field label="what do you make?">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`chip ${category === c ? "active" : ""}`}
                        style={{
                          padding: "8px 14px",
                          border: `1px solid ${category === c ? "transparent" : "var(--hairline)"}`,
                          background: category === c ? "var(--ink-1)" : "var(--surface-2)",
                          color: category === c ? "var(--bg)" : "var(--ink-2)",
                          borderRadius: 999,
                        }}
                      >
                        <span className="lower">{c}</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="short bio · optional">
                  <textarea
                    style={{ ...SX_INPUT, resize: "vertical" }}
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="tell people what your channel is about…"
                  />
                </Field>
                <Field label="brand colours">
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <ColorPick value={brand} onChange={setBrand} />
                    <ColorPick value={brand2} onChange={setBrand2} />
                    <span
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 9,
                        background: `linear-gradient(135deg, ${brand}, ${brand2})`,
                        border: "1px solid var(--hairline)",
                      }}
                    />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {stepName === "membership" && (
            <div>
              <Heading
                title="your first membership"
                sub="start with one tier — you can add more, change pricing and perks any time."
              />
              <div
                className="card"
                style={{ background: "var(--surface)", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="tier name">
                    <input style={SX_INPUT} value={tierName} onChange={(e) => setTierName(e.target.value)} />
                  </Field>
                  <Field label="price · CAST / mo">
                    <input
                      style={{ ...SX_INPUT }}
                      className="tnum"
                      type="number"
                      min={0}
                      value={tierPrice}
                      onChange={(e) => setTierPrice(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    />
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
                      {formatFiat(tierPrice)}/mo · you keep {formatFiat(Math.round(tierPrice * 0.88))}
                    </div>
                  </Field>
                </div>
                <Field label="perks · pick what's included">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {PERK_SUGGESTIONS.map((p) => {
                      const on = perks.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePerk(p)}
                          className="chip lower"
                          style={{
                            padding: "8px 13px",
                            fontSize: 12.5,
                            borderRadius: 999,
                            border: `1px solid ${on ? "transparent" : "var(--hairline)"}`,
                            background: on ? "var(--ink-1)" : "var(--surface-2)",
                            color: on ? "var(--bg)" : "var(--ink-2)",
                          }}
                        >
                          {on ? "✓ " : ""}
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 14 }}>
                tips, drops and pay-per-view don&apos;t need a tier — they work the moment your channel is live.
              </p>
            </div>
          )}

          {stepName === "payout" && (
            <div>
              <Heading
                title="get paid"
                sub="CAST you earn converts to your local currency and pays out to your account. 100 CAST = £1.00."
              />
              <label style={SX_LABEL}>payout method</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PAYOUT_METHODS.map((m) => {
                  const on = payout === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayout(m.id)}
                      className="card"
                      style={{
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        textAlign: "left",
                        background: on ? "var(--surface-2)" : "var(--surface)",
                        border: `1.5px solid ${on ? "var(--hairline-2)" : "var(--hairline)"}`,
                      }}
                    >
                      <span
                        style={{
                          width: 36,
                          height: 26,
                          borderRadius: 6,
                          background: `linear-gradient(135deg, ${brand}, ${brand2})`,
                          flex: "0 0 36px",
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="lower" style={{ fontSize: 13.5, fontWeight: 700 }}>
                          {m.label}
                        </div>
                        <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>
                          {m.sub}
                        </div>
                      </div>
                      <span className={`tg ${on ? "on" : ""}`} style={{ pointerEvents: "none", flex: "0 0 36px" }} />
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 16 }}>
                this is a demo — no real account is connected. you can manage payout details later in studio →
                settings.
              </p>
            </div>
          )}

          {stepName === "review" && (
            <div>
              <Heading title="ready to launch" sub="review your channel, then open your studio." />
              <div className="card" style={{ background: "var(--surface)", padding: 0, overflow: "hidden", marginBottom: 16 }}>
                <div className="brand-hairline" />
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  {(
                    [
                      ["channel", `${name} · ${previewHandle}`],
                      ["category", category],
                      ["first tier", `${tierName} · ${formatCast(Math.round(tierPrice))} CAST/mo`],
                      ["perks", perks.join(" · ") || "—"],
                      ["payout", PAYOUT_METHODS.find((m) => m.id === payout)?.label ?? "—"],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13 }}>
                      <span className="lower" style={{ color: "var(--ink-3)" }}>
                        {k}
                      </span>
                      <span className="lower" style={{ fontWeight: 700, textAlign: "right" }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "4px 2px" }}>
                <span
                  className={`tg ${agree ? "on" : ""}`}
                  onClick={() => setAgree((a) => !a)}
                  style={{ flex: "0 0 36px", marginTop: 2 }}
                />
                <span style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  i agree to the technotainment creator terms and confirm i can publish the content i upload. earnings
                  are subject to a flat 12% platform fee.
                </span>
              </label>
            </div>
          )}

          {error && (
            <div className="lower" style={{ marginTop: 16, fontSize: 12.5, color: "var(--bg-red)" }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* footer nav */}
      <div style={{ borderTop: "1px solid var(--hairline)", padding: "14px 20px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 620, width: "100%", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="btn btn-glass lower"
            style={{ padding: "12px 18px", opacity: step === 0 ? 0.4 : 1 }}
          >
            back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="btn btn-grad lower"
              style={{ padding: "12px 24px", opacity: canNext ? 1 : 0.5 }}
            >
              {step === 0 ? "get started" : "continue"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!canNext || busy}
              className="btn btn-grad lower"
              style={{ padding: "12px 24px", opacity: canNext && !busy ? 1 : 0.5 }}
            >
              {busy ? "creating…" : "open my studio"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2
        className="lower"
        style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", margin: "4px 0 6px", color: "var(--ink-1)" }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-3)", margin: 0 }}>{sub}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={SX_LABEL}>{label}</label>
      {children}
    </div>
  );
}

function ColorPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="brand colour"
      style={{ width: 44, height: 36, border: "1px solid var(--hairline)", borderRadius: 9, background: "none", cursor: "pointer" }}
    />
  );
}

export default SxOnboard;
