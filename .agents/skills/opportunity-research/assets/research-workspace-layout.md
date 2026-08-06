# Research workspace layout

Squad 0 runs live in **this repository** under `research/`. There is no separate
`portfolio-research` repository — it was merged in, so the Gate 0 → Gate 1 handoff
is a file read rather than a cross-repo copy.

Labels are declared once in `.github/labels.json` and applied by
`scripts/bootstrap_labels.sh`. Do not hand-write `gh label create` lines.

## Tree

```text
research/stage-1a/                     # Stage 1A screening (one cross-niche artifact)
research/stage-2/                      # Stage 2 scoring CSV + shortlist (cross-niche)
research/<niche-id>/                   # Stage 1B, one folder per verified niche
research/<idea-id>/                    # Stage 3 deep dive, one folder per idea
research/<idea-id>/FACTORY_STATE.json  # per-idea factory state (see state contract)
backlog.md                             # HOLD and S3.13 REJECT ideas
scripts/scoring.py                     # shim -> assets/scoring.py (one algorithm)
```

Stage 1A and Stage 2 each produce a single cross-niche artifact, so they get a stage
folder rather than a per-item one. `inputs.json` and `scoring-output.json` always sit
in the same folder as the report that cites them. The `!research_opportunity` playbook
stage table is the canonical statement of this mapping — do not let the two drift.

## Calculator

One algorithm, one file:

```sh
python scripts/scoring.py --selftest        # shim
python .agents/skills/opportunity-research/assets/scoring.py --selftest   # canonical
```

Both execute the same code. A second copy of `scoring.py` anywhere in the tree is a
defect — CI fails the PR (`scoring-selftest.yml`).

## What product repos copy

Product repos copy `.agents/**` at bootstrap. They never copy `research/**` — that is
run output, not governance. See the directory contract in `AGENTS.md`.
