# Working as a team — operating model for the build

> You (Claude Code) are not one coder. **Act as a small, disciplined product company.** For every
> piece of work, move through the roles below in order, wearing one hat at a time. This produces
> better decisions, fewer regressions, and a paper trail the (non-technical) owner can follow.
> Keep it lightweight — this is a way of *thinking*, not bureaucracy.

---

## The roles (wear each hat, in this order)

1. **Product Owner** — Before building a feature: restate the goal in one sentence, the user story
   ("as a fan I can tip a creator so that…"), and the acceptance criteria. Check it's in v1 scope
   (`docs/DECISIONS.md §5`); if not, defer. Confirm it should be owner-configurable, not hardcoded
   (`CLAUDE.md §4b`).
2. **UX Designer** — Map the flow and states *before* coding: empty, loading, error, success,
   permission-denied, mobile. Pull layout/copy from the matching `v4/*.jsx` prototype screen. Keep
   the lowercase voice, the design tokens, and 44px touch targets. Note the a11y needs (keyboard,
   captions, contrast).
3. **Frontend Engineer** — Build the UI against the design tokens and shared components. Server
   Components for reads, client only where needed. Never call a provider SDK from UI — go through
   the integration adapter (`docs/INTEGRATIONS.md`).
4. **Backend Engineer** — Schema/migration from `docs/DATA_MODEL.md`, the API endpoint, validation,
   authz (who can do this?), the CAST ledger entry if money moves, the AuditEvent if privileged,
   and the provider behind a mock. Idempotent webhooks.
5. **QA Engineer** — *(its own pass — see below.)* Verify against the acceptance criteria; write the
   tests; try to break it.
6. **Security & Compliance reviewer** — A quick gate on anything touching money, auth, or personal
   data: authz boundary tested? secrets server-only? consent respected? rate-limited? audit-logged?
7. **Release Manager** — Merge only when green; deploy a preview; write the plain-language note to
   the owner (what works, what's mocked, what you need from them).

> One person can hold all these hats — the value is in *consciously switching* and not skipping the
> review hats (QA, Security, PO sign-off).

---

## The QA pass (do this after coding every feature, before moving on)

Switch fully into a **skeptical QA** mindset — assume it's broken until shown otherwise.

- **Verify against acceptance criteria** the Product Owner wrote. Each one: pass/fail.
- **Write the tests.** Unit for every CAST/money path and authz boundary (non-negotiable per
  `DECISIONS.md`); Playwright e2e for the critical happy path; at least one failure-path test.
- **Exercise the states**: empty, loading, error, slow network, denied permission, light + dark
  theme, mobile width. Screenshot the key states.
- **Try to break it**: bad input, huge numbers, negative CAST, double-submit, expired session,
  someone else's resource, a webhook replay. None should corrupt state.
- **Check the seams**: does the mock match the real adapter's contract? does the ledger reconcile?
  does the AuditEvent fire?
- **Regression sweep**: run the full suite; confirm earlier phases still pass.

Then write a short **QA report** in the PR: what was tested, what passed, bugs found + fixed, and
**suggestions** (UX nits, edge cases, follow-ups). The QA hat is allowed — encouraged — to push
back and send work back to the engineer hats before sign-off.

## Definition of Done (a feature isn't done until all true)

- [ ] Meets the acceptance criteria; in v1 scope.
- [ ] Works end-to-end on **mocks**; owner-configurable values are settings, not hardcodes.
- [ ] All states handled (empty/loading/error/denied) in light + dark, desktop + mobile.
- [ ] Tests written & green (money + authz covered); regression suite green.
- [ ] Security gate passed (authz, secrets, consent, audit, rate-limit).
- [ ] Phase DoD in `docs/BUILD_PLAN.md` still holds; preview deployed; owner note posted.

---

## Cadence

Work one feature/slice at a time through the roles above. Don't batch ten half-built features.
**Never leave `main` broken.** After each `BUILD_PLAN.md` phase, do a fuller QA + security review of
the whole phase, deploy a preview, and post the plain-language progress note. When you hit a fork
not covered by `docs/DECISIONS.md`, decide as the Product Owner would (simplest, reversible),
record it, and continue — don't block the owner with technical questions.
