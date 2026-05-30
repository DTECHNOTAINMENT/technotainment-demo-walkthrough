# For the Owner — a plain-language guide

You're not a developer, and you'll rely on **Claude Code** to build Technotainment for you.
This page explains, in plain English, how that works, what to expect, and the few things only
**you** can do. No jargon.

---

## What you have right now

A **clickable prototype** — a realistic, working preview of the whole product (the fan app, the
creator studio, and the staff control room). It looks and behaves like the real thing, but it's a
demo: the money, streaming and sign-ups are simulated. It's the **blueprint**.

Alongside it is a **handoff pack** (the files below) that tells Claude Code exactly how to turn the
blueprint into the real, live website and apps.

---

## How to start the build

1. Open this project in **Claude Code**.
2. Tell it: *"Read CLAUDE.md and docs/BUILD_PLAN.md, then start Phase 0. Work autonomously, use the
   defaults in docs/DECISIONS.md, and don't ask me technical questions — only ask for the items in
   the setup checklist when you actually need them."*
3. That's it. Claude Code will scaffold the app and work down the plan, checking off boxes as it goes.

You don't need to understand the code. After each phase it will give you a short plain-language
update and a **preview link** you can click to see progress.

---

## What Claude Code does on its own (you don't decide these)

All the technical choices are pre-made in `docs/DECISIONS.md` — which tools, how the money ledger
works, the build order, testing, etc. Claude Code also builds everything with **stand-ins ("mocks")
first**, so the site runs and you can click through it *before* any real bank or payment account
exists. Real services get plugged in later when you provide the keys (below).

> **It builds like a real team, not a lone coder.** For each feature Claude Code switches between
> roles — product owner, designer, frontend, backend, and a **QA tester** that tries to break the
> work and reports back — before calling anything finished. You'll see those QA notes in its
> updates. (The rulebook is `docs/TEAM.md`; you don't need to read it.)

> **Why this matters for you:** the whole app — including the video player and checkout — is built
> to work on realistic *stand-ins* first. You'll see a fully working preview with **zero** paid
> accounts. Each real service (Stripe, the video host, etc.) only gets switched on, one at a time,
> when you're ready to launch — so you don't pay for anything until it's actually needed. The
> technical plan for this is `docs/INTEGRATIONS.md` (Claude Code reads it; you don't have to).

---

## ✅ The only things **you** must do (Claude Code can't)

Claude Code can't sign up for a bank or a company on your behalf. It will keep building with
stand-ins and ask you for these when the time comes. Start lining them up:

1. **A domain name** (e.g. technotainment.fm) — buy one; share access.
2. **A registered company + business bank account** — required before you can take real payments or
   pay creators.
3. **Accounts with the services** the app uses, then paste the keys when asked. The big ones:
   - **Stripe** (payments + paying creators) ← most important
   - **Mux** (video streaming)
   - **Clerk** (sign-in)
   - **Persona** (ID checks for creators), **Resend/Twilio** (email/SMS), **Cloudflare** (delivery)
   - *(Claude Code tells you exactly which, and where to paste each key.)*
4. **A Vercel account** — where the live site runs while building (free tier to start). *(Later you'll move to your own **AWS** account. The app is being built "cloud-portable" so that move is a setup task, not a rebuild — you'll only need an AWS account + billing when you're ready, nothing before then.)*
5. **Legal pages** — Terms of Service & Privacy Policy. Use a lawyer; Claude Code can draft starting points.
6. **Music licensing** — if creators stream/sell music, you'll likely need licences (PRS/PPL etc.). Your call.
7. **Final approval to go live** — nothing touches real money or real users until you say so.

> Tip: keep all logins/keys in a password manager and share with Claude Code only when it asks,
> one at a time. Never paste a **secret** key into a public place.

---

## What it will cost (rough, plain terms)

- **While building & testing:** near-£0 — most services have free tiers, and everything runs in
  "test mode."
- **Once live:** you mainly pay for video streaming (Mux, per hour watched), hosting (Vercel), and
  payment processing (Stripe takes a small % per transaction). These scale with usage — small when
  small, larger as you grow. Claude Code can show current estimates any time.

---

## How to follow progress

- Each phase ends with a **preview link** — click it, try the app, tell Claude Code what feels off.
- `docs/BUILD_PLAN.md` is the checklist; ticked boxes = done.
- You can always ask Claude Code: *"explain what you just did in plain English"* or *"what do you
  need from me next?"*

---

## The files in this pack (you don't need to read them — Claude Code does)

| File | Plain meaning |
|---|---|
| `CLAUDE.md` | The master brief Claude Code reads first. |
| `docs/BUILD_PLAN.md` | The step-by-step build checklist. |
| `docs/DECISIONS.md` | All the technical choices, pre-made, so you're not asked. |
| `docs/DATA_MODEL.md` | What information the system stores (users, videos, money…). |
| `docs/ROUTES.md` | Every page/address on the site. |
| `.env.example` | The list of service keys you'll provide over time. |
| `HANDOFF.md` / `README.md` | Overview + how to open the prototype. |
| `Metascape v4.html` + `v4/` | The clickable prototype (the blueprint). |

---

**Bottom line:** open Claude Code, point it at `CLAUDE.md` and `docs/BUILD_PLAN.md`, and let it run.
Your job is to provide the real-world accounts when asked, click the previews, and give the final
go-live nod.
