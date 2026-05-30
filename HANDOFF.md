# Technotainment — Developer Handoff

A hi-fi, interactive prototype of **Technotainment** (product surface: *Metascape*) — a creator
live-streaming + VOD platform built around **CAST**, a closed-loop platform credit
(100 CAST = £1.00). This document is the bridge from prototype → production build.

> The prototype is the **source of truth for product, UX, layout, copy and data shapes.**
> It is **not** the production architecture — see *Productionization* below.

---

## 1. What's in the box

Three first-class "modes", each a full app with its own sidebar + routing:

| Mode | Who | Entry point | Files |
|---|---|---|---|
| **Viewer** | fans | default | `home / live / microcast / wallet / profile / search / …` |
| **Creator Studio** | creators | sidebar "creator studio" / profile / onboarding | `studio-*.jsx` |
| **Admin / Operations** | staff | profile → "operations" | `admin-*.jsx` |

Mode switching lives in `v4/app.jsx` (`studioMode`, `adminMode`, `isCreator`, `onboarding`).

---

## 2. Tech as-built vs. production

**As-built (prototype):**
- Single `Metascape v4.html` loads ~35 `.jsx` modules via `<script type="text/babel">` (Babel standalone, in-browser).
- React 18 UMD. No bundler. Modules are IIFEs that read/write shared singletons on `window`.
- `theme.css` (design tokens, dark-first) + `studio.css` (additive). Theme via `<html data-theme>`.
- All data is **front-end fixtures**. All mutations are local state / toasts.

