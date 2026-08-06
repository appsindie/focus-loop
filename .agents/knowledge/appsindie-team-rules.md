---
name: AppsIndie Team Rules
id: note-b7a52e36568c4a119bceee5cf13e4d66
author: user
scope: When doing engineering, delivery, release, or collaboration work in any AppsIndie project
---

# AppsIndie Team Rules (Global)

Always-applicable policy for every phase and every skill. A repo can override with an ADR, but these are the assumed baseline.

For delivery workflow details (docs-first, test levels, release ownership) see **AppsIndie Delivery Conventions**. For security review triggers and required artifacts see **AppsIndie Security Trigger Policy**.

## Engineering

- Optimize for readability, maintainability and changeability. Prefer simple, explicit solutions.
- Separate presentation, business logic, data access and infrastructure. Keep cohesion high, coupling low.
- Define explicit contracts for APIs, models and errors; do not change them without alignment.
- Fail fast on invalid input; handle errors explicitly; do not swallow exceptions.
- Design for retries, duplicates and partial failures: idempotent operations, no exactly-once assumptions.
- Validate external inputs; handle edge cases explicitly.
- Log key actions, errors and external calls; keep logic deterministic and testable.
- No hardcoded config, silent failures, copy-paste duplication or unnecessary abstraction.

## Delivery

- Work on `release/<version>` with one open PR per cycle, pushed slice by slice. Do not open a second PR for a stage of the same work; see **AppsIndie Branching and Checkpoint Convention**.
- Lint, typecheck and tests green before requesting review — run continuously during the slice, not once at the end. See **AppsIndie Static Analysis Convention**. Never weaken a check to make it pass.
- Two rework cycles on the same problem is the cap; the third escalates.
- Escalate immediately on: missing credential or access, unresolved critical security finding, rollout threshold breach, or a spec rule that cannot be implemented as written.
- Escalation has one format and one route — the `escalation` skill. An escalation states the choice, the recommendation, the default if the human says nothing, the deadline and the owner. Anything less is a status report, and status reports are not escalations.
- Fix review feedback silently; report back only when stuck or when feedback contradicts an explicit instruction.

## Release and rollback

- Use progressive rollout (5% → 25% → 100%) with a halt threshold; see **AppsIndie Delivery Conventions** for SIT/prod ownership and release checklists.
- A named rollback owner and explicit trigger conditions exist before production release sign-off.
- Smoke and regression runs need the environment readiness signals to be true first.
- Promotion from internal testing to the production store is a human action.

## Security

- Run a security review per **AppsIndie Security Trigger Policy** whenever the slice touches a trust boundary.
- A `critical` finding blocks phase exit; a `high` finding deferred needs human approval before release sign-off.

## Collaboration

- State key assumptions and label uncertainty clearly.
- Ask clarifying questions when ambiguity blocks a reliable decision.
- Present 2–3 viable options with tradeoffs when meaningful choices exist.
- Ground recommendations in evidence and reference source context.
- For discovery and shaping work, explore broadly before narrowing.