---
name: product-shaping
description: Turn a request into a signed-off concept and an implementable journey/screen spec.
---

## Purpose
Turn a request into a signed-off concept and an implementable journey/screen spec.

## When to use
- A new product or major feature needs shaping.
- An existing spec drifts from what was built (update it, do not fork it).

## Required input (new products)

For a **new product**, `docs/research/OPPORTUNITY_DECISION.json` (Stage 3 Final Decision after Gate 0 `VALIDATE NOW`) is **mandatory**. Do not invent north-star metrics, guard-rails or scope cuts that contradict it.

| Field | Maps to |
| --- | --- |
| `core_user` + `core_job` + `structural_wedge` | Problem and positioning in `PRODUCT_CONCEPT.md` |
| `validation_metrics` | North-star metric(s) |
| `kill_criteria` | Guard-rail metric(s) |
| `mvp_scope` (must-have / nice-to-have / explicitly excluded) | Scope cuts — shaping must not expand past excluded |
| `build_weeks` (must be ≤ 8) | Hard roadmap constraint; if shaping needs more, return to Gate 0 |
| S3.3 head / long-tail terms (if present in evidence) | Seed for `go-to-market`, do not re-research from scratch |
| `economic_summary.base_ad_arpu`, `cash_break_even_mau`, `months_to_2000_net_contribution` | KPI targets for instrumentation |
| S3.11 ad placements | Instrumentation requirements for engineering |

For a **feature on an existing product**, record an explicit waiver on the PR instead of requiring the JSON.

## Outputs
- `docs/product/PRODUCT_CONCEPT.md`
- `docs/product/PRODUCT_SPEC_LIVE.md`

## Operating rules
- New product from Gate 0: ask only what the decision JSON does **not** cover (surfaces, mandatory integrations, pilot, deadline). Do not re-ask core user, job, MVP scope or metrics already signed.
- Slack / feature path without Gate 0 JSON: ask the shape-deciding questions in one batch: problem, who feels it, rebuild vs extend, surfaces, mandatory integrations, pilot, deadline.
- Ground quickly in existing evidence (legacy code, support load, competitors, and the opportunity decision when present); do not over-discover.
- Journey-first: a screen only exists if it relieves a stated pain or delivers a stated gain.
- Every journey needs entry, success exit, alternate exit and failure exit; every screen needs intent, data, one primary action, rules and a design reference.
- Failure modes are first-class: state what the user sees, who gets the exception, and the recovery action.
- Derive non-functional requirements from north-star metrics **taken from `validation_metrics` when the opportunity JSON exists**; record undecided targets as open questions with working defaults. Never invent a numeric target that contradicts the signed decision.
- No process scaffolding: no traceability matrix, no per-task issue tables. Journey dependencies are enough.
- Push-back rule: if a rule turns out to be wrong, missing or beaten by a better solution, say so and update the spec in the same PR.

## Templates

| Use | Path |
| --- | --- |
| Market research brief | `.agents/skills/product-shaping/assets/market-research-brief.md` |
| DVF brief | `.agents/skills/product-shaping/assets/dvf-brief.md` |
| Product concept | `.agents/skills/product-shaping/assets/product-concept.md` |
| Journey & screen spec | `.agents/skills/product-shaping/assets/journey-and-screen-spec.md` |
| Journey chunk / slice contract | `.agents/skills/product-shaping/assets/journey-chunk.md` |
| Requirements spec | `.agents/skills/product-shaping/assets/spec.md` |
