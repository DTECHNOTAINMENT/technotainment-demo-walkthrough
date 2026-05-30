/* Admin / back-office — shared data model.
   The company's operational view of the whole platform: users, creators,
   money, moderation, integrations, configuration. Reuses studio primitives. */
(() => {
const { formatNum, CREATORS } = window;

const months = ["jun","jul","aug","sep","oct","nov","dec","jan","feb","mar","apr","may"];

// ---- platform-wide series ----------------------------------------------
const GMV = [1.82, 1.94, 2.11, 2.34, 2.28, 2.61, 2.92, 2.78, 3.14, 3.42, 3.71, 4.08].map(v => Math.round(v * 1e6)); // CAST gross merch value /mo
const REVENUE = GMV.map(v => Math.round(v * 0.12)); // platform take (12%)
const USERS = [180, 196, 214, 241, 262, 289, 318, 342, 371, 402, 438, 472].map(k => k * 1000);
const PAYOUTS = GMV.map(v => Math.round(v * 0.868)); // paid to creators

// ---- live operational counters -----------------------------------------
const PLATFORM = {
  gmvMonth: GMV[GMV.length - 1],
  revenueMonth: REVENUE[REVENUE.length - 1],
  users: 472310,
  creators: 9840,
  liveNow: 1284,
  castInCirculation: 84200000,
  pendingPayouts: 2410000,
  flaggedOpen: 37,
  disputesOpen: 12,
  uptime: 99.98,
};

// ---- revenue by product line (CAST, this month) -------------------------
const REV_LINES = [
  { id: "memberships", label: "memberships", cast: 1840000, color: "#8b5cf6" },
  { id: "tips",        label: "tips",        cast: 1120000, color: "#ec4899" },
  { id: "drops",       label: "drops & store", cast: 640000, color: "#06b6d4" },
  { id: "ppv",         label: "ppv & tickets", cast: 312000, color: "#f97316" },
  { id: "topups",      label: "top-up spread", cast: 168000, color: "#10b981" },
];

// ---- payment mix (how money comes in) -----------------------------------
const PAY_MIX = [
  { id: "apple-pay",  label: "Apple Pay",   pct: 31 },
  { id: "visa",       label: "Cards",       pct: 28 },
  { id: "google-pay", label: "Google Pay",  pct: 14 },
  { id: "paypal",     label: "PayPal",      pct: 11 },
  { id: "sepa",       label: "Bank / SEPA", pct: 8 },
  { id: "venmo",      label: "Venmo",       pct: 5 },
  { id: "usdc",       label: "USDC",        pct: 3 },
];

// ---- users table --------------------------------------------------------
const STATUS = ["active", "active", "active", "active", "suspended", "active", "pending", "active"];
const USER_ROWS = [
  { id: "U-48210", handle: "@mira.k",   email: "mira@hey.com",     joined: "8 mo",  kyc: "verified", status: "active",    balance: 12480, spent: 184200, role: "member" },
  { id: "U-48199", handle: "@oren.s",   email: "oren@proton.me",   joined: "5 mo",  kyc: "verified", status: "active",    balance: 320,   spent: 42100,  role: "member" },
  { id: "U-48155", handle: "@theo.w",   email: "theo@gmail.com",   joined: "1 yr",  kyc: "verified", status: "active",    balance: 9100,  spent: 98200,  role: "member" },
  { id: "U-48140", handle: "@spamzz",   email: "x9@temp.io",       joined: "2 d",   kyc: "failed",   status: "suspended", balance: 0,     spent: 0,      role: "member", flag: "fraud signals" },
  { id: "U-48122", handle: "@nia.p",    email: "nia@me.com",       joined: "3 mo",  kyc: "verified", status: "active",    balance: 1840,  spent: 22400,  role: "member" },
  { id: "U-48090", handle: "@dev.r",    email: "dev@fastmail.com", joined: "11 mo", kyc: "verified", status: "active",    balance: 4300,  spent: 61200,  role: "member" },
  { id: "U-48051", handle: "@quinn.l",  email: "q@duck.com",       joined: "1 mo",  kyc: "pending",  status: "pending",   balance: 200,   spent: 980,    role: "member" },
  { id: "U-48000", handle: "@aaron.t",  email: "aaron@aol.com",    joined: "6 mo",  kyc: "verified", status: "active",    balance: 760,   spent: 15100,  role: "member" },
];

// ---- creators table -----------------------------------------------------
const CREATOR_ROWS = CREATORS.slice(0, 9).map((c, i) => ({
  id: "C-" + (2100 + i),
  creator: c,
  status: i === 4 ? "review" : i === 7 ? "payout-hold" : "active",
  kyc: i === 4 ? "pending" : "verified",
  members: [3214, 1820, 980, 5400, 142, 2100, 760, 1240, 430][i],
  mrrCast: [248000, 96000, 51000, 412000, 8200, 134000, 41000, 88000, 19000][i],
  take: i === 3 ? 10 : 12, // negotiated take-rate
}));

// ---- creator applications queue -----------------------------------------
const APPLICATIONS = [
  { id: "AP-3391", handle: "@lumen.fields", cat: "ambient music",  followers: 18200, when: "2h ago",  risk: "low" },
  { id: "AP-3388", handle: "@chef.bao",     cat: "live cooking",   followers: 4200,  when: "5h ago",  risk: "low" },
  { id: "AP-3382", handle: "@grid.runner",  cat: "esports",        followers: 92000, when: "1d ago",  risk: "medium" },
  { id: "AP-3375", handle: "@x_promo_x",    cat: "talk",           followers: 120,   when: "1d ago",  risk: "high" },
];

// ---- moderation queue ---------------------------------------------------
const REPORTS = [
  { id: "R-9921", target: "@grid.runner", type: "stream", reason: "harassment in chat",        reports: 14, when: "8m ago",  severity: "high",   status: "open" },
  { id: "R-9918", target: "field recordings · vol 4", type: "product", reason: "copyright claim", reports: 3, when: "41m ago", severity: "medium", status: "open" },
  { id: "R-9911", target: "@x_promo_x",   type: "user",   reason: "spam / scam links",         reports: 28, when: "1h ago",  severity: "high",   status: "open" },
  { id: "R-9904", target: "night session #13", type: "vod", reason: "music licensing",          reports: 1,  when: "3h ago",  severity: "low",    status: "investigating" },
  { id: "R-9890", target: "@anon_4421",   type: "user",   reason: "underage signup",            reports: 2,  when: "5h ago",  severity: "high",   status: "open" },
  { id: "R-9882", target: "rooftop set · clip", type: "clip", reason: "nudity",                 reports: 6,  when: "6h ago",  severity: "medium", status: "open" },
];

// ---- transactions ledger ------------------------------------------------
const TXNS = [
  { id: "TXR-9F2A", user: "@mira.k",  kind: "top-up",   gross: "£42.00", cast: 4200,  method: "apple-pay",  status: "settled", when: "2m" },
  { id: "TXR-9F28", user: "@oren.s",  kind: "tip",      gross: "—",      cast: -250,  method: "balance",    status: "settled", when: "6m" },
  { id: "TXR-9F25", user: "@nia.p",   kind: "drop",     gross: "—",      cast: -120,  method: "balance",    status: "settled", when: "11m" },
  { id: "TXR-9F1F", user: "@theo.w",  kind: "top-up",   gross: "$25.00", cast: 2000,  method: "google-pay", status: "settled", when: "18m" },
  { id: "TXR-9F1A", user: "@quinn.l", kind: "top-up",   gross: "£10.00", cast: 1000,  method: "paypal",     status: "pending", when: "22m" },
  { id: "TXR-9F11", user: "@dev.r",   kind: "ppv",      gross: "—",      cast: -60,   method: "balance",    status: "settled", when: "30m" },
  { id: "TXR-9F05", user: "@x9",      kind: "top-up",   gross: "£80.00", cast: 8000,  method: "visa",       status: "reversed",when: "44m", flag: "chargeback" },
  { id: "TXR-9EF8", user: "@aaron.t", kind: "top-up",   gross: "£20.00", cast: 2000,  method: "venmo",      status: "settled", when: "1h" },
];

// ---- payout runs --------------------------------------------------------
const PAYOUT_RUNS = [
  { id: "RUN-2041", date: "1 may 2026", creators: 8420, cast: 2410000, status: "scheduled", method: "mixed" },
  { id: "RUN-2009", date: "1 apr 2026", creators: 8120, cast: 2210000, status: "paid",      method: "mixed" },
  { id: "RUN-1977", date: "1 mar 2026", creators: 7840, cast: 2040000, status: "paid",      method: "mixed" },
];

// ---- integrations / connectors ------------------------------------------
const CONNECTORS = [
  { id: "stripe",    name: "Stripe",          cat: "payments", status: "live",     desc: "card processing, 3-D Secure, radar fraud", events: "1.2M / mo" },
  { id: "adyen",     name: "Adyen",           cat: "payments", status: "live",     desc: "global acquiring + local methods",         events: "840k / mo" },
  { id: "paypal",    name: "PayPal / Venmo",  cat: "payments", status: "live",     desc: "wallet + Venmo (US)",                      events: "210k / mo" },
  { id: "applepay",  name: "Apple Pay",       cat: "payments", status: "live",     desc: "merchant tokenization",                    events: "—" },
  { id: "googlepay", name: "Google Pay",      cat: "payments", status: "live",     desc: "merchant tokenization",                    events: "—" },
  { id: "circle",    name: "Circle (USDC)",   cat: "payments", status: "beta",     desc: "stablecoin top-ups & payouts",             events: "12k / mo" },
  { id: "persona",   name: "Persona",         cat: "identity", status: "live",     desc: "KYC / KYB, age & ID verification",         events: "9.8k / mo" },
  { id: "sift",      name: "Sift",            cat: "risk",     status: "live",     desc: "fraud & chargeback scoring",               events: "1.1M / mo" },
  { id: "mux",       name: "Mux",             cat: "media",    status: "live",     desc: "live ingest, transcode, VOD",              events: "live" },
  { id: "cloudflare",name: "Cloudflare",      cat: "media",    status: "live",     desc: "CDN, stream edge, WAF",                    events: "—" },
  { id: "twilio",    name: "Twilio",          cat: "comms",    status: "live",     desc: "SMS OTP & alerts",                         events: "320k / mo" },
  { id: "sendgrid",  name: "SendGrid",        cat: "comms",    status: "live",     desc: "transactional email",                      events: "2.4M / mo" },
  { id: "avalara",   name: "Avalara",         cat: "tax",      status: "live",     desc: "VAT / sales-tax & 1099/DAC7",              events: "—" },
  { id: "segment",   name: "Segment",         cat: "data",     status: "live",     desc: "product analytics pipeline",               events: "—" },
  { id: "openai",    name: "AI Moderation",   cat: "trust",    status: "beta",     desc: "auto-flag chat, images, audio",            events: "live" },
  { id: "datadog",   name: "Datadog",         cat: "infra",    status: "live",     desc: "APM, logs, alerting",                      events: "—" },
  { id: "gsc",       name: "Google Search Console", cat: "growth", status: "live", desc: "index coverage, search queries & sitemaps", events: "—" },
  { id: "bing",      name: "Bing Webmaster",  cat: "growth",   status: "live",     desc: "Bing index + IndexNow instant submit",      events: "—" },
  { id: "ahrefs",    name: "Ahrefs",          cat: "growth",   status: "beta",     desc: "rank tracking, keywords & backlinks",       events: "weekly" },
  { id: "branch",    name: "Branch",          cat: "growth",   status: "live",     desc: "deep links & app indexing (universal links)", events: "180k / mo" },
  { id: "sanity",    name: "Sanity CMS",      cat: "growth",   status: "live",     desc: "marketing site & blog · programmatic SEO",  events: "—" },
  { id: "ogimage",   name: "OG Image Service", cat: "growth",  status: "live",     desc: "dynamic share cards per video & creator",   events: "live" },
];
const CONNECTOR_CATS = ["payments","identity","risk","media","comms","tax","data","growth","trust","infra"];

// ---- API keys -----------------------------------------------------------
const API_KEYS = [
  { id: "pk_live", label: "Publishable key", scope: "client", value: "pk_live_51Nx···a8F2", created: "mar 2026", lastUsed: "live" },
  { id: "sk_live", label: "Secret key",      scope: "server", value: "sk_live_····················", created: "mar 2026", lastUsed: "live", secret: true },
  { id: "whsec",   label: "Webhook signing", scope: "server", value: "whsec_····················",  created: "mar 2026", lastUsed: "2m ago", secret: true },
  { id: "pk_test", label: "Test key",        scope: "client", value: "pk_test_51Nx···Q19z", created: "jan 2026", lastUsed: "1d ago" },
];

// ---- webhooks -----------------------------------------------------------
const WEBHOOKS = [
  { url: "https://api.technotainment.fm/hooks/payments", events: "payment.*", status: "healthy", delivered: "99.9%" },
  { url: "https://api.technotainment.fm/hooks/payouts",  events: "payout.*",  status: "healthy", delivered: "100%" },
  { url: "https://api.technotainment.fm/hooks/moderation", events: "report.* · strike.*", status: "degraded", delivered: "97.2%" },
];

// ---- feature flags ------------------------------------------------------
const FLAGS = [
  { id: "small-rooms",  label: "small rooms (metacast)", on: true,  rollout: "100%", desc: "co-watch rooms with shared CAST pot", group: "live" },
  { id: "usdc",         label: "USDC top-up & payout",   on: true,  rollout: "100%", desc: "stablecoin rails", group: "live" },
  { id: "ai-mod",       label: "AI auto-moderation",     on: true,  rollout: "60%",  desc: "auto-flag risky chat / media", group: "live" },
  { id: "gift-subs",    label: "gifted subscriptions",   on: true,  rollout: "100%", desc: "buy subs for other viewers", group: "live" },
  { id: "instant-pay",  label: "instant payouts",        on: false, rollout: "0%",   desc: "to debit card, 1.5% fee", group: "live" },
  { id: "creator-tax",  label: "DAC7 tax reporting",     on: true,  rollout: "EU",   desc: "auto file creator earnings", group: "live" },
  // Deferred roadmap features — flip ON when you're ready, no code change needed.
  { id: "courses",      label: "courses & lessons",      on: false, rollout: "0%",   desc: "multi-lesson paid courses in the store", group: "roadmap" },
  { id: "native-apps",  label: "native mobile apps",     on: false, rollout: "0%",   desc: "iOS / Android apps + in-app purchase", group: "roadmap" },
  { id: "bnpl",         label: "buy-now-pay-later",      on: false, rollout: "0%",   desc: "Klarna pay-in-3 at top-up", group: "roadmap" },
  { id: "region-us",    label: "launch United States",   on: false, rollout: "0%",   desc: "open US sign-ups, USD, 1099-K", group: "roadmap" },
  { id: "referrals",    label: "referral / affiliate",   on: false, rollout: "0%",   desc: "reward fans for inviting friends", group: "roadmap" },
  { id: "blog-cms",     label: "marketing blog & CMS",   on: false, rollout: "0%",   desc: "programmatic-SEO content site", group: "roadmap" },
];

// ---- audit log ----------------------------------------------------------
const AUDIT = [
  { who: "you",         action: "suspended user @spamzz",            when: "12m ago", kind: "moderation" },
  { who: "sam.field",   action: "approved creator @lumen.fields",    when: "1h ago",  kind: "creators" },
  { who: "system",      action: "auto-flagged R-9911 (28 reports)",  when: "1h ago",  kind: "trust" },
  { who: "ada.lin",     action: "set @gridrunner take-rate to 10%",  when: "3h ago",  kind: "finance" },
  { who: "you",         action: "rotated webhook signing secret",    when: "5h ago",  kind: "security" },
  { who: "system",      action: "payout RUN-2009 paid · 8,120 creators", when: "yesterday", kind: "finance" },
];

// ---- team / RBAC --------------------------------------------------------
const ADMIN_TEAM = [
  { name: "You (Owner)",  email: "ops@technotainment.fm", role: "owner",      mfa: true },
  { name: "Sam Field",    email: "sam@technotainment.fm", role: "trust & safety", mfa: true },
  { name: "Ada Lin",      email: "ada@technotainment.fm", role: "finance",    mfa: true },
  { name: "Ravi Okonkwo", email: "ravi@technotainment.fm", role: "support",  mfa: false },
];

// ---- SEO / growth -------------------------------------------------------
const GROWTH = {
  clicks: [128, 142, 161, 188, 204, 241, 286, 312, 358, 402, 451, 512].map(k => k * 1000),
  impressions: [4.1, 4.6, 5.2, 6.1, 6.8, 7.9, 9.2, 10.1, 11.4, 12.8, 14.2, 16.1].map(v => Math.round(v * 1e6)),
  ctr: 3.2, position: 8.4,
  indexed: 184200, submitted: 192400, errors: 1240,
  cwv: { lcp: "1.9s", cls: "0.04", inp: "176ms", status: "good", pass: 92 },
  organicShare: 38,
  topQueries: [
    { q: "modular synth live stream", clicks: 18400, impr: 412000, pos: 2.1 },
    { q: "nyx okafor buchla",         clicks: 12100, impr: 88000,  pos: 1.4 },
    { q: "ambient music live",        clicks: 9800,  impr: 640000, pos: 6.8 },
    { q: "watch live cooking",        clicks: 7200,  impr: 980000, pos: 9.2 },
    { q: "patch sheet download",      clicks: 4100,  impr: 52000,  pos: 3.0 },
  ],
  topPages: [
    { url: "/c/nyxsynth",             clicks: 41200, type: "channel" },
    { url: "/watch/night-session-13", clicks: 28800, type: "video" },
    { url: "/explore/modular-synth",  clicks: 19400, type: "category" },
    { url: "/clip/the-bass-thing",    clicks: 16100, type: "clip" },
    { url: "/live",                   clicks: 12400, type: "index" },
  ],
  sitemaps: [
    { name: "creators.xml",   urls: 9840,   status: "healthy", indexed: "98%" },
    { name: "videos.xml",     urls: 142800, status: "healthy", indexed: "94%" },
    { name: "clips.xml",      urls: 38200,  status: "healthy", indexed: "91%" },
    { name: "categories.xml", urls: 64,     status: "healthy", indexed: "100%" },
  ],
  redirects: [
    { from: "/u/:handle",  to: "/c/:handle",   hits: "12k / mo",  code: 301 },
    { from: "/video/:id",  to: "/watch/:slug", hits: "8.2k / mo", code: 301 },
    { from: "/stream/:id", to: "/watch/:slug", hits: "3.1k / mo", code: 301 },
  ],
};

// ---- owner control center config ---------------------------------------
const BRANDING = {
  appName: "Metascape",
  company: "Technotainment",
  tagline: "watch live. spend CAST. own your audience.",
  brandColor: "#8b5cf6",
  accentColor: "#ec4899",
  defaultTheme: "dark",        // dark | light | system
  currencyName: "CAST",
  supportEmail: "help@technotainment.fm",
};
// platform-wide payment method switches (which rails are offered to everyone)
const PAY_TOGGLES = {
  topup:  [
    { id: "apple-pay", label: "Apple Pay", on: true }, { id: "google-pay", label: "Google Pay", on: true },
    { id: "visa", label: "Cards (Visa/MC/Amex)", on: true }, { id: "paypal", label: "PayPal", on: true },
    { id: "venmo", label: "Venmo (US)", on: false }, { id: "sepa", label: "Bank / SEPA / ACH", on: true },
    { id: "klarna", label: "Klarna (pay later)", on: false }, { id: "usdc", label: "USDC", on: true },
  ],
  payout: [
    { id: "bank", label: "Bank transfer", on: true }, { id: "instant", label: "Instant to debit", on: false },
    { id: "paypal", label: "PayPal", on: true }, { id: "venmo", label: "Venmo (US)", on: false },
    { id: "wise", label: "Wise", on: true }, { id: "payoneer", label: "Payoneer", on: true }, { id: "usdc", label: "USDC", on: true },
  ],
};
const POLICIES = {
  minAgeWatch: 16, minAgeEarn: 18,
  strikes: 3, strikeAction: "warn → 7-day suspend → ban",
  blockedTerms: ["spam", "scam links", "slurs", "self-promo"],
  guidelines: "be real, be kind, own your work. no harassment, hate, illegal content, or copyright infringement. creators keep their audience; we keep the platform safe.",
  autoHoldHighRisk: true, membersOnlyChatDefault: false,
};
const PAGES = [
  { id: "terms",    title: "Terms of Service", path: "/legal/terms",   status: "published", updated: "12 mar 2026" },
  { id: "privacy",  title: "Privacy Policy",   path: "/legal/privacy", status: "published", updated: "12 mar 2026" },
  { id: "guidelines", title: "Community Guidelines", path: "/legal/guidelines", status: "published", updated: "1 apr 2026" },
  { id: "creator-terms", title: "Creator Terms", path: "/legal/creator", status: "published", updated: "1 apr 2026" },
  { id: "help",     title: "Help Centre",      path: "/help",          status: "published", updated: "20 may 2026" },
  { id: "about",    title: "About / Marketing home", path: "/about",   status: "draft",     updated: "—" },
];
const CATEGORIES_CFG = ["music", "gaming", "sports", "talk", "education", "cooking", "art", "esports", "faith", "fitness"];

const ADMIN = {
  months, GMV, REVENUE, USERS, PAYOUTS, PLATFORM, REV_LINES, PAY_MIX,
  USER_ROWS, CREATOR_ROWS, APPLICATIONS, REPORTS, TXNS, PAYOUT_RUNS,
  CONNECTORS, CONNECTOR_CATS, API_KEYS, WEBHOOKS, FLAGS, AUDIT, ADMIN_TEAM, GROWTH,
  BRANDING, PAY_TOGGLES, POLICIES, PAGES, CATEGORIES_CFG,
};

Object.assign(window, { ADMIN });
})();
