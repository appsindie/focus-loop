---
name: Run Factory
id: playbook-65f862de0539489c892c42f68e9ff123
macro: !run_factory
access: org
url: https://app.devin.ai/settings/playbooks/65f862de0539489c892c42f68e9ff123
---

# Run Factory

Drive a product from wherever it is to wherever it can get to without a human, and stop
cleanly when it needs one.

This is the orchestrator. It does not do the work — the phase playbooks do. It decides
**what runs next**, and it decides it from `FACTORY_STATE.json`, never from memory of
what happened in a previous session.

## Entry

A product slug, an `idea_id`, or a repository. If none is given, run across every
`FACTORY_STATE.json` you can find and report the portfolio.

Two invocation modes, **both human-started** — no schedule fires this today:

| Mode | Asked for as | Scope |
| --- | --- | --- |
| **Targeted** | "advance focus-loop" | One product |
| **Portfolio** | "run the factory" / "what's the state of everything?" | Every tracked product, then a digest |

Auto-advance means a running session knows what comes next without being told the phase.
It does not mean the factory moves overnight — nothing starts a session but the operator.
See **AppsIndie Review Routine Registry** → scheduled routines for what would change that
and when to revisit.

## The loop

1. **Read the state.** `python scripts/factory_state.py next FACTORY_STATE.json`.
2. **Stop if held.** `hold: true`, or `human-hold` on the PR → report and end. Do not
   finish the current slice.
3. **Stop if blocked.** Any blocking exception → report it and end. If the exception has
   not yet been raised, raise it with the `escalation` skill first.
4. **Rework if the reviewer said so.** `last_review.verdict` of `rework`,
   `RESEARCH REQUIRED` or `REJECT` → apply corrections, re-fire, and loop. Third round on
   the same problem escalates instead.
5. **Advance if the gate passed.** Gate `N` `passed` and phase `N` complete → start
   phase `N+1`, subject to the hard stops below.
6. **Otherwise continue the current phase** per its playbook.
7. **Update the state** at the end of every run: phase, gate status, active branch, open
   PR, last review, open exceptions, `next_action`, `updated_at`.

Step 7 is not bookkeeping. A run that does useful work and leaves the state stale has
made the next run start from a lie.

## Phase routing

| Phase | Playbook | Entered when |
| --- | --- | --- |
| 0 Research | `!research_opportunity` | always available |
| 1 Shape | `!shape_from_slack` | Gate 0 passed with `VALIDATE NOW` |
| 2 Build | `!build_product` | Gate 1 passed |
| 3 Release | `!release_product` | Gate 2 passed |
| 4 Grow | `!grow_product` | Gate 3 passed |
| — | `!gtm_aso` | alongside phase 4, when a listing needs work |

## Hard stops — always require an explicit human go-ahead

Two transitions never auto-advance, no matter how clean the gate:

| Transition | Why | What to do |
| --- | --- | --- |
| Gate 0 `VALIDATE NOW` → **create the product repository** | Spends a portfolio slot: up to 8 build-weeks, and a repository is a durable object | Use the repo-confirmation step in `!shape_from_slack`. It requires an unambiguous yes carrying repository name, visibility and sponsor. "Sounds good" is not a confirmation |
| Gate 3 → **production rollout and store promotion** | Irreversible and market-facing | Present the exception report; wait. Promotion to the store stays a human action even after Gate 3 |

Everything else advances on a signed gate with no open blocking exception.

## What the orchestrator may never do

- Apply `gate-signed`. Gates are human decisions; the orchestrator reads them.
- Treat a reviewer `ai-review-pass` as a gate signature. A pass is necessary, not
  sufficient.
- Advance on a missing verdict. `no-verdict` is a blocker, not a neutral value.
- Advance past a `hold`, or clear one.
- Merge to `main`.

## Concurrency

One run per product at a time. Before starting, check that `active_branch` is not being
written by another session; if it is, report and end rather than racing. Across
products, runs are independent — the portfolio sweep may advance several.

## Report back

Per product: phase, gate status, what ran, what is now open, and exactly one of —
*advanced to phase N*, *waiting on human decision X*, *held*, or *reworking round N*.

If nothing advanced anywhere, say that in one line. A sweep that finds nothing to do is
the normal state of a healthy factory, not a failure to report.

### The digest (portfolio mode)

After the loop, produce the observer surface:

```sh
python scripts/factory_state.py sweep                 # markdown for Slack
python scripts/factory_state.py sweep --format json   # same data, machine-readable
```

The digest leads with **what needs a human** — open exceptions, with overdue ones
flagged, and gates that are reviewed and passing but unsigned. Held products are listed
separately: they are the human's own doing, not something demanding their attention.
Everything else collapses to a count.

Report it in the session. Post it to `#appsindie-factory` as well when the run was asked
for on behalf of someone else, or when something needs a decision — @-mention the owner
named in the entry.

An invalid `FACTORY_STATE.json` is reported, not skipped — a product silently missing
from the digest is worse than a product shown as broken.

## Related

- **AppsIndie Factory State Contract** — the file this playbook runs on
- **AppsIndie AI Software Factory** — squads, gates, repo map
- `.agents/skills/escalation/` — how a stop becomes a decision
