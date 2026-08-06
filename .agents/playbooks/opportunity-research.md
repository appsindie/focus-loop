---
name: Opportunity Research
id: playbook-c85188c86f854a72a546ba4fb54b7bf1
macro: !research_opportunity
access: org
url: https://app.devin.ai/settings/playbooks/c85188c86f854a72a546ba4fb54b7bf1
---

# Opportunity Research

**Self-contained on purpose.** The research process lives in the skill asset, and Squad 0 runs in this repository under `research/`. Do not "normalise" this into a pointer to a file that does not exist.

Find the next portfolio app. Stop at Gate 0. Do not bootstrap a product repo from this playbook.

## Entry

- Portfolio mandate (e.g. "find the next ads-first consumer app") **or**
- Previous stage handoff JSON + stage to run **or**
- Stage 2 shortlist + one `idea_id` for Stage 3

## Execution rules

- **One stage per run.** Stage 3 = **one idea** per run.
- Input is the previous stage's handoff JSON, **unchanged**.
- Follow `.agents/skills/opportunity-research/SKILL.md` and the matching section of `opportunity-research-v5.md`.
- Portfolio thresholds ($2,000 Net Monthly Contribution at Month 9 Base case, ≤8 build-weeks, evidence tags) come from **AppsIndie Portfolio Opportunity Policy**.
- Every Research PR: labels `devin` + `ai-product-research`; fire the `research` reviewer routine (`scripts/fire_review.sh --phase research`) per **AppsIndie AI Review Loop Convention**.
- Commit `inputs.json` and `scoring-output.json` in the PR. Report tables are a presentation of the output file.
- Run `python scripts/scoring.py --selftest` (or the skill asset path) before trusting numbers.

## Stages

| Stage | Output | Commit to | Human gate? |
| --- | --- | --- | --- |
| 1A Breadth Screening | 12 niches → ≤6 survivors + handoff JSON | `research/stage-1a/` | No (review optional unless category bias suspected) |
| 1B Niche Verification | ≤5 verified niches + handoff JSON | `research/<niche-id>/` per surviving niche | Claude review required |
| 2 Idea Scoring | Scoring CSV + ≤5 shortlist + handoff JSON | `research/stage-2/` | Claude review required |
| 3 Deep Dive | Report + Final Decision JSON + Gate 0 PR | `research/<idea-id>/` | Claude review + **Gate 0 human** |

Paths are part of the process — the operator supplies the mandate, not the layout.
Stage 1A and Stage 2 produce one cross-niche artifact each, so they get a stage
folder; 1B and 3 are per-item and get an item folder. `inputs.json` and
`scoring-output.json` live in the same folder as the report that cites them.

## Reviewer verdicts (map carefully)

Two different words share the English label "REJECT":

| Verdict | Meaning | Next step | Cap |
| --- | --- | --- | --- |
| `APPROVE` | Research usable | Proceed / Gate 0 | — |
| `APPROVE WITH CORRECTIONS` | Small fixes; apply CSV then short verify-only pass | Proceed after verify | Verify pass does **not** count |
| `RESEARCH REQUIRED` | Evidence gap that could change ranking | Rework same stage | Counts toward **2-round** cap; after 2 → decide at Low confidence **or** drop from shortlist |
| `REJECT` (reviewer) | Research untrustworthy (fabricated data, bad arithmetic, systematic double-count) | **Rerun the stage**; idea stays alive | Counts as **one round**; second REJECT on same stage → escalate to human with a clear question |
| S3.13 `REJECT` | Bad idea after good research | Kill; record reason | Not a review loop |

### `VALIDATE AFTER EVIDENCE GAP IS CLOSED`

- Does **not** spend a portfolio slot.
- Does **not** count toward the 2-round `RESEARCH REQUIRED` cap.
- **Max 1** use per idea. Second time → auto `HOLD FOR PORTFOLIO LATER`.
- Every gap must name the **concrete source** that will close it (which report, tool, or interview). If you cannot name a source, it is permanent `[UNKNOWN]` → `HOLD`, not "wait".

## Gate 0

Use `.agents/skills/opportunity-research/assets/gate-research-pr.md`.

- Signature box 1: research verdict is trustworthy.
- Signature box 2: grant portfolio slot — must re-list living `[UNKNOWN]` / `[LOW-CONFIDENCE]`.

Only `VALIDATE NOW` after both signatures may bootstrap a product repo and copy Final Decision JSON to `docs/research/OPPORTUNITY_DECISION.json`.

## Report back

Stage reached, PR link, Claude verdict, rework round count, decision (if Stage 3), living unknowns, and what blocks the next stage.
