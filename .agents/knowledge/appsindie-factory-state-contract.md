---
name: AppsIndie Factory State Contract
id: note-98fa7e0d66cc4879907f1a37ac57b6d0
author: user
scope: When an agent needs to know which phase a product is in, whether a gate has passed, whether a human has taken control, or whether the next phase may start
---

# AppsIndie Factory State Contract

"Where is this product, and may the next thing start?" has to be a **file an agent can
read**, not a checklist only a human can. Otherwise every session begins by reconstructing
context from memory, and the answer drifts.

`FACTORY_STATE.json` is that file. It is the single machine-readable answer. Prose
checklists in the lifecycle playbook remain the definition of *quality*; this file is
the definition of *position*.

## Where it lives

| Scope | Path |
| --- | --- |
| A product | `FACTORY_STATE.json` at the product repository root |
| A Squad 0 idea | `research/<idea-id>/FACTORY_STATE.json` in this repository |

One file per product or idea. Never two.

## Shape

Schema: `.agents/state/factory-state.schema.json`. Example:
`.agents/state/factory-state.example.json`.

```json
{
  "schema_version": "1",
  "product": "focus-loop",
  "idea_id": "I01",
  "repo": "appsindie/focus-loop",
  "phase": 2,
  "gates": {
    "0": { "status": "passed", "signed_by": "justin.nguyen@appsindie.com",
           "signed_at": "2026-08-05", "evidence": "research/i01/FINAL_DECISION.json" },
    "1": { "status": "passed", "signed_by": "justin.nguyen@appsindie.com",
           "signed_at": "2026-08-12", "evidence": "docs/product/PRODUCT_CONCEPT.md" },
    "2": { "status": "open" },
    "3": { "status": "open" },
    "4": { "status": "open" }
  },
  "active_branch": "release/v1",
  "open_pr": "https://github.com/appsindie/focus-loop/pull/12",
  "last_review": {
    "verdict": "pass",
    "routine": "code-review",
    "session_url": "https://claude.ai/code/session_01HJ...",
    "round_count": 1,
    "fired_at": "2026-08-14T09:12:00Z"
  },
  "open_exceptions": [],
  "hold": false,
  "next_action": "Run SIT regression per docs/qa/QA_PLAN.md, then request Gate 2.",
  "owner": "justin.nguyen@appsindie.com",
  "updated_at": "2026-08-14T09:12:00Z"
}
```

## Phases and gates

Gates are numbered by what they **let you enter**, not by what they close.

| Phase | Name | May start only when |
| --- | --- | --- |
| 0 | Research | always |
| 1 | Shape | Gate 0 passed (`VALIDATE NOW`) |
| 2 | Build | Gate 1 passed |
| 3 | Release | Gate 2 passed |
| 4 | Grow | Gate 3 passed |
| — | Continue / iterate / sunset | Gate 4 decided |

`gates.N.status` is one of `open`, `passed`, `blocked`.

## Invariants (enforced by `scripts/factory_state.py`, and in CI)

1. `phase` ≥ 1 requires gate `phase - 1` to be `passed`.
2. A gate cannot be `passed` while a lower-numbered gate is not `passed`.
3. A `passed` gate carries `signed_by`, `signed_at` and `evidence`. All four gates are
   signed by a **human** — see the label authority table in **AppsIndie AI Review Loop
   Convention**. A reviewer routine applies review labels; it never signs a gate.
4. A gate cannot be `passed` while any entry in `open_exceptions` is `blocking`.
5. `hold: true` requires `next_action` to state what the human is holding for.
6. On the irreversible gates — **0** (spends a portfolio slot) and **3** (production
   and store) — no exception may carry `default_if_silent: "proceed"`. Silence never
   ships. See the **escalation** skill.
7. `updated_at` is RFC 3339 UTC and moves forward on every write.

## The take-control lever

`hold: true`, mirrored by the `human-hold` label on the open PR.

Every playbook opens by checking it. When it is set, agents **stop and report** —
they do not finish the current slice, do not fire a review, do not advance a phase.
Clearing it is a human action. This is what makes the human an *optional* observer:
watching costs nothing, and intervening costs one label.

## Reading and writing it

```sh
python scripts/factory_state.py --selftest
python scripts/factory_state.py validate FACTORY_STATE.json
python scripts/factory_state.py next FACTORY_STATE.json    # what may start now, and why not
python scripts/factory_state.py sweep                      # portfolio digest, leads with what needs a human
python scripts/factory_state.py sweep --format json
```

`sweep` is the observer surface: it discovers every `FACTORY_STATE.json`, sorts products
into *needs you* / *held by you* / *advancing* / *in progress*, and flags exceptions past
their deadline. Run it whenever you want the portfolio in one screen — after a Devin
session, or before deciding what to advance next.

Output is byte-stable JSON (2-space indent, sorted keys, trailing newline) for the
same reason `scoring.py` is: a reviewer re-runs it and diffs. A state file that a
re-write would change is a defect.

## Related

- **AppsIndie AI Software Factory** — squads, gates, repo map
- **AppsIndie AI Review Loop Convention** — who may apply which label
- **AppsIndie Branching and Checkpoint Convention** — which branch and PR a phase uses
- `.agents/skills/escalation/` — how an exception is framed and routed
