/* Payments — shared data + reusable brand glyphs + method picker.
   Used by the top-up flow, creator payouts, and admin connectors so every
   surface speaks the same payment vocabulary. */
(() => {
const { useState } = React;
const { Icon } = window;

/* ---------------------------------------------------------------------------
   PayBrand — compact wordmark chip for a payment brand.
   Text-based (brand colour + styling), so it themes cleanly and avoids
   pixel-recreating trademarked logos.
--------------------------------------------------------------------------- */
const BRАND = {}; // (placeholder so minifiers keep file shape)

const PayBrand = ({ id, size = 30 }) => {
  const h = size, w = Math.round(size * 1.5);
  const base = { width: w, height: h, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.42, letterSpacing: "-0.02em", flex: `0 0 ${w}px`, overflow: "hidden" };
  switch (id) {
    case "apple-pay":
      return <span style={{ ...base, background: "#000", color: "#fff" }}><span style={{ fontSize: size * 0.5 }}></span><span style={{ fontWeight: 600, marginLeft: 1 }}>Pay</span></span>;
    case "google-pay":
      return <span style={{ ...base, background: "#fff", border: "1px solid rgba(0,0,0,0.12)" }}><span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#5f6368", fontWeight: 600 }}>Pay</span></span>;
    case "paypal":
      return <span style={{ ...base, background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)" }}><span style={{ color: "#003087" }}>Pay</span><span style={{ color: "#0070e0" }}>Pal</span></span>;
    case "paypal-bal":
      return <span style={{ ...base, background: "#003087", color: "#fff" }}><span>Pay</span><span style={{ color: "#9cc3ff" }}>Pal</span></span>;
    case "venmo":
      return <span style={{ ...base, background: "#3D95CE", color: "#fff", fontStyle: "italic" }}>venmo</span>;
    case "cashapp":
      return <span style={{ ...base, background: "#00D632", color: "#fff", fontSize: size * 0.6 }}>$</span>;
    case "klarna":
      return <span style={{ ...base, background: "#FFB3C7", color: "#0b0b12" }}>Klarna.</span>;
    case "usdc":
      return <span style={{ ...base, background: "#2775CA", color: "#fff", fontSize: size * 0.5 }}>$</span>;
    case "visa":
    case "visa-4291":
      return <span style={{ ...base, background: "linear-gradient(135deg,#1a1f71,#3b82f6)", color: "#fff", fontStyle: "italic", fontSize: size * 0.4 }}>VISA</span>;
    case "mc-8830":
    case "mastercard":
      return <span style={{ ...base, background: "#1a1a22", position: "relative" }}>
        <span style={{ width: h * 0.5, height: h * 0.5, borderRadius: "50%", background: "#eb001b", marginRight: -h * 0.18 }} />
        <span style={{ width: h * 0.5, height: h * 0.5, borderRadius: "50%", background: "#f79e1b", opacity: 0.9 }} />
      </span>;
    case "amex":
      return <span style={{ ...base, background: "#006FCF", color: "#fff", fontSize: size * 0.32 }}>AMEX</span>;
    case "sepa": case "ach": case "bank": case "faster":
      return <span style={{ ...base, background: "linear-gradient(135deg,#10b981,#06b6d4)", color: "#fff" }}><Icon name="wallet" size={size * 0.5} stroke={2.2} /></span>;
    case "ideal":
      return <span style={{ ...base, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", color: "#cc0066" }}>iDEAL</span>;
    case "wise":
      return <span style={{ ...base, background: "#9fe870", color: "#163300" }}>wise</span>;
    case "payoneer":
      return <span style={{ ...base, background: "#ff4800", color: "#fff", fontSize: size * 0.34 }}>payo</span>;
    default:
      return <span style={{ ...base, background: "var(--surface-3)", color: "var(--ink-2)" }}><Icon name="wallet" size={size * 0.5} /></span>;
  }
};

/* ---------------------------------------------------------------------------
   TOP-UP methods (buying CAST). express = biometric / redirect, no 3DS.
--------------------------------------------------------------------------- */
const TOPUP_METHODS = [
  { id: "apple-pay",  label: "Apple Pay",          group: "express", instant: true, sub: "Touch ID / Face ID", regions: "global" },
  { id: "google-pay", label: "Google Pay",         group: "express", instant: true, sub: "1-tap checkout",      regions: "global" },
  { id: "paypal",     label: "PayPal",             group: "express", instant: true, sub: "redirect & approve",  regions: "global" },
  { id: "venmo",      label: "Venmo",              group: "express", instant: true, sub: "US only",             regions: "US" },
  { id: "cashapp",    label: "Cash App Pay",       group: "express", instant: true, sub: "US only",             regions: "US" },

  { id: "visa-4291",  label: "Visa ··4291",        group: "card", sub: "expires 09/28 · default", needs3ds: true },
  { id: "mc-8830",    label: "Mastercard ··8830",  group: "card", sub: "expires 04/27",          needs3ds: true },
  { id: "new-card",   label: "Add debit / credit card", group: "card", add: true },

  { id: "sepa",       label: "SEPA Direct Debit",  group: "bank", sub: "DE89 ··· 0000 · EUR" },
  { id: "ach",        label: "US bank · ACH",      group: "bank", sub: "Plaid linked · USD" },
  { id: "faster",     label: "Faster Payments",    group: "bank", sub: "UK · GBP" },
  { id: "ideal",      label: "iDEAL",              group: "bank", sub: "Netherlands" },

  { id: "paypal-bal", label: "PayPal balance",     group: "wallet", sub: "use your PayPal funds" },
  { id: "klarna",     label: "Klarna",             group: "later",  sub: "pay in 3 · 0% interest" },
  { id: "usdc",       label: "USDC",               group: "crypto", sub: "on-chain · base / polygon" },
];
const TOPUP_GROUPS = [
  { id: "express", label: "express checkout" },
  { id: "card",    label: "cards" },
  { id: "bank",    label: "bank & local" },
  { id: "wallet",  label: "wallets" },
  { id: "later",   label: "pay later" },
  { id: "crypto",  label: "crypto" },
];

/* ---------------------------------------------------------------------------
   PAYOUT methods (creators cashing out CAST).
--------------------------------------------------------------------------- */
const PAYOUT_METHODS = [
  { id: "bank",     label: "Bank transfer",   sub: "faster payments / SEPA / ACH · 1–2 days", fee: "free",   speed: "1–2 days" },
  { id: "instant",  label: "Instant to debit card", sub: "Visa / Mastercard · minutes",       fee: "1.5%",   speed: "minutes" },
  { id: "paypal",   label: "PayPal",          sub: "to your PayPal balance",                  fee: "free",   speed: "minutes" },
  { id: "venmo",    label: "Venmo",           sub: "US only",                                 fee: "free",   speed: "minutes" },
  { id: "wise",     label: "Wise",            sub: "multi-currency",                          fee: "free",   speed: "1 day" },
  { id: "payoneer", label: "Payoneer",        sub: "150+ countries",                          fee: "free",   speed: "1 day" },
  { id: "usdc",     label: "USDC",            sub: "stablecoin · on-chain",                   fee: "network",speed: "minutes" },
];

/* ---------------------------------------------------------------------------
   MethodRow — selectable payment method row (used in top-up + payout)
--------------------------------------------------------------------------- */
const MethodRow = ({ m, selected, onSelect, right }) => (
  <button onClick={() => onSelect(m.id)} style={{
    display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", width: "100%",
    border: "1.5px solid " + (selected ? "transparent" : "var(--hairline)"),
    borderRadius: 12, textAlign: "left",
    background: selected
      ? "linear-gradient(var(--surface), var(--surface)) padding-box, var(--brand-gradient) border-box"
      : "var(--surface)"
  }}>
    {m.add
      ? <span style={{ width: 45, height: 30, borderRadius: 7, background: "var(--surface-2)", border: "1px dashed var(--hairline-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", flex: "0 0 45px" }}><Icon name="plus" size={16} stroke={2.4} /></span>
      : <PayBrand id={m.id} size={30} />}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-1)" }}>{m.label}</div>
      {m.sub && <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{m.sub}</div>}
    </div>
    {right}
    {selected && !right && <Icon name="check" size={18} stroke={2.4} style={{ color: "var(--ink-1)" }} />}
  </button>
);

Object.assign(window, { PayBrand, TOPUP_METHODS, TOPUP_GROUPS, PAYOUT_METHODS, MethodRow });
})();
