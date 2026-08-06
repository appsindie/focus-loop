---
name: opportunity-research
description: Screen niches, score app ideas and deep-dive one opportunity to a Gate 0 portfolio-slot decision.
---

## Purpose

Turn a portfolio mandate into a Gate 0 decision: `VALIDATE NOW`, `VALIDATE AFTER EVIDENCE GAP IS CLOSED`, `HOLD FOR PORTFOLIO LATER`, or `REJECT` (bad idea).

## When to use

- Finding the next app for the AppsIndie portfolio.
- Verifying a niche, scoring ideas, or deep-diving a single shortlisted idea.
- Never to invent an app idea after a product repo already exists without Gate 0.

## Outputs

- Stage handoff JSON (committed under `research/`; per-stage paths are in the `!research_opportunity` playbook stage table — the operator supplies the mandate, not the layout)
- Research PR body from the Gate 0 template (Stage 3)
- `inputs.json` + `scoring-output.json` committed beside the report
- Final Decision JSON copied into a new product repo as `docs/research/OPPORTUNITY_DECISION.json` only after Gate 0 `VALIDATE NOW`

## Operating rules

- **Canonical research process is Vietnamese.** Numbers, thresholds and formulas in `opportunity-research-v5.md` are the source of truth. Do not translate that asset — translation drifts the tables.
- **One stage per run.** Stage 3 is one idea per run. Input is the previous stage's handoff JSON, unchanged.
- Follow the stage section of V5 named in the table below. Portfolio-level economics policy is in `appsindie-portfolio-opportunity-policy` knowledge note.
- **Numbers that must come from `scoring.py`** (committed `inputs.json` → `scoring-output.json`): Base/Final Score and multipliers; ranking stddev/top-gap; cohort MAU series; per-format revenue (eCPM/1000); Ad ARPU; Variable Contribution per MAU; Net Monthly Contribution (Month 9/12); cash break-even MAU; Conservative/Base/Optimistic scenario nets (MAU multiplier only — do not also change retention); `meets_numeric_target_month_9` (Net≥$2k **and** build-weeks≤8); monthly and **twelve-month** contribution per build-week; optional developer opportunity cost. No mental arithmetic for these.
- **Still report-authored (not yet in `scoring.py`):** required installs derivation narrative, months-to-scale narrative beyond reading the cohort table, Acquisition Sanity Check prose, Commodity Trap evidence. Tag them; do not pretend they came from the calculator.
- One calculator, one copy: the implementation lives in `assets/scoring.py` and `scripts/scoring.py` is a shim over it. A second implementation anywhere fails CI.
- Sync mechanism is **copy-on-bootstrap**, not a submodule.

## Stage map

| Stage | Read in V5 | Produce |
| --- | --- | --- |
| 1A Breadth Screening | `# STAGE 1A` | Screening table + handoff JSON |
| 1B Niche Verification | `# STAGE 1B` | Gate evidence + delta table + handoff JSON |
| 2 Idea Scoring | `# STAGE 2` | Scoring CSV via `scoring.py` + shortlist handoff JSON |
| 3 Deep Dive | `# STAGE 3` (`S3.1`–`S3.13`) | Report + Final Decision JSON + Gate 0 PR |
| Review | `# REVIEW CHECKPOINT` | Reviewer verdict |

## Templates

| Use | Path |
| --- | --- |
| Canonical V5 process (Vietnamese) | `.agents/skills/opportunity-research/assets/opportunity-research-v5.md` |
| Gate 0 Research PR body | `.agents/skills/opportunity-research/assets/gate-research-pr.md` |
| Scoring + economics calculator | `.agents/skills/opportunity-research/assets/scoring.py` |
| `inputs.json` schema example | `.agents/skills/opportunity-research/assets/inputs.example.json` |
| Research workspace layout | `.agents/skills/opportunity-research/assets/research-workspace-layout.md` |

Run self-test before first use in a session:

```sh
python .agents/skills/opportunity-research/assets/scoring.py --selftest
```
