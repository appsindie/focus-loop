---
name: production-readiness
description: Verify a release is fit for production by machine-checkable evidence, and escalate only the exceptions a human must decide.
---

## Purpose
Turn release readiness from prose into evidence. Produce a verdict and a short exception list that feeds **Gate 3 (Approve Production)** — not a checklist for a human to fill in.

## When to use
- Stage 2 of `!release_product`, after SIT passes and before the Gate 3 decision.
- Any time a production rollout, rollback threshold or operability signal is being defined or changed.

## Design rule
**An item states how it is verified, and by whom.** Every row in `.agents/skills/production-readiness/assets/readiness-checks.md` names a command, a query, or an artifact path — and rows that can only be verified by a human (a portal lookup, a plan review) are marked `manual` so the gap is visible rather than papered over. An item with no stated verification is a defect in the gate, not a question for the human.

Prefer automation: a `manual` row is a standing invitation to replace it with a command.

## Outcomes
Each item resolves to exactly one:

| Outcome | Meaning | Effect |
|---|---|---|
| `pass` | Check ran, criterion met, evidence attached | Silent — proceeds |
| `fail` | Check ran, criterion not met, fix is in scope | Blocks; remediate and re-run, do not escalate |
| `exception` | Human judgement genuinely required | Escalates with the decision framed as a choice |

A `fail` that cannot be remediated in scope **becomes an `exception`** — framed as accept / fix / defer the release. A `fail` never terminates the run silently; every blocked item ends up either fixed or in front of the human.

Silence means proceed. A readiness run with no exceptions still requires the Gate 3 human decision, but presents as a verdict, not a review.

## Operating rules
- Run every check before reporting. A partial run is a `fail` of the run itself, not a shorter report.
- Attach evidence by path or command output for every `pass`. An unevidenced pass is an `exception`.
- Remediate `fail` autonomously where the fix is in scope; re-run the check rather than narrating the fix. If it cannot be remediated in scope, raise it as an `exception`.
- **`.agents/skills/production-readiness/assets/readiness-checks.md` is the single source of escalation conditions.** Escalate on any `Escalate when` condition in that file, plus an unevidenced `pass` and an unremediable `fail`. The conditions below are the ones that most often decide a release — they are illustrative, not the complete set:
  - an unresolved `critical` security finding (per `security` skill), or a `high` deferred without approval
  - a secret found in the repo or in variable files
  - a rollback that is unowned, never rehearsed, or whose trigger conditions are prose rather than numbers
  - a destructive production `terraform plan`, or post-apply divergence from the reviewed plan
  - an irreversible migration, or no verified restore point
  - a missing credential or unsigned store agreement
  - north-star events not emitting from the deployed environment
  - an SLO with no alert wired behind it
- Never escalate a status report. An exception states the choice, the recommendation, and what happens by default if the human says nothing.
- Gate 3 stays human — production release is irreversible and market-facing. This skill makes it a one-minute decision, not a re-review.
- Rollout thresholds come from `.agents/skills/production-readiness/assets/slo-and-alerting.md`. The `5% → 25% → 100%` rule in the `release` skill halts on those numbers; if they are undefined, readiness fails.

## Outputs

Written to the product repository. The templates in `assets/` are the source; these are the instantiated artifacts.

| Artifact | Scope |
|---|---|
| `docs/release/<version>/READINESS.md` | Per release — checks run, with evidence |
| `docs/release/<version>/EXCEPTION_REPORT.md` | Per release — the Gate 3 artifact, mirrored into the Release PR body |
| `docs/release/SLO_AND_ALERTING.md` | Per product, carried across releases |
| `docs/release/RUNBOOK_<surface>.md` | Per surface, updated each release |

The last two are long-lived, not per-release. They ship blank: **the first release of a product fails readiness on every surface until they are seeded.** That is the gate working, not a bug — undefined thresholds mean the rollout has nothing to halt on. Seed them during the first Phase 3, then maintain them.

## Templates

| Use | Path |
| --- | --- |
| Readiness checks | `.agents/skills/production-readiness/assets/readiness-checks.md` |
| SLOs and rollout thresholds | `.agents/skills/production-readiness/assets/slo-and-alerting.md` |
| Operating runbook | `.agents/skills/production-readiness/assets/runbook.md` |
| Exception report (the artifact the human reads) | `.agents/skills/production-readiness/assets/exception-report.md` |

## Related
- `escalation` — owns the exception format and routing; this skill is where that model
  originated and Gate 3 is its strictest case (default is always `block`).
- `release` — owns infra, rollout mechanics and rollback execution.
- `qa` — produces the SIT and failure-mode evidence this gate consumes.
- `security` — owns finding severity; `critical` blocks here too.
- Per-product detail lives in the product repository's own `.agents/skills/`, per `AGENTS.md`.
