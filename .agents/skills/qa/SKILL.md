---
name: qa
description: Drive QA strategy and produce evidence for critical user journeys.
---

## Purpose
Drive QA strategy and produce evidence for critical user journeys.

## When to use
- A build slice enters planning or validation.
- A deploy/migration/release needs Shaking, Regression or Full system test evidence.

## Outputs
- `docs/qa/QA_PLAN.md`
- `docs/qa/LIVE_E2E_INDEX.md`
- Test pass/fail evidence and defect triage.

## Operating rules
- Prioritise critical-path and high-risk scenarios.
- Use the three test levels from `docs/qa/QA_PLAN.md` §2.2:
  - **Shaking** (after deploy/migration/major dependency update): login every app, navigate every essential screen with real data; goal is intactness.
  - **Regression** (after a shippable slice, before promoting to SIT/prod): test every essential screen end-to-end.
  - **Full system test** (before release): cover every shipped feature, failure path and non-functional requirement.
- Essential screens are all Pilot/MVP screens in `docs/product/PRODUCT_SPEC_LIVE.md` Part 1 and Part 2.
- Produce reproducible failure evidence with reason codes and map failures back to the exact screen under `PRODUCT_SPEC_LIVE.md`; update `QA_PLAN.md` if a missing or wrong rule is found.

## Templates

| Use | Path |
| --- | --- |
| QA plan | `.agents/skills/qa/assets/qa-plan.md` |
| Live E2E index | `.agents/skills/qa/assets/e2e-live-index.md` |

Product-specific smoke test runbooks belong in the product repo's own `.agents/skills/` (e.g. `testing-<product>-web`).
