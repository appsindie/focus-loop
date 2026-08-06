---
name: AppsIndie Branching and Checkpoint Convention
id: note-2f436fc451f04128b4f487e5d03ebc7a
author: user
scope: When deciding which branch to work on, how to structure PR checkpoints, and how many human merges a product cycle costs in any AppsIndie repository
---

# AppsIndie Branching and Checkpoint Convention

**Devin cannot merge a pull request.** Any model with a merge between phases puts a
human in the *mechanical* path, not just the decision path — the factory then stalls
overnight waiting for a click. This convention removes every merge that is not also a
decision.

The rule that follows from that: **one integration branch per cycle, one PR to `main`,
merged once by a human at the final gate.** Gates in between are signed *on that same
PR*, not by merging it.

## Branches

| Branch | Protected? | Who writes | Purpose |
| --- | --- | --- | --- |
| `main` | **Yes** | human merge only | Shippable truth |
| `release/<version>` | **No** | Devin | Long-lived integration branch for the whole cycle |
| `feat/<slice>` | No | Devin | Short-lived; branched from and merged back into `release/<version>` |
| `claude/<topic>` | No | Claude routines | Review-authored fixes; merged into `release/<version>` by Devin |

`release/<version>` is deliberately **unprotected** so Devin can merge `feat/*` into it
locally and push. That is a branch merge, not a pull-request merge, and Devin can do it.
No PR is opened for a slice.

## Checkpoints

| # | Checkpoint | Where | Human act |
| --- | --- | --- | --- |
| 0 | **Research PR** | this repository, `research/` | **Gate 0** — two signatures, then merge |
| 1 | **Shaping checkpoint** | draft PR `release/<version>` → `main`, opened here | **Gate 1** — `gate-signed` label + signed comment |
| 2 | **Build checkpoint** | same PR, marked ready | **Gate 2** — `gate-signed` label + signed comment, after SIT |
| 3 | **Release checkpoint** | same PR | **Gate 3** — sign, then **merge** |
| 4 | **Growth checkpoint** | follow-up PR from the growth routine | **Gate 4** — continue / iterate / sunset |

So a full product cycle costs the human **two merges**: the Research PR at Gate 0, and
the release PR at Gate 3. Everything in between is a label and a signed comment on a PR
that is already open.

Gate 0 keeps a separate PR because it lives in a different directory tree and nothing
downstream depends on it being merged first — the Final Decision JSON is read from the
branch.

## Slices

Slices are **commits on `release/<version>`**, pushed continuously so review starts
early. Do not open a PR per slice, per journey or per stage. Review happens on the
diff range, fired at the reviewer routine — see **AppsIndie AI Review Loop Convention**
— not by opening more PRs.

This supersedes any earlier guidance that "the human decides PR size". The human
decides *gates*; the branch model decides PR size, and it is one.

## Opening and labelling the PR

1. Cut `release/<version>` from `main` when Phase 1 (Shape) starts.
2. Open the PR to `main` as a **draft** with the first shaping commit, so review and
   commentary accumulate across the whole cycle.
3. Apply `devin` and the current `ai-product-*` label at creation; update the
   `ai-product-*` label as the cycle moves shaping → build → release.
4. Keep `FACTORY_STATE.json` current in the same commits — `active_branch` and
   `open_pr` must point at this branch and this PR.
5. Mark ready for review at Gate 2.

## When to break the rule

Split into a second PR only when a change must ship on a different schedule from the
cycle — a production hotfix, or a security fix that cannot wait for Gate 3. Those get
`hotfix/<slug>` → `main` and their own human merge, and they are re-merged down into
`release/<version>` immediately so the branches do not diverge.

Do not split because a PR feels large. A large PR that represents one shippable whole
is the intended outcome; partial state in `main` is not.

## Related

- **AppsIndie PR Labeling and Reviewer Convention** — labels and who may apply them
- **AppsIndie AI Review Loop Convention** — how review is fired on a branch, not a PR
- **AppsIndie Factory State Contract** — `active_branch`, `open_pr`, gate status
