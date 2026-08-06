---
name: Product / Feature Shaping from a Slack Request
id: playbook-7df67e045486497398dc5fc804fd14a5
macro: !shape_from_slack
access: org
url: https://app.devin.ai/settings/playbooks/7df67e045486497398dc5fc804fd14a5
---

# Product / Feature Shaping (from a Slack request)

Turn a product request — or a Gate 0 `VALIDATE NOW` opportunity — into a signed-off concept, journey/screen spec and design set. Governance lives in the repository — this playbook only routes you to it.

**Macro name is legacy.** Despite `!shape_from_slack`, there are **two entry paths**: (1) a Slack product/feature request, (2) a Gate 0–approved `idea_id` with `OPPORTUNITY_DECISION.json`. Do not reject non-Slack input just because of the macro name.

## Entry conditions

| Path | Required |
| --- | --- |
| **New product from portfolio** | `idea_id` with Gate 0 decision `VALIDATE NOW` and Final Decision JSON ready to commit as `docs/research/OPPORTUNITY_DECISION.json` |
| **Feature / existing product** | Work in the existing repository (skip Stages 0–0b). Opportunity JSON not required; record a waiver on the PR if asked |
| **Slack request for a brand-new product without Gate 0** | **Blocked.** Run `!research_opportunity` first. Do not create a repo from a raw Slack idea |

## Stage 0 — Concept sketch. Create nothing durable.

Runs in the requesting thread (or the research handoff thread). No repository, no issue, no branch.

### Path A — From Gate 0 `VALIDATE NOW`

1. Load Final Decision JSON. Treat `core_user`, `core_job`, `mvp_scope`, `validation_metrics`, `kill_criteria` and `structural_wedge` as signed — **do not re-ask them**.
2. Ask, **in one batch**, only what the JSON does not cover: which surfaces ship, which integrations are mandatory, who the pilot is, any deadline.
3. Reply with a **draft concept**: north-star = `validation_metrics`, guard-rail = `kill_criteria`, journey map, scope cuts from `mvp_scope`, Pilot/MVP/MMP sketch. Do not invent numeric targets that contradict the JSON.

### Path B — Slack feature on an existing product (or waived)

1. Ask, **in one batch**, the 5-7 questions that decide the shape: what problem, who feels it, rebuild or extend, which surfaces ship, which integrations are mandatory, who the pilot is, any deadline.
2. Ground quickly in what exists — legacy code, support load, competitors — enough to be honest about effort, not a full discovery.
3. Reply with a **draft concept attached to the thread**: north-star metric(s) + guard-rail, journey map, explicit scope cuts, Pilot/MVP/MMP sketch.

## Repo confirmation — Explicit go-ahead before a repository exists

(Formerly misnamed "Gate 0" here. **Gate 0** in the factory means Approve Opportunity. This step is only repo creation consent.)

Ask directly: *"Confirm shaping `<product>` and creating `appsindie/<slug>`?"*. Require an unambiguous yes carrying **repository name, private/public, and the human sponsor**. "Sounds good" is not a confirmation. One request creates at most one repository.

For Path A, also confirm the Gate 0 Research PR link and that signature box 2 (grant portfolio slot) is signed.

## Stage 0b — Bootstrap

- `gh repo create appsindie/<slug> --template appsindie/ai-repo-template --private`, then clone. If the template flag is off, clone `appsindie/ai-repo-template` and push to the new empty repository instead.
- First commit is the concept approved at repo confirmation **plus**, for Path A, `docs/research/OPPORTUNITY_DECISION.json`.
- Existing product? Skip stages 0-0b and work in its repository.

## Stages 1-7 — Detailed shaping, inside the repository

Read and follow the `product-shaping` and `product-design` skills, plus `AGENTS.md` and **AppsIndie Delivery Conventions**. In short: discovery -> north-star -> `docs/product/PRODUCT_CONCEPT.md` -> `docs/product/PRODUCT_SPEC_LIVE.md` (journey-first: value, entry, exit, internal navigation, rules, variants and failure modes; per screen: intent, data, primary action, rules, design reference) -> design system, screens, state sheets, brand assets, journey boards -> `DESIGN_REVIEW.md`.

For Path A, follow the field mapping in `.agents/skills/product-shaping/SKILL.md` (opportunity JSON → concept/spec).

Push slice by slice to `release/<version>` and its single draft PR to `main`, so review starts early. Do not split into extra PRs — see **AppsIndie Branching and Checkpoint Convention**.

Before asking for sign-off, tick the Phase 1 exit checklist in **AppsIndie Product Lifecycle Playbook**.

## Rules

- Cut ruthlessly: a journey or screen that moves neither north-star metric does not enter the spec.
- Never invent a numeric target. If it cannot be derived from the north-star (or from `validation_metrics` on Path A), it is an open question with a working default.
- Failure modes are first-class: for every automation, specify what the user sees when it fails, who gets the exception, and the recovery action.
- Specs fix outcomes, not implementation. If a rule is wrong, say so and fix the spec.
- Stop at the sign-off gate (factory Gate 1 — Approve Product). Architecture and build are separate playbooks (`!build_product`).

## Report back

In the thread: entry path used, what was decided, what was cut, the open questions with their working defaults, and exactly what you need signed off (scope by the sponsor, UI by the designer).
