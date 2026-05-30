# Data Model & API Contract — Technotainment

Grounded in the prototype fixtures (`v4/data.jsx`, `v4/studio-shared.jsx`, `v4/admin-shared.jsx`,
`v4/payments.jsx`). Field names mirror the prototype so screens map 1:1. Types are the
**production** target (the prototype stores some values pre-formatted as strings — normalize
to the types below). **All money is integer CAST unless noted.** `100 CAST = £1.00`.

---

## Entities & relationships

```
User ──< Membership >── Tier ──> Channel <── Creator ── User
 │                                  │
 ├──< WalletEntry (ledger)          ├──< Video ──< Chapter
 ├──< Transaction                   ├──< Stream (live) ──< ChatMessage
 ├──< PaymentMethod                 ├──< Product (drop/ppv/course/merch)
 └──< ConsentGrant                  └──< ScheduledStream

Creator ──< Payout ──> PayoutMethod
Report >── (User | Video | Stream | Product | Clip)
Connector, ApiKey, Webhook, FeatureFlag, AuditEvent, AdminUser (operational)
```

---

## Core entities

### User
```ts
{
  id: string;            // "U-48210"
  handle: string;        // "@mira.k"  (unique)
  email: string;
  displayName: string;
  avatarUrl: string|null;
  role: "member" | "creator";
  kyc: "none" | "pending" | "verified" | "failed";
  status: "active" | "pending" | "suspended";
  castBalance: number;   // derived from WalletEntry ledger (do NOT store mutable)
  lifetimeSpentCast: number;
  createdAt: string;     // ISO
  flags?: string[];      // e.g. ["fraud signals"]
}
```

### Creator  *(prototype: `CREATORS`)*
```ts
{
  id: string;            // "nyx"
  userId: string;        // owner
  name: string;          // "Nyx Okafor"
  handle: string;        // "@nyxsynth"
  brand: string;         // hex primary  "#7c3aed"
  brand2: string;        // hex secondary "#ec4899"
  category: string;      // "modular synth"
  followers: number;
  bio?: string;
  takeRatePct: number;   // platform fee, default 12; negotiable per-creator
  status: "active" | "review" | "payout-hold" | "suspended";
}
```

### Channel
The public storefront for a Creator. URL: `/c/:handle`. Aggregates videos, streams, tiers,
products, schedule. SEO-critical (see `docs/ROUTES.md`).

### Video  *(prototype: `STUDIO.CONTENT`, `NYX_LIBRARY`)*
```ts
{
  id: string;
  channelId: string;
  title: string;
  slug: string;                 // editable; "/watch/:slug"
  description: string;
  metaDescription?: string;     // SEO (≤160)
  thumbUrl: string;
  ogImageUrl?: string;          // social card (auto-gen fallback)
  kind: "vod" | "clip";
  status: "draft" | "processing" | "published";
  visibility: "public" | "members" | "ppv";
  ppvPriceCast?: number;        // when visibility=ppv
  durationSec: number;
  views: number;
  castEarned: number;
  captions: boolean;
  chapters: { atSec: number; label: string }[];
  publishedAt?: string;
}
```

### Stream (live)  *(prototype: `GoLiveScreen`, `LIVE_PAGE`)*
```ts
{
  id: string;
  channelId: string;
  title: string;
  category: string;
  visibility: "public" | "members" | "ppv";
  status: "offline" | "preview" | "live" | "ended";
  ingest: { rtmpUrl: string; streamKey: string };   // streamKey: secret, rotatable
  health?: { resolution: string; bitrateMbps: number; state: "healthy"|"degraded" };
  viewers: number;
  startedAt?: string;
  recordingVideoId?: string;    // VOD created on end
}
```

### Tier (membership)  *(prototype: `NYX_TIERS`, `STUDIO.TIERS`)*
```ts
{
  id: string; channelId: string;
  name: string;            // "patch archive"
  priceCast: number;       // monthly
  perks: string[];
  popular?: boolean;
  memberCount: number;     // derived
}
```

### Membership
```ts
{ id; userId; tierId; channelId; status: "active"|"canceled"|"past_due";
  startedAt; renewsAt; priceCastLocked: number; }  // existing members keep their rate
```

### Product  *(prototype: `NYX_STORE`, `STUDIO.PRODUCTS`)*
```ts
{ id; channelId; kind: "drop"|"ppv"|"course"|"merch";
  name; priceCast; edition?: string; imgUrl;
  status: "draft"|"live"; sold: number; stock?: number|null; }
```

---

## Money

### WalletEntry  *(append-only ledger — source of truth for balance)*
```ts
{ id; userId; deltaCast: number;   // +topup, −spend, +refund
  kind: "topup"|"tip"|"membership"|"drop"|"ppv"|"gift"|"refund"|"payout";
  ref: string;                     // related Transaction/Payout id
  createdAt; }
```

### Transaction  *(prototype: `ADMIN.TXNS`)*
```ts
{ id: string;          // "TXR-9F2A"
  userId; channelId?;
  kind: "topup"|"tip"|"membership"|"drop"|"ppv"|"gift";
  grossFiat?: string;  // "£42.00" (topups only)
  cast: number;        // signed
  method: PaymentMethodId;
  status: "pending"|"settled"|"reversed";
  flag?: "chargeback"|"fraud";
  createdAt; }
```