**Productionize to:**
- **Next.js (App Router) + SSR/ISR** — required for SEO (see §7). Public pages must server-render.
- TypeScript + a real component lib (the prototype's primitives map 1:1 — see §5).
- Real API + DB; the fixtures define the response shapes.
- Replace `window`-globals with imports; replace Babel-in-browser with the bundler.

---

## 3. File map (`v4/`)

```
theme.css, studio.css        design tokens + additive studio/admin styles
shared.jsx                   Icon set, Avatar, Modal, ToastHost, formatNum, CastGlyph
data.jsx                     viewer fixtures (CREATORS, LIVE, NYX_*, WALLET, HISTORY…)
payments.jsx                 PayBrand glyphs, TOPUP_METHODS, PAYOUT_METHODS, MethodRow
app.jsx                      root: auth gate, mode switching, viewer routing
sidebar.jsx                  viewer left nav (+ unified header strip)
home/live/microcast/…        viewer screens
wallet.jsx                   CAST wallet + saved payment methods + add-method modal
topup.jsx                    top-up flow (select → method → summary → 3DS/express → success)
profile.jsx                  profile/consent + entry points to studio & operations

studio-shared.jsx            STUDIO data, charts (AreaSpark/Bars/SegBar), StatCard/StudioCard/Pill/Seg
studio-app.jsx               studio shell + sidebar + routing
studio-{dashboard,content,golive,earnings,audience,store,analytics,monetization,settings,video,onboarding}.jsx

admin-shared.jsx             ADMIN data model (platform KPIs, users, finance, connectors, GROWTH, control-center config…)
admin-app.jsx                admin shell + sidebar + routing
admin-{overview,users,moderation,finance,connectors,growth,settings}.jsx + admin-controls.jsx (owner control-center panels)
```

Studio primitives (`StatCard`, `StudioCard`, `StudioPageHead`, `Pill`, `Seg`, `Bars`,
`AreaSpark`, `SegBar`) are shared by the admin screens — promote them to a real component library.

---

## 4. Persistent state (localStorage)

| Key | Meaning |
|---|---|
| `metascape-v4-auth` | logged-in user (`null` = signed out) |
| `metascape-v4-theme` | `"dark"` \| `"light"` |
| `metascape-v4-route` | viewer route |
| `metascape-v4-isCreator` | has completed creator onboarding |
| `metascape-v4-studioMode` / `-adminMode` | which mode is active |
| `metascape-v4-wallet` | CAST balance + packs |
| `metascape-studio-route` / `-live` | studio route + on-air flag |
| `metascape-admin-route` | admin route |

---

## 5. Component primitives → build targets

`StatCard`, `StudioCard` (titled section), `StudioPageHead`, `Pill` (status badge, tones:
neutral/ok/warn/live/info), `Seg` (segmented tabs), `MethodRow`/`PayBrand` (payments),
charts (`Bars`, `AreaSpark`, `SegBar`, `Spark`). `.stat-num`, `.tg` (toggle), `.st-row`
(table row), `.copy-field`, `.meter`, `.dropzone`, `.sb-head` (unified header strip).

---

## 6. Payments

`payments.jsx` is the single source for methods.
- **Top-up methods** (`TOPUP_METHODS`) grouped: express (Apple Pay, Google Pay, PayPal, Venmo,
  Cash App), cards, bank/local (SEPA, ACH, Faster Payments, iDEAL), wallets, BNPL (Klarna), crypto (USDC).
  - `instant: true` / not-`needs3ds` → skip 3-D Secure step (express path).
  - `needs3ds: true` (cards) → run the OTP/3DS step.
- **Payout methods** (`PAYOUT_METHODS`): bank, instant-to-debit, PayPal, Venmo, Wise, Payoneer, USDC.
- Provider mapping lives in `admin-shared.jsx → CONNECTORS` (Stripe, Adyen, PayPal/Venmo, Circle…).

**To implement:** real PSP integration (Stripe/Adyen tokenization, Apple/Google Pay merchant
sessions, 3DS2, webhooks → `payment.*`), payout orchestration (Stripe Connect / Tipalti / Trolley),
SCA/PSD2, and **App Store / Play in-app purchase** for mobile CAST sales (store policy).

---

## 7. SEO & growth — what the app must implement

The **Admin → SEO & Growth** panel surfaces status + Search Console data. The actual SEO work
is in the web app and is the highest-leverage production task:

- 🔴 **SSR/SSG (Next.js)** for all public pages: `/c/:handle`, `/watch/:slug`, `/clip/:slug`,
  `/explore/:category`, `/live`. Client-only rendering is **not** crawlable.
- 🔴 **schema.org JSON-LD**: `VideoObject` (+ `clip`/`hasPart` key moments from chapters),
  `BroadcastEvent` (live), `Event` (scheduled), `Person`/`Organization`, `Product` (drops),
  `BreadcrumbList`.
- **Metadata**: per-page `<title>`/description (templates in the admin panel), **canonical URLs**,
  **Open Graph + Twitter cards**, oEmbed. Use a **dynamic OG-image** service for share cards.
- **Sitemaps**: dynamic XML + dedicated **video sitemap**; ping Google/Bing (IndexNow) on publish.
  Fixture shapes in `ADMIN.GROWTH.sitemaps`.
- **Core Web Vitals** (LCP/CLS/INP) budgets — media-heavy site; CDN + image optim + lazy load.
- **Captions/transcripts** per video (also a11y) — toggle exists in `studio-video.jsx`.
- **hreflang** for the 6 regions in `admin-settings → regions`.
- **Redirects**: legacy → canonical (301), preserve link equity. Rules in `ADMIN.GROWTH.redirects`.
- Slugs are stable + editable per video (`studio-video.jsx → search & sharing`).

Connectors for this: Google Search Console, Bing Webmaster (IndexNow), Ahrefs/Semrush,
Branch (deep links/app indexing), Sanity CMS (marketing/blog · programmatic SEO).

---

## 8. Integrations to wire (from Admin → Connectors)

Payments (Stripe/Adyen/PayPal/Apple/Google/Circle), identity/KYC (Persona), risk (Sift),
media (Mux, Cloudflare Stream; **add LiveKit/Agora for co-watch "small rooms"**), comms
(Twilio, SendGrid; **add FCM/APNs push** for go-live alerts), tax (Avalara · DAC7/1099),
data (Segment), trust (AI moderation; **add Audible Magic/Pex content-ID + PhotoDNA**),
infra (Datadog), growth (§7). API keys + webhooks UI is in `admin-connectors → api & webhooks`.

---

## 9. Prototype shortcuts to replace

- All data is fixtures; all writes are local/ephemeral (many actions fire a toast).
- The **operations** entry is open via Profile for demo — gate to staff SSO/RBAC in prod
  (roles modeled in `admin-settings → team`).
- The demo "studio" uses the seeded creator **Nyx Okafor**; production onboarding should mint a
  fresh empty channel for the signed-in user.
- 3DS / payment "processing" are simulated timers.

---

*Generated for the Claude Code handoff. Questions about a specific screen → open its file in
`v4/`; the JSX is the spec.*
