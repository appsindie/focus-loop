# Growth Review — <product> <version>, day <7|14|N>

Instantiate as `docs/release/<version>/GROWTH_REVIEW.md`. Mirror the verdict and the
variance table into the Gate 4 PR body.

One screen. The reader is deciding whether this product keeps its portfolio slot.

---

## Recommendation

**`CONTINUE` | `ITERATE` | `SUNSET`** — because <one sentence>.

- Gate 4 decision needed: **yes**
- Next review: <date>

## North-star and guard-rail

Source: the deployed environment. If an event is not emitting, write `NOT EMITTING` —
never an estimate.

| Metric | From Gate 0 | Target by now | Actual | Verdict |
|---|---|---:|---:|---|
| <north-star> | `validation_metrics` | | | on / behind / ahead |
| <guard-rail> | `kill_criteria` | | | within / breached |

## Economics vs the Gate 0 thesis

Same definitions as Gate 0 — see **AppsIndie Portfolio Opportunity Policy**. Do not
re-baseline.

| Metric | Gate 0 Base case | Actual | Variance |
|---|---:|---:|---:|
| MAU | | | |
| Ad ARPU | | | |
| Variable Contribution per MAU | | | |
| Net Monthly Contribution | | | |
| Months to $2,000 net contribution | | | |

## Variance analysis

Where it missed, by how much, and **why** — the mechanism, not the mood. Two or three
sentences. This is the input that improves the next Stage 3 estimate, so an honest miss
is worth more here than a confident story.

## Kill criteria

| Criterion (from Gate 0) | Breached? | Evidence |
|---|---|---|
| | | |

Any breach forces `SUNSET` or an explicit, signed override.

## If `ITERATE`

- The named cause:
- The change that could fix it:
- How we will know within <N> days:

Enters Phase 1 as a feature. It does not skip shaping.

## If `SUNSET`

- Slot released on: <date>
- Sunset runbook followed: `docs/release/RUNBOOK_<surface>.md`
- Recorded in `backlog.md` with the measured variance: yes / no

## Exceptions

Anything needing the human beyond the Gate 4 signature. Use the `escalation` skill
format. Delete this section when there are none — that is the normal case.

---

## Gate 4 signature

I accept this recommendation and the portfolio consequence.

- Decision: `CONTINUE` | `ITERATE` | `SUNSET`
- Sign: __________________ Date: __________
