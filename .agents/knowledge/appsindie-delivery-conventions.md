---
name: AppsIndie Delivery Conventions
id: note-8a3e23b5790f4d599ea384bd068530f9
author: user
scope: When working on any AppsIndie product, feature, screen, release, or deployment
---

# AppsIndie Delivery Conventions (Global)

Default product-delivery guardrails for all AppsIndie repositories. A repo can override with an ADR, but these are the assumed baseline.

## Living documents and docs-first workflow

- Product truth lives in `docs/product/` (concept, spec, design), architecture in `docs/architecture/`, QA in `docs/qa/`. Update the relevant living document in the same PR as the code change; do not maintain a separate traceability matrix.
- Before writing new feature or screen code, re-check and update the living documents the slice touches. Do not start implementation until the spec intent is clear and the docs are current.
- Any screen that belongs to an essential journey must be reviewed against the screen spec and mockups before coding. Record design alignment in the PR or a design-review artifact.
- If implementation reveals a rule is wrong, missing, or beaten by a better solution, the implementer SHALL push back and update the spec in the same PR. Silently following a wrong rule is a defect.

## Static analysis

- Every code repository exposes one `verify` entry point running typecheck, lint, format and boundary checks, and agents run it *during* implementation, not once at the end. Tool baseline per stack, cadence and suppression rules: **AppsIndie Static Analysis Convention**.

## Three test levels

| Level | When | What |
|---|---|---|
| **Shaking** | After every deploy, migration, or major dependency update | Login every app/channel and navigate every essential screen with real data. |
| **Regression** | After a shippable feature slice and before promoting to SIT/prod | Run every essential screen end-to-end. |
| **Full system test** | Before release | Cover every shipped feature, failure path, and non-functional requirement. |

## Release ownership

- SIT deployment and smoke testing are driven by Devin in-session, not auto-triggered by pushes.
- **Gate 2 — Approve SIT** is a human decision: the Build PR is not treated as ready for release work until a human has tested SIT and signed.
- Production release is a **human sign-off gate** (Gate 3).
- Store promotion (App Store / Play Store) and customer-facing release are human actions.
- Progressive rollout is recommended (e.g. 5% → 25% → 100%) with a defined halt threshold.
- Rollback plan, changelog, and north-star verification must be ready before production release.

## Labels and reviewers

- See **AppsIndie PR Labeling and Reviewer Convention** for `devin`, `ai-product-*`, `ai-review-pass|rework`, `gate-signed`, `human-hold` and `human-decision`.
- See **AppsIndie AI Review Loop Convention** for review: Devin fires a Claude reviewer routine, the routine applies the review label, and the human signs the gate. Copilot is not used.

## Security and compliance triggers

- Any change touching authentication, authorization, secrets, external trust boundaries, file/PII storage, or production infrastructure requires an explicit security pass per the **AppsIndie Security Trigger Policy**.
- Free automated scanning runs on every repo regardless of trigger: secrets, SAST and insecure IaC defaults inside `verify`; dependency CVEs in `audit`, at slice completion, before each gate, and weekly. A scan is evidence for the security review, never a substitute.

## Repo-specific overrides

- A repo may have its own file paths (e.g. `PRODUCT_SPEC_LIVE.md`, `LIVE_LLD.md`), stack-specific commands, or infrastructure details. Those stay in repo-scoped knowledge notes and reference this global baseline.