---
name: growth
description: Measure a shipped product against the economics Gate 0 approved, and recommend continue, iterate or sunset at Gate 4.
---

## Purpose
Close the loop. Gate 0 granted a portfolio slot on a set of projected numbers; this skill
is where reality is compared to them, and where the slot is either kept, re-aimed or
handed back.

Without it the SDLC terminates at release: a product ships, nobody checks whether the
thesis held, and the portfolio fills with apps nobody decided to keep.

## When to use
- Day 7 and day 14 after a production release. Started by the operator today; the `growth-review` schedule is written but not created.
- Monthly thereafter while the product holds a portfolio slot.
- Any time a kill criterion from `OPPORTUNITY_DECISION.json` is breached.

## The comparison

Use the **same contribution definitions Gate 0 used** — from **AppsIndie Portfolio
Opportunity Policy**. Never mix Variable Contribution per MAU with Net Monthly
Contribution, and never re-baseline to make a miss look smaller.

| From Gate 0 | Compared against |
| --- | --- |
| `validation_metrics` | The north-star metric, measured from the deployed environment |
| `kill_criteria` | The guard-rail metrics |
| `economic_summary.base_ad_arpu` | Actual ad ARPU |
| `cash_break_even_mau` | Actual MAU trajectory |
| `months_to_2000_net_contribution` | Actual Net Monthly Contribution by month |

Where the product missed, say by how much and say why. A variance written up honestly is
the only thing that improves the next Stage 3 estimate; a variance explained away
corrupts the model that scores every future idea.

## Gate 4 — Continue / Iterate / Sunset

| Recommendation | When | Next |
| --- | --- | --- |
| `CONTINUE` | On or ahead of the Gate 0 trajectory | Keep the slot; next review scheduled |
| `ITERATE` | Behind, with a named, testable cause and a change that could fix it | Keep the slot; the change enters Phase 1 shaping as a feature |
| `SUNSET` | A kill criterion breached, or no credible path to the Gate 0 economics | Release the slot; follow the sunset section of `.agents/skills/production-readiness/assets/runbook.md` |

The recommendation is the agent's; the decision is the human's. Gate 4 is signed like
every other gate — `gate-signed`, human only.

`SUNSET` writes the outcome back to `backlog.md` with the reason and the measured
variance, so the next portfolio run knows what was tried. A killed product that leaves no
record is a lesson paid for and thrown away.

Because nothing schedules this yet, a missed window is silent. Record the day-7 and day-14
dates in `FACTORY_STATE.json` `next_action` at release, so the state file carries the
reminder.

## Operating rules
- Measure from the deployed environment, not from a spreadsheet. If the north-star events
  are not emitting, that is the finding — report it and stop, do not estimate around it.
- Write up day 7 and day 14 **even when the movement disappoints**, and especially then.
- One recommendation per review. "Continue but also consider sunsetting" is not a
  recommendation.
- Anything requiring a human beyond the Gate 4 signature is an `exception` — the same
  framing as every other gate: choice, recommendation, default if silent, deadline, owner.
- Listing copy, keywords and creative are **not** this skill — that is `go-to-market`.
  This skill measures; that one changes the listing.

## Outputs

| Artifact | Scope |
| --- | --- |
| `docs/release/<version>/GROWTH_REVIEW.md` | Per review — day 7, day 14, monthly |
| `backlog.md` entry | On `SUNSET`, or when an idea is parked for later |
| `FACTORY_STATE.json` | Gate 4 status, next review date |

## Templates

| Use | Path |
| --- | --- |
| Growth review | `.agents/skills/growth/assets/growth-review.md` |

## Related
- `go-to-market` — acts on what this skill measures
- `opportunity-research` — owns the model these actuals feed back into
- **AppsIndie Portfolio Opportunity Policy** — the contribution definitions, unchanged
  from Gate 0
- `production-readiness` — owns the sunset runbook
