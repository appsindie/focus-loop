# Release Readiness — Exception Report

Instantiate as `docs/release/<version>/EXCEPTION_REPORT.md`, and mirror it into the Release PR body.

The only readiness artifact a human reads. It exists to make Gate 3 a decision, not a review.

Rules for whoever writes it:

- **Lead with the verdict.** The reader must know in one line whether anything needs them.
- **Passed checks are not content.** Report the count; the evidence lives in `READINESS.md`.
- **Every exception states a choice, a recommendation, and a default.** "X is unclear" is a status report, not an exception — resolve it or make it a choice.
- **No exceptions is a valid and common report.** Do not manufacture items to look thorough.
- Target length: one screen.

---

## Verdict

**`ready` | `ready with exceptions` | `not ready`** — <version>, surfaces <api/web/ios/android>

- Checks run: N — passed: N, failed-and-remediated: N, exceptions: N
- Gate 3 decision needed: **yes** (always — this is the irreversible one)

## Exceptions

Delete this section entirely when there are none.

### 1. <one-line statement of the choice>

- **Situation**: what the check found, in two sentences.
- **Options**: A — <action and consequence>. B — <action and consequence>.
- **Recommendation**: <A or B>, because <reason>.
- **Default if you say nothing**: <what proceeds, or that it blocks>.

### 2. <…>

## What ships

- Summary of user-facing change (one line — full detail in the release notes).
- Rollout plan: 5% → 25% → 100%, halting on the thresholds in `docs/release/SLO_AND_ALERTING.md`.
- Rollback: owned by <name>, rehearsed <date>, command in the runbook.

## Accepted risks carried into production

Items consciously accepted, each with an owner and a date. Empty is a valid answer.

| Risk | Accepted by | Date | Revisit at |
|---|---|---|---|
| | | | |

## After the release

- Day 7 / day 14 north-star comparison scheduled for: <dates>
- Write it up even when the movement disappoints.
