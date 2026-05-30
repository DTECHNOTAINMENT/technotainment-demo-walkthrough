# Integrations — build the frameworks now, require providers only at launch

> **The rule:** every external service (video, payments, auth, email, KYC, push, …) is built
> behind an **interface** with a **mock implementation** that works offline. The app is fully
> clickable and demoable from day one with zero real accounts. The **real provider** is a second
> implementation of the same interface, selected by an env var, and is only *required* at
> production launch. Nothing in the UI or business logic knows which implementation is live.

This is "ports & adapters." It means Claude Code can build, test and preview the **entire** app —
including the video player, checkout, go-live, payouts — long before you've signed up for Stripe,
Mux, etc. You provide keys at the end; the app flips from mock to real with no code changes.

---

## 1. The pattern

```
lib/integrations/
  <domain>/
    index.ts        # exports the active adapter, chosen by env (see §3)
    types.ts        # the interface (the "port") — the ONLY thing app code imports
    mock.ts         # offline fake — deterministic, no network, always works
    <provider>.ts   # real adapter (e.g. mux.ts, stripe.ts) — used only when configured
```

App code imports from `index.ts` and calls the interface. It never imports a provider directly.

```ts
// app code — provider-agnostic, works in dev with mocks
import { video } from "@/lib/integrations/video";
const asset = await video.createUpload({ channelId });   // mock OR Mux, same call
```

---

## 2. Worked example — the video player & media (what you mentioned)

```ts
// types.ts — the port
export interface VideoProvider {
  createUpload(input: { channelId: string }): Promise<{ uploadUrl: string; assetId: string }>;
  getPlayback(assetId: string): Promise<{ hlsUrl: string; poster: string; status: "ready"|"processing" }>;
  createLiveStream(input: { channelId: string }): Promise<{ streamKey: string; rtmpUrl: string; playbackId: string }>;
  endLiveStream(streamId: string): Promise<{ recordingAssetId: string }>;
}
```

```ts
// mock.ts — works with NO account. Uses a bundled sample HLS + canned states.
export const mockVideo: VideoProvider = {
  async createUpload() { return { uploadUrl: "/api/mock/upload", assetId: "mock_" + crypto.randomUUID() }; },
  async getPlayback() {
    return { hlsUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // public test stream
             poster: "/samples/poster.jpg", status: "ready" };
  },
  async createLiveStream() { return { streamKey: "mock-key-1234", rtmpUrl: "rtmp://mock/live", playbackId: "mock_live" }; },
  async endLiveStream() { return { recordingAssetId: "mock_rec_" + crypto.randomUUID() }; },
};
```

```ts
// mux.ts — real adapter, only loaded when MUX_TOKEN_ID is set (see §3)
export const muxVideo: VideoProvider = { /* calls Mux SDK */ };
```

The **player UI component** is one React component that takes an `hlsUrl` and plays it (hls.js /
`<video>`). In dev it plays the public test stream from the mock; in prod it plays the Mux URL —
identical component, no changes. **Build the player against the interface, not against Mux.**

---

## 3. Selecting mock vs real — and "required only at launch"

A single resolver picks the adapter. Real is used **only if its keys exist**; otherwise it falls
back to mock. A launch-gate makes missing keys a hard error **only in production**.

```ts
// index.ts
import { mockVideo } from "./mock";
import { muxVideo } from "./mux";
export const video = process.env.MUX_TOKEN_ID ? muxVideo : mockVideo;
```

```ts
// lib/integrations/launch-check.ts — run at server startup
// In dev/preview: mocks are fine, app boots.
// In prod: every connector marked required must have real keys, or the build refuses to start.
if (process.env.LAUNCH_MODE === "prod") assertAllRequiredProvidersConfigured();
```

So: `LAUNCH_MODE` unset/`dev` → everything can be mock, app always runs.
`LAUNCH_MODE=prod` → the checklist below is enforced before go-live.

---

## 4. Connector registry — interface + mock + when required

| Domain | Interface (port) | Mock behaviour | Real provider | Required for launch? |
|---|---|---|---|---|
| **Video / live** | `VideoProvider` | public test HLS, fake stream key, instant "ready" | Mux | ✅ prod |
| **Payments (in)** | `PaymentProvider` | fake card → instant settle; test 3DS prompt | Stripe (+Adyen) | ✅ prod |
| **Payouts (out)** | `PayoutProvider` | marks payout "paid" after timer | Stripe Connect / Tipalti | ✅ prod |
| **Auth** | `AuthProvider` | local dev users + role switch | Clerk | ✅ prod |
| **KYC / identity** | `IdentityProvider` | auto-approve after delay | Persona | ✅ before real payouts |
| **Email** | `EmailProvider` | logs to console / dev inbox | Resend | ✅ prod |
| **SMS / OTP** | `SmsProvider` | OTP always `000000` in dev | Twilio | ✅ prod |
| **Push** | `PushProvider` | no-op + log | FCM / APNs | ⬜ post-launch ok |
| **Risk / fraud** | `RiskProvider` | always "low risk" | Sift | ⬜ recommended |
| **Content-ID** | `ContentIdProvider` | always "clear" | Audible Magic | ⬜ recommended (music) |
| **Moderation AI** | `ModerationProvider` | always "pass" | OpenAI / Hive | ⬜ recommended |
| **Tax** | `TaxProvider` | flat estimate | Avalara | ✅ prod (money) |
| **Feature flags** | `FlagsProvider` | reads local JSON | LaunchDarkly/Statsig | ⬜ env vars fine to start |
| **Search Console / SEO** | `SearchConsoleProvider` | returns sample stats | Google SC API | ⬜ post-launch ok |
| **CDN / storage** | `StorageProvider` | local `/public` | Cloudflare R2 / Vercel Blob | ✅ prod |
| **Analytics** | `AnalyticsProvider` | logs events | PostHog / Segment | ⬜ recommended |

"Required for launch" = part of `assertAllRequiredProvidersConfigured()`. Everything else can ship
with mocks and be upgraded later without touching app code.

---

## 5. Rules for Claude Code

- **Never call a provider SDK from app/UI code.** Only from that provider's adapter file.
- **Build the mock first, always.** A feature isn't done until it works end-to-end on mocks.
- **One env var per provider gates it.** Presence of the key → real adapter; absence → mock.
- **Seed mocks to be realistic** (use the prototype fixtures) so previews look like the real thing.
- **Webhooks:** in mock mode, simulate provider webhooks locally so the full async flow is testable.
- A `/admin/connectors` row should reflect live status: `mock` · `live` · `error` per provider.

This keeps the app **always runnable and demoable** for the owner, while real services (and their
costs) are only switched on — one at a time — when you're ready to launch. See `.env.example` for
the keys each real adapter needs, and `docs/DECISIONS.md §1` for the chosen providers.
