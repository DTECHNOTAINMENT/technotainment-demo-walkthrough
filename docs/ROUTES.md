# Routes & Rendering Strategy — Technotainment

Production URL map for the Next.js App Router build, with the **render mode** each route must use.
Render mode drives SEO: public pages **must** server-render. Prototype screens are referenced so
you can find the layout/copy spec (`→ file.jsx`).

Render modes: **SSG** static · **ISR** incremental static (revalidate) · **SSR** per-request ·
**CSR** client-only (authed dashboards). SEO column = needs full `<head>` + schema.org.

---

## Public — marketing & discovery  (SEO-critical)

| Route | Render | SEO | Spec | Notes |
|---|---|---|---|---|
| `/` | ISR | ✅ | `home.jsx` | logged-out landing = marketing; logged-in = app home |
| `/c/:handle` | ISR (revalidate 60s) | ✅ | `microcast.jsx` | **Channel page.** schema: `Person`/`Organization`, `VideoObject` list |
| `/watch/:slug` | ISR + SSR for live | ✅ | `studio-video.jsx` (fields), `live.jsx` (player) | **Watch page.** schema: `VideoObject` (+`hasPart` chapters), `BroadcastEvent` if live |
| `/clip/:slug` | ISR | ✅ | — | short clips; `VideoObject clip` — high social-share value |
| `/explore/:category` | ISR | ✅ | `explore` (in `extras.jsx`) | category hubs; programmatic SEO |
| `/live` | SSR | ✅ | `live.jsx` | live-now index; `BroadcastEvent` list |
| `/m/:metacast` | ISR | ✅ | `SMALLROOMS` (`data.jsx`) | operator destinations (MetaCasts) |
| `/search?q=` | SSR | partial | `search.jsx` | noindex result pages, index facets |
| `/sitemap*.xml`, `/robots.txt` | SSG/dynamic | — | `ADMIN.GROWTH.sitemaps` | creators/videos/clips/categories sitemaps |

**Legacy redirects (301)** — keep link equity (`ADMIN.GROWTH.redirects`):
`/u/:handle → /c/:handle` · `/video/:id → /watch/:slug` · `/stream/:id → /watch/:slug`

---

## Viewer app  (authed)

| Route | Render | Spec |
|---|---|---|
| `/home` | CSR/RSC | `home.jsx` |
| `/following` | CSR | `FollowingScreen` (`extras.jsx`) |
| `/library` | CSR | `LibraryScreen` |
| `/wallet` | CSR | `wallet.jsx` — balance, top-up, saved methods |
| `/wallet/topup` | CSR (modal) | `topup.jsx` — select → method → 3DS/express → receipt |
| `/notifications` | CSR | `NOTIFICATIONS` (`data.jsx`) |
| `/settings`, `/profile` | CSR | `profile.jsx` — incl. consent + entry to Studio/Operations |

---

## Creator Studio  `/studio/*`  (authed, owns channel)

| Route | Spec |
|---|---|
| `/studio` | `studio-dashboard.jsx` |
| `/studio/onboarding` | `studio-onboarding.jsx` (5-step; mints channel + tier + payout) |
| `/studio/live` | `studio-golive.jsx` — encoder keys, preview, live chat & stats |
| `/studio/content` | `studio-content.jsx` — library + upload + schedule |
| `/studio/content/:id` | `studio-video.jsx` — editor incl. **search & sharing (SEO)** |
| `/studio/store` | `studio-store.jsx` |
| `/studio/audience` | `studio-audience.jsx` |
| `/studio/memberships` | `studio-audience.jsx → MembershipsScreen` |
| `/studio/analytics` | `studio-analytics.jsx` |
| `/studio/earnings` | `studio-earnings.jsx` — withdraw + payout methods |
| `/studio/settings` | `studio-settings.jsx` |

All Studio routes are CSR dashboards behind auth + channel-ownership.

---

## Admin / Operations  `/admin/*`  (staff — SSO + RBAC + MFA)

| Route | Spec |
|---|---|
| `/admin` | `admin-overview.jsx` |
| `/admin/users` | `admin-users.jsx → AdminUsers` |
| `/admin/creators` | `admin-users.jsx → AdminCreators` (+ applications/KYC) |
| `/admin/moderation` | `admin-moderation.jsx` — report queue + live monitor |
| `/admin/finance` | `admin-finance.jsx` — transactions + payout runs |
| `/admin/connectors` | `admin-connectors.jsx` — integrations + API keys + webhooks |
| `/admin/growth` | `admin-growth.jsx` — SEO: search, index & sitemaps, technical |
| `/admin/settings` | `admin-settings.jsx` — fees, flags, regions, team, audit |

Gate the entire `/admin` segment in middleware: staff session, role check, MFA assertion.
Every mutation writes an `AuditEvent`.

---

## Rendering / SEO checklist per public route

For each SEO route emit: unique `<title>` + meta description (templates in
`admin-growth → metadata defaults`), **canonical**, **Open Graph + Twitter** tags with a
dynamic OG image, **schema.org JSON-LD**, and inclusion in the right sitemap. Targets:
LCP < 2.5s, CLS < 0.1, INP < 200ms (`admin-growth → technical`). Provide captions/transcripts
on `/watch` for both SEO and accessibility.
