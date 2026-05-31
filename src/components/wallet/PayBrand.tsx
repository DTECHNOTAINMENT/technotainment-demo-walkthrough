/**
 * PayBrand — the real, recognisable brand mark for each payment method, shown on the left of a
 * top-up / payout row. Inline SVG (no network, themes cleanly, sharp on retina). Each mark sits
 * on a 40×26 rounded "card" so light-background logos (visa, mastercard, …) stay legible on the
 * dark theme; brands whose logo IS a coloured field (amex, klarna, …) fill the card themselves.
 *
 * These are trademarks of their owners, used here only to identify the corresponding payment
 * option (nominative use) — the standard pattern for a checkout method picker.
 */
import type { PaymentMethodId } from "@/lib/integrations";

const W = 40;
const H = 26;

function Card({ children, bg = "#fff", pad = true }: { children: React.ReactNode; bg?: string; pad?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: W,
        height: H,
        flex: `0 0 ${W}px`,
        borderRadius: 6,
        background: bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        boxShadow: bg === "#fff" ? "inset 0 0 0 1px rgba(0,0,0,0.10)" : "none",
        padding: pad ? 4 : 0,
      }}
    >
      {children}
    </span>
  );
}

function Visa() {
  return (
    <Card>
      <svg viewBox="0 0 48 16" width="32" height="11" role="img">
        <text x="24" y="13" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontStyle="italic" fontWeight="700" letterSpacing="0.5" fill="#1A1F71">VISA</text>
      </svg>
    </Card>
  );
}

function Mastercard() {
  return (
    <Card>
      <svg viewBox="0 0 40 26" width="34" height="22" role="img">
        <circle cx="16" cy="13" r="8" fill="#EB001B" />
        <circle cx="24" cy="13" r="8" fill="#F79E1B" />
        {/* overlap */}
        <path d="M20 6.7a8 8 0 0 1 0 12.6 8 8 0 0 1 0-12.6z" fill="#FF5F00" />
      </svg>
    </Card>
  );
}

function Amex() {
  return (
    <Card bg="#1F72CF" pad={false}>
      <svg viewBox="0 0 40 26" width="40" height="26" role="img">
        <text x="20" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="7.5" fontWeight="800" letterSpacing="0.4" fill="#fff">AMEX</text>
      </svg>
    </Card>
  );
}

function ApplePay() {
  return (
    <Card>
      <svg viewBox="0 0 44 22" width="34" height="17" role="img">
        <path
          fill="#000"
          d="M9.36 6.48c-.4.47-1.03.84-1.66.79-.08-.63.23-1.3.59-1.71.4-.48 1.09-.83 1.65-.85.07.65-.19 1.3-.58 1.77zm.57.9c-.91-.05-1.69.52-2.12.52-.44 0-1.1-.49-1.82-.48-.94.01-1.81.55-2.29 1.39-.98 1.69-.26 4.2.7 5.58.47.68 1.03 1.44 1.77 1.41.7-.03.98-.45 1.82-.45.85 0 1.1.45 1.83.44.76-.01 1.24-.69 1.7-1.37.54-.78.76-1.54.77-1.58-.02-.01-1.48-.57-1.49-2.25-.01-1.41 1.15-2.08 1.2-2.12-.66-.97-1.68-1.08-2.04-1.1z"
        />
        <text x="16" y="15.5" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="600" fill="#000">Pay</text>
      </svg>
    </Card>
  );
}

function GooglePay() {
  return (
    <Card>
      <svg viewBox="0 0 48 24" width="36" height="18" role="img">
        <g transform="translate(2,3) scale(0.75)">
          <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.55-5.17 3.55-8.87z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.86 11.86 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
        </g>
        <text x="22" y="16.5" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="500" fill="#5F6368">Pay</text>
      </svg>
    </Card>
  );
}

function PayPal({ balance = false }: { balance?: boolean }) {
  return (
    <Card bg={balance ? "#003087" : "#fff"} pad={!balance}>
      <svg viewBox="0 0 56 16" width="36" height="11" role="img">
        <text x="0" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontStyle="italic" fontWeight="700" fill={balance ? "#fff" : "#003087"}>Pay</text>
        <text x="27" y="13" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontStyle="italic" fontWeight="700" fill={balance ? "#99BBEE" : "#0070E0"}>Pal</text>
      </svg>
    </Card>
  );
}

function Venmo() {
  return (
    <Card bg="#008CFF" pad={false}>
      <svg viewBox="0 0 48 22" width="40" height="18" role="img">
        <text x="24" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontStyle="italic" fontWeight="700" fill="#fff">venmo</text>
      </svg>
    </Card>
  );
}

function CashApp() {
  return (
    <Card bg="#00D54B" pad={false}>
      <svg viewBox="0 0 26 26" width="26" height="26" role="img">
        <text x="13" y="19" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="800" fill="#fff">$</text>
      </svg>
    </Card>
  );
}

function Klarna() {
  return (
    <Card bg="#FFB3C7" pad={false}>
      <svg viewBox="0 0 40 26" width="40" height="26" role="img">
        <text x="20" y="17" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="800" fill="#0B051D">Klarna</text>
      </svg>
    </Card>
  );
}

function Ideal() {
  return (
    <Card>
      <svg viewBox="0 0 40 26" width="34" height="22" role="img">
        <text x="2" y="17" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontStyle="italic" fontWeight="800" fill="#0B051D">i</text>
        <text x="8" y="17" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="800" fill="#CC0066">DEAL</text>
      </svg>
    </Card>
  );
}

function Usdc() {
  return (
    <Card bg="#fff" pad={false}>
      <svg viewBox="0 0 26 26" width="26" height="26" role="img">
        <circle cx="13" cy="13" r="11" fill="#2775CA" />
        <text x="13" y="18" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontWeight="800" fill="#fff">$</text>
      </svg>
    </Card>
  );
}

/** A small bank / building mark for SEPA · ACH · Faster Payments. */
function Bank() {
  return (
    <Card bg="linear-gradient(135deg,#10b981,#06b6d4)" pad={false}>
      <svg viewBox="0 0 24 24" width="18" height="18" role="img" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10h18M5 10v8M19 10v8M9 10v8M15 10v8M3 18h18M12 3 3 8h18z" />
      </svg>
    </Card>
  );
}

/** Generic card mark for "add a new card". */
function GenericCard() {
  return (
    <Card bg="linear-gradient(135deg,#3b3b46,#1f1f27)" pad={false}>
      <svg viewBox="0 0 24 24" width="20" height="20" role="img" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
      </svg>
    </Card>
  );
}

export function PayBrand({ id }: { id: PaymentMethodId }) {
  switch (id) {
    case "visa":
      return <Visa />;
    case "mastercard":
      return <Mastercard />;
    case "amex":
      return <Amex />;
    case "apple-pay":
      return <ApplePay />;
    case "google-pay":
      return <GooglePay />;
    case "paypal":
      return <PayPal />;
    case "paypal-bal":
      return <PayPal balance />;
    case "venmo":
      return <Venmo />;
    case "cashapp":
      return <CashApp />;
    case "klarna":
      return <Klarna />;
    case "ideal":
      return <Ideal />;
    case "usdc":
      return <Usdc />;
    case "sepa":
    case "ach":
    case "faster":
      return <Bank />;
    case "new-card":
      return <GenericCard />;
    default:
      return <GenericCard />;
  }
}
