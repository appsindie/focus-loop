---
name: AppsIndie PR Labeling and Reviewer Convention
id: note-24d4494ec06f4141918bab8560ab2ac4
author: user
scope: When creating or updating issues or pull requests in any AppsIndie repository
---

# AppsIndie PR Labeling and Reviewer Convention

Use these rules for every issue or PR Devin creates in any AppsIndie repository.
Labels are declared in `.github/labels.json` and created by
`scripts/bootstrap_labels.sh` — do not hand-write `gh label create` lines, and do not
invent a label that is not in that file.

## Taxonomy

| Label | Meaning |
| --- | --- |
| `devin` | Created by Devin. On every Devin-authored issue and PR. |
| `ai-product-research` | Portfolio opportunity research (Stage 1A/1B/2/3) |
| `ai-product-shaping` | Concept, spec, design, high-level architecture |
| `ai-product-build` | Implementation, CI/CD, tests, migrations |
| `ai-product-release` | Production infra, deployment, monitoring, release management |
| `ai-product-growth` | ASO, listing, post-release north-star review |

One `ai-product-*` label at a time. On the long-lived release PR it moves with the
cycle: shaping → build → release.

Do not use generic `build`, `release`, `shaping`, or `documentation` labels as the
primary category. Apply the taxonomy label at creation time.

## Status labels

| Label | Meaning | Who may apply |
| --- | --- | --- |
| `ai-review-pass` | The reviewer routine's verdict was a pass | **Reviewer routine** |
| `ai-review-rework` | The reviewer requires changes | **Reviewer routine** |
| `gate-signed` | A human signed the gate this PR is at | **Human only** |
| `human-hold` | A human has taken control; agents stop | **Human only** |
| `human-decision` | An open exception is waiting on a human | Devin or the reviewer |

`ai-review-pass` is **not** a human act any more. The reviewer routine is a separate
party from the author (see **AppsIndie AI Review Loop Convention**), so it can certify
its own findings without the author certifying its own work. Human authority is
concentrated in `gate-signed`, which no agent may apply.

A reviewer pass is necessary but not sufficient: `gate-signed` is a separate decision
made on the artifact, not on the review.

## Reviewers

- **Claude Code is the only AI reviewer.** Do not request GitHub Copilot code review.
- Every `ai-product-*` PR is reviewed, including shaping and research.
- **Devin fires the reviewer** with `scripts/fire_review.sh`; GitHub Actions holds no
  reviewer token and never fires one. An unfired PR is an unreviewed PR.
- Fire when the slice is ready, and again after material rework — not on every push.
  Cap 6 fires per PR, then escalate.
- If the reviewer cannot run, fall back to a human reviewer and note the failure on the
  PR — see **AppsIndie AI Review Loop Convention**.

## Ordering

1. Create the PR with `devin` + the correct `ai-product-*` label.
2. Push slices; fire the reviewer when a slice is ready.
3. Reviewer applies `ai-review-pass` / `ai-review-rework`.
4. At a gate, the human applies `gate-signed`.

Do not hand off to testing before the labels are in place. Missing labels cause Devin
assignment to fail and the enforcement workflow to fail the PR.

## Notes

- Existing merged PRs do not need retroactive labelling.
- Labels must exist in the target repository before use — run
  `scripts/bootstrap_labels.sh <owner/repo>` when bootstrapping one.

## Related

- **AppsIndie AI Review Loop Convention** — verdicts, firing, rework cap
- **AppsIndie Review Routine Registry** — which routine reviews which phase
- **AppsIndie Branching and Checkpoint Convention** — which PR carries which gate
