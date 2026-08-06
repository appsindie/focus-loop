---
name: Grow Product
id: playbook-24667053e0fb40d2aa66f4540af240d9
macro: !grow_product
access: org
url: https://app.devin.ai/settings/playbooks/24667053e0fb40d2aa66f4540af240d9
---

# Grow Product

Phase 4. Measure a shipped product against the thesis that won it a portfolio slot, and
take it to **Gate 4 — Continue / Iterate / Sunset**.

Entry condition: Gate 3 passed and the release is in production. Check
`FACTORY_STATE.json` first; stop if `hold` is set.

## Two jobs, do not merge them

| Job | Playbook / skill | Question |
| --- | --- | --- |
| **Make it findable** | `!gtm_aso`, `go-to-market` skill | Are we winning the install? |
| **Decide if it earns its slot** | this playbook, `growth` skill | Was the Gate 0 thesis true? |

Shipping the binary, winning the install, and deserving the slot are three different
things. This playbook owns the third.

## Cadence

Windows are dated from the production release. **Nothing fires this automatically yet** —
the operator starts it, so put the dates somewhere they will be seen:

| When | Output |
| --- | --- |
| Day 7 | `docs/release/<version>/GROWTH_REVIEW.md` — first read on the north-star |
| Day 14 | Same file updated, plus the Gate 4 recommendation |
| Monthly | A fresh review while the product holds a slot |
| On a kill-criterion breach | Immediate review, regardless of cadence |

A day-7 review that arrives on day 10 is a different measurement. Once a product is live
and the dates start landing on weekends, register the `growth-review` schedule — the
prompt is ready in **AppsIndie Review Routine Registry**.

## Actions

1. Read `docs/research/OPPORTUNITY_DECISION.json` — `validation_metrics`,
   `kill_criteria`, `economic_summary`. These are the numbers Gate 0 signed. Do not
   re-derive them and do not re-baseline.
2. Pull actuals **from the deployed environment**. If north-star events are not emitting,
   that is the finding: report it, raise it as an exception, and stop. Do not estimate
   around missing instrumentation.
3. Fill `.agents/skills/growth/assets/growth-review.md`, including the variance analysis.
   Write it up even when the movement disappoints — especially then.
4. Recommend `CONTINUE`, `ITERATE` or `SUNSET`. One recommendation.
5. Open the Gate 4 PR with `devin` + `ai-product-growth`; fire the growth reviewer
   routine; record the verdict in `FACTORY_STATE.json`.
6. On `SUNSET`, write the outcome and the measured variance into `backlog.md` and follow
   the sunset section of `.agents/skills/production-readiness/assets/runbook.md`.
7. On `ITERATE`, the named change enters Phase 1 shaping as a feature. It does not skip
   shaping.

## Rules

- Gate 4 is signed by a human, like every other gate. The recommendation is yours; the
  decision is not.
- Never re-baseline a target to make a miss look smaller. The Stage 3 model that scores
  every future idea is calibrated on these actuals.
- Listing copy, keywords and creative belong to `!gtm_aso`.
- Escalate via the `escalation` skill: choice, recommendation, default if silent,
  deadline, owner.

## Report back

Recommendation, the north-star actual against target, the variance and its cause, any
breached kill criterion, and what Gate 4 needs from the human.
