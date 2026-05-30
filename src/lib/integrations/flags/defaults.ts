/**
 * Local feature-flag defaults (docs/INTEGRATIONS.md §4 "reads local JSON",
 * docs/DECISIONS.md §3/§5). Deferred features ship built-but-off so the owner can
 * toggle them. Convention: new/risky flags default OFF in prod, ON in dev/preview.
 *
 * Each flag declares its dev and prod default; the mock resolves by current env.
 */

export interface FlagDefault {
  dev: boolean;
  prod: boolean;
  description: string;
}

/** Keys mirror deferred scope in docs/DECISIONS.md §5. */
export const FLAG_DEFAULTS: Record<string, FlagDefault> = {
  "co-watch-rooms": { dev: true, prod: false, description: "co-watch small rooms (LiveKit)" },
  courses: { dev: true, prod: false, description: "course products" },
  "usdc-topup": { dev: true, prod: false, description: "USDC wallet top-up" },
  bnpl: { dev: true, prod: false, description: "buy-now-pay-later (Klarna)" },
  "advanced-analytics": { dev: true, prod: false, description: "deeper creator analytics" },
  "region-us": { dev: true, prod: false, description: "US + non-UK/EU regions" },
  "referral-affiliate": { dev: true, prod: false, description: "referral / affiliate program" },
  "marketing-cms": { dev: true, prod: false, description: "marketing blog / CMS" },
};