### PaymentMethod (top-up)  *(prototype: `payments.jsx → TOPUP_METHODS`)*
```ts
id ∈ { apple-pay, google-pay, paypal, venmo, cashapp,   // express (no 3DS)
       visa, mastercard, amex, new-card,                // cards (3DS)
       sepa, ach, faster, ideal,                         // bank/local
       paypal-bal, klarna, usdc }                        // wallet / BNPL / crypto
// express → skip 3DS; cards → needs3ds; route via Stripe/Adyen accordingly.
```

### PayoutMethod (creator)  *(prototype: `payments.jsx → PAYOUT_METHODS`)*
```ts
id ∈ { bank, instant, paypal, venmo, wise, payoneer, usdc }
// bank/paypal/venmo/wise/payoneer: free · instant-to-debit: 1.5% · usdc: network fee
```

### Payout / PayoutRun  *(prototype: `STUDIO.PAYOUT*`, `ADMIN.PAYOUT_RUNS`)*
```ts
Payout    { id; creatorId; cast; feeCast; netFiat; method; status; date; }
PayoutRun { id; date; creatorCount; cast; status: "scheduled"|"paid"|"held"; }
// 7-day clearing hold; auto-run monthly on the 1st; no minimum.
```

---

## Trust & safety / operational

### Report  *(prototype: `ADMIN.REPORTS`)*
```ts
{ id; targetType: "user"|"stream"|"vod"|"product"|"clip"; targetId;
  reason; reportCount; severity: "low"|"medium"|"high";
  status: "open"|"investigating"|"actioned"|"dismissed"; createdAt; }
```

### ConsentGrant  *(prototype: `profile.jsx`)*
```ts
{ userId; creatorId; scopes: { watchHistory; chatMessages; tipsPurchases; marketingEmail };
  updatedAt; }   // analytics may only expose granted scopes; purge ≤7d after withdrawal
```

### Connector / ApiKey / Webhook / FeatureFlag / AuditEvent / AdminUser
See `ADMIN.CONNECTORS / API_KEYS / WEBHOOKS / FLAGS / AUDIT / ADMIN_TEAM`. Connectors carry
`{ id, name, cat, status: live|beta|off, desc }`; categories: payments, identity, risk, media,
comms, tax, data, growth, trust, infra. AuditEvent `{ who, action, kind, when }` is append-only.

---

## REST API contract (sketch)

Base: `/api/v1`. Auth: bearer (session) or signed key. All list endpoints paginate
(`?cursor=&limit=`) and respect consent scoping.

**Public (SSR/ISR — cacheable)**
```
GET  /channels/:handle                  → Channel + tiers + featured
GET  /channels/:handle/videos           → Video[] (public only)
GET  /videos/:slug                      → Video (+ schema.org payload)
GET  /streams/live                      → Stream[] (live index)
GET  /explore/:category                 → mixed feed
GET  /sitemap/[creators|videos|clips].xml
```

**Viewer (authed)**
```
GET  /me                                → User (+ derived castBalance)
GET  /me/wallet                         → WalletEntry[]
POST /wallet/topup                      → { methodId, cast } → Transaction (+3DS challenge if card)
POST /wallet/topup/:txn/confirm-3ds     → Transaction(settled)
GET  /me/payment-methods                CRUD /payment-methods
POST /channels/:id/follow | /tip | /subscribe(tierId) | /gift
POST /products/:id/purchase             → Transaction
```

**Creator Studio (authed, owns channel)**
```
POST /studio/onboard                    → create Channel + first Tier + PayoutMethod
GET  /studio/overview                   → KPIs + activity + payout snapshot
POST /studio/videos        (upload init → Mux direct upload URL) ; PATCH /studio/videos/:id
POST /studio/streams/start | /stop ; POST /studio/streams/key/rotate
CRUD /studio/tiers | /studio/products
GET  /studio/audience | /studio/analytics
GET  /studio/earnings ; POST /studio/withdraw  → Payout
CRUD /studio/payout-methods
```

**Admin (staff, RBAC)**
```
GET  /admin/overview
GET  /admin/users ; POST /admin/users/:id/(suspend|reinstate|kyc)
GET  /admin/creators ; POST /admin/creators/:id/(take-rate|payout-hold) ; /applications/:id/(approve|decline)
GET  /admin/reports ; POST /admin/reports/:id/(strike|remove|dismiss)
GET  /admin/transactions ; POST /admin/transactions/:id/refund
GET  /admin/payout-runs ; POST /admin/payout-runs/:id/(approve|hold)
CRUD /admin/connectors | /api-keys | /webhooks | /flags | /team
GET  /admin/growth        → Search Console + index + CWV
GET  /admin/audit
```

**Webhooks (inbound from providers)** — verify signatures, idempotent:
`payment.*` (Stripe/Adyen/PayPal), `payout.*`, `identity.verified` (Persona),
`risk.flagged` (Sift), `media.asset.ready` (Mux), `report.*` / `strike.*`.
