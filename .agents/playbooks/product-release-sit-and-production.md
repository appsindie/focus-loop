---
name: Product Release (SIT and Production)
id: playbook-fcaef8457aca4956ae5b915ef4c8b1fe
macro: !release_product
access: org
url: https://app.devin.ai/settings/playbooks/fcaef8457aca4956ae5b915ef4c8b1fe
---

# Product Release (SIT -> production)

Parent entrypoint for releasing a product — web, API and mobile. This playbook decides *what* happens and *who* gates it; the detail lives in the `release`, `production-readiness` and `expo-mobile-release-and-compliance` skills.

Entry condition: build complete, including the Terraform for this release, and **Gate 2** (human Approve SIT) recorded on the Build PR. Inputs: repository, version, surfaces (api / web / ios / android). Fire the `release` reviewer routine per **AppsIndie AI Review Loop Convention**.

## Stage 1 — SIT

Apply the release's Terraform to `sit` (the `plan` was already reviewed on the build PR), deploy the candidate, and point it at **real third-party sandboxes**. Run the QA plan from `docs/qa/`: smoke, journey regression, then the **failure-mode cases** — those are what the product promises to handle. Every defect is fixed or explicitly accepted by a named owner. Verify the north-star events actually emit from the deployed environment.

## Stage 2 — Readiness

Run the readiness checks from the `production-readiness` skill. Every item is verified by a command, a query or an artifact — not asserted in prose. Coverage: changelog and release notes per surface; mobile store compliance (privacy declarations, permission justifications, data safety, screenshots, rating) per the repo skill `expo-mobile-release-and-compliance`; rollback plan with trigger conditions, a named owner, the exact command, and a rehearsal for *this* release; observability and alerting live, with the rollout halt thresholds defined in `.agents/skills/production-readiness/assets/slo-and-alerting.md`; production `terraform plan` reviewed.

Failed checks are remediated and re-run, not reported. The output is an **exception report**: a verdict plus only the decisions a human must make. No exceptions is the normal case.

**Human sign-off gate (factory Gate 3 — Approve Production). Blocking.** Infrastructure apply and rollout are one decision, not two. The human decides on the exception report — they do not re-review the release.

## Stage 3 — Ship

- Infrastructure: apply to `prod`, and confirm the resulting state matches the reviewed plan.
- Backend / web: progressive rollout 5% -> 25% -> 100%, holding on error and latency thresholds. A breached threshold rolls back; it does not "get monitored".
- Mobile: run the preflight and the build/submit flow from `expo-mobile-release-and-compliance` — that skill owns the EAS wiring, the branch/profile conventions, store onboarding and the human/Devin split for portal work. The binary lands in internal testing; **promotion to the production store is a human action**.
- Tag the release, publish notes, record what shipped in `docs/release/`.

## Stage 4 — Hand off to growth

Schedule the day-7 / day-14 growth routine and hand the product to `!grow_product`, which owns the comparison against the Gate 0 thesis and the Gate 4 decision. Feed regressions found in that window back into the spec and the QA plan.

## Rules

- Store listing copy, keywords and creative are **not** release work — that is `!gtm_aso`. Whether the product keeps its slot is `!grow_product` at Gate 4.
- Escalate immediately on a missing credential, an unsigned store agreement, a destructive Terraform plan, or a rollout threshold breach — using the `escalation` skill, so the human gets a framed choice rather than a problem. On Gate 3 the default if they say nothing is always `block`.
- Tick the Phase 3 exit checklist in **AppsIndie Product Lifecycle Playbook** before declaring a stage complete.

## Report back

Release status per surface, defects accepted and by whom, infrastructure applied, rollout state, and the day 7/14 findings when they land.