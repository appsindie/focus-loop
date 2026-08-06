---
name: Product Build
id: playbook-d922373de54b456abe364a3fc8212b58
macro: !build_product
access: org
url: https://app.devin.ai/settings/playbooks/d922373de54b456abe364a3fc8212b58
---

# Product Build

Turns a signed-off shaping set into working software. The detail lives in the `engineering`, `qa`, `security` and `architecture` skills; the exit criteria are Phase 2 of **AppsIndie Product Lifecycle Playbook**.

Entry condition: shaping merged and **human sign-off recorded** (product + design) — factory **Gate 1**. Do not start without it. Fire the `code-review` routine per **AppsIndie AI Review Loop Convention**; human **Gate 2** follows SIT evidence.

## Stage A — Architecture

External integrations (what each is trusted with, its failure mode, its fallback), decomposition into bounded contexts with explicit boundary rules, the API surface of each context, cross-cutting concerns (authz, tenancy, audit, instrumentation), and ADRs that record the **rejected** options. Applies even to a monolith — the deployable being single does not make the boundaries optional. Every journey must map to contexts.

## Stage B — Detailed design

Per capability, plus a **sequence view per journey** — that cross-context glue is where systems actually break. Idempotency, retry and audit behaviour is specified, not assumed.

## Stage C — QA plan

One test case per acceptance criterion **and per failure mode**, written so a human can run it by hand. This is what smoke, regression and system testing draw on before any e2e automation exists.

## Stage D — Implementation

UI-first with mock data, then the backend, then wiring. One journey slice at a time; every implemented state (loading, empty, error, success) matches the spec; north-star events emit; `verify` and tests green.

Run the repository's `verify` entry point **inside** the generation loop — on a clean tree before the slice, after each file or class, before each commit — per **AppsIndie Static Analysis Convention**. Catching a systematic mistake in the first file costs one fix; catching it at slice completion costs thirty and a rework round. If the repo has no `verify` entry point, set one up before the slice proceeds; if the baseline is red before you touched anything, fix or record it first.

**Slices are commits on `release/<version>`, not PRs.** Push continuously so review starts early; fire the code-review routine at slice completion rather than opening more PRs. Branch and PR structure is fixed by **AppsIndie Branching and Checkpoint Convention** — do not invent a PR boundary.

## Rules

- Spec is intent, not implementation: choose the implementation, and **push back** — when a rule is wrong, missing, or beaten by a better approach, say so and fix the spec in the same PR. Silently following a rule known to be wrong is a defect.
- Update the living documents (`docs/product/`, `docs/architecture/`, `docs/qa/`) in the same PR as the change.
- Evaluate **AppsIndie Security Trigger Policy**; a matching trigger requires a security pass before the stage exits.
- Never weaken a static analysis check, ignore file or severity to make a run go green. Fix the code, or record the suppression inline with a reason. Two failed attempts on the same check is the cap — the third is an exception via the `escalation` skill, offering the suppression / rule-change / stay-red choice.
- A stage exits only when its checklist is ticked, or a box is waived on the PR with a reason.

## Report back

Stage reached, what is in the open PR, decisions and push-backs made, and what is blocking.