# Readiness — are we ready to start developing?

**Short answer: yes.** The product is fully specified, every technical decision is pre-made, the
build is sequenced with checkpoints, and external services are designed so the app runs on
stand-ins until you're ready to pay for the real ones. This page is the final pre-flight + the exact
way to kick Claude Code off.

---

## ✅ What's in place (green light)

| Area | Status |
|---|---|
| **Product spec** | Complete — clickable prototype covers viewer, creator studio, admin (`Metascape v4.html`). |
| **Architecture & conventions** | `CLAUDE.md` — stack locked, money/CAST rules, build order. |
| **All technical decisions** | `docs/DECISIONS.md` — pre-authorized so Claude Code won't ask you. |
| **Build plan** | `docs/BUILD_PLAN.md` — 7 phases, each with a "done when…" checklist. |
| **Operating model** | `docs/TEAM.md` — act as a full product team (PO/UX/frontend/backend/QA/security) with a mandatory QA pass per feature. |
| **Data & API** | `docs/DATA_MODEL.md` — every entity + REST contract, grounded in the prototype. |
| **URLs & SEO** | `docs/ROUTES.md` — every page + how it renders for search. |
| **Connectors** | `docs/INTEGRATIONS.md` — mock-first; real providers only at launch. |
| **AWS readiness** | `docs/INFRASTRUCTURE.md` — built cloud-portable from day one. |
| **Config** | `.env.example` — every key, with mock defaults. |
| **MVP scope** | `docs/DECISIONS.md §5` — what ships first vs later. |
| **Your guide** | `docs/FOR_THE_OWNER.md` — plain-language + the "only you can do" list. |

There is nothing technical left to decide before starting. Claude Code can begin **Phase 0** now.

---

## ▶️ How to start — paste this to Claude Code

> Read `CLAUDE.md`, then `docs/DECISIONS.md` and `docs/BUILD_PLAN.md`. Build the production app
> autonomously, starting at **Phase 0**. Work like a real product team (`docs/TEAM.md`): for each
> feature go Product Owner → UX → Frontend → Backend → **QA** → Security → Release, and run the
> mandatory **QA pass + report** before calling anything done. Use the pre-authorized defaults —
> don't ask me technical questions. Build every external service behind a mock first
> (`docs/INTEGRATIONS.md`), keep it AWS-portable (`docs/INFRASTRUCTURE.md`), make owner-changeable
> things admin settings not hardcode (`CLAUDE.md §4b`), and stay within the **v1 MVP scope**
> (`DECISIONS.md §5`). After each phase, deploy a preview, give me a short plain-language update,
> and tell me anything you need from the **owner setup checklist**. Begin.

That's it. You don't need to say anything else to get going.

---

## 🙋 A few choices you *may* want to make (each already has a safe default)

None of these block the build — Claude Code proceeds with the default and you can change your mind
later. But since you asked to be thorough:

1. **Mobile apps** — default: responsive web + installable PWA now; native iOS/Android later.
   *Change only if you want native apps in v1 (slower, needs App Store accounts).*
2. **Platform fee** — default **12%** of creator earnings. *Set your number.*
3. **Launch regions** — default **UK + EU**. *Add/remove.*
4. **Brand** — colours are locked in `theme.css`; supply final **logo files** and confirm fonts.
5. **Community / content policy** — what's allowed, the strike rules (default 3-strike). *A lawyer
   or you should confirm the wording; Claude Code drafts placeholders.*
6. **Support channel** — default: a support email + help centre. *Upgrade to Intercom/Zendesk later.*
7. **Product/company name** — "Technotainment" (company) / "Metascape" (app surface). *Confirm or rename.*

---

## 📋 What only **you** can do (when the time comes — not before)

Claude Code builds everything on stand-ins first, so you can watch it come together with **no paid
accounts**. When a real launch nears, you'll provide (full guide in `docs/FOR_THE_OWNER.md`):

- A **domain name**, a **registered company + bank account**, and **provider sign-ups**
  (Stripe, Mux, Clerk, Persona, …) — Claude Code tells you exactly which and when.
- **Terms of Service + Privacy Policy** (use a lawyer), and any **music licensing**.
- An **AWS account** (only when you migrate off the preview host).
- The **final go-live approval** — nothing touches real money or users without it.

---

## 🚦 Verdict

Ready to develop. Open Claude Code, paste the kickoff prompt above, and let it run Phase 0. Your
only job until launch: provide real-world accounts when asked, click the previews, and steer.
