---
name: escalation
description: Turn a blocked agent into a decision a human can make in a minute — the choice, the recommendation, and what happens by default if they say nothing.
---

## Purpose
A run should not need the human until a decision is genuinely theirs. This skill defines
what "pulled in" looks like, so that escalation is a routed artifact rather than an agent
stopping and hoping — and so that the human can walk away from a run without it silently
dying on a question nobody saw.

## When to use
- The rework cap is hit (third round on the same problem).
- A `fail` cannot be remediated within the scope of the current work.
- `verify` cannot be made green after two attempts on the same check, or the baseline was
  already red on arrival — see **AppsIndie Static Analysis Convention**. Weakening the
  check instead of escalating is a defect.
- A decision is irreversible, spends money, or is market-facing.
- A credential, access or signed agreement is missing.
- A spec rule cannot be implemented as written.
- Any `Escalate when` condition in
  `.agents/skills/production-readiness/assets/readiness-checks.md`.

This generalises the `pass | fail | exception` model that `production-readiness` already
uses at Gate 3 to every gate. That model is the reference implementation — do not invent
a second format.

## The three outcomes

| Outcome | Meaning | Effect |
|---|---|---|
| `pass` | Criterion met, evidence attached | Silent — proceeds |
| `fail` | Criterion not met, fix is in scope | Blocks; remediate and re-run. **Do not escalate** |
| `exception` | Human judgement genuinely required | Escalates as a framed choice |

A `fail` that cannot be remediated in scope **becomes an `exception`**. A `fail` never
terminates a run silently: every blocked item ends up either fixed or in front of a
human.

Silence means proceed — but only where the default says so, and never on an irreversible
gate.

## What an exception must contain

Five parts. An item missing any of them is a status report, and status reports are not
escalations:

1. **The choice** — stated as options A / B, each with its consequence.
2. **The recommendation** — which one, and why.
3. **The default if the human says nothing** — `proceed` or `block`.
4. **The deadline** — when the default takes effect.
5. **The owner** — the named human who decides.

"X is unclear" is not an exception. Resolve it, or convert it into a choice.

## Defaults and irreversibility

`default_if_silent: proceed` is allowed only where the decision is **reversible**.

On the irreversible gates it is forbidden, and `scripts/factory_state.py` rejects it:

| Gate | Why silence cannot carry it |
|---|---|
| **0 — Approve Opportunity** | Spends a portfolio slot: up to 8 build-weeks |
| **3 — Approve Production** | Production rollout and store submission are market-facing |

Also never defaulted to `proceed`: creating a product repository, promoting a build to
the store, an unresolved `critical` security finding, a destructive `terraform plan`, an
irreversible migration without a verified restore point.

## Routing

Every exception is written **once** and routed to three places. They are not three
copies — they have three different jobs, and confusing them is how escalations get lost.

| Destination | Job | Written how |
| --- | --- | --- |
| **The PR comment** | The **record**. The full exception, and where the human answers | `assets/exception.md` as a PR comment, plus the `human-decision` label |
| **`FACTORY_STATE.json`** | The **block**. What actually stops the orchestrator | An entry in `open_exceptions` with `blocking`, `default_if_silent`, `gate`, `deadline`, `owner` |
| **Slack** | The **notification**. So the human learns about it without polling | One message to the owner, linking the PR comment |

A prose escalation nothing can read does not block anything — the `FACTORY_STATE.json`
entry is what makes the stop real. A blocking entry with no Slack message is silent until
the human happens to look. Both legs are required.

### Slack

Devin has the Slack connector by default, so this leg is wired, not aspirational.

- **Where:** `#appsindie-factory` by default. If the product has its own channel, post
  there and cross-post the one-liner to `#appsindie-factory`.
- **What:** the choice, the recommendation, the default if silent, the deadline, and a
  link to the PR comment. Not the whole exception — Slack is the doorbell, the PR is the
  room.
- **Threading:** all updates on one exception go in **one thread**. A second top-level
  message about the same decision trains the reader to ignore the channel.
- **On resolution:** reply in the thread with what was decided. A thread that just stops
  reads as unresolved forever.

```text
:warning: *focus-loop* needs a decision — Gate 3
E1 [high] Rollback owner unnamed for v1.2
Recommendation: name the owner before rollout (option A).
If you say nothing by 2026-08-10: *blocked* — this will not ship.
<https://github.com/appsindie/focus-loop/pull/12#issuecomment-123|Decide on the PR>
```

**If Slack fails**, the exception still stands: the PR comment and the state entry are the
control. Note the delivery failure on the PR and carry on — never drop or downgrade an
exception because a notification did not send.

## Resolution

The human answers on the PR. Devin then removes the entry from `open_exceptions`, records
the answer in the same PR thread and the same Slack thread, and continues.

An expired deadline with no answer applies the **stated default** and records on the PR
that it was applied by default, naming the deadline that passed. It never silently picks
the outcome the agent preferred — and on Gates 0 and 3 that default is always `block`, so
an unanswered exception there stops the release rather than shipping it.

## Operating rules
- Escalate the **decision**, not the situation. If you can act, act.
- One exception per decision. Do not bundle three choices into one item.
- Never escalate a status report, a progress update, or a question you could answer by
  reading the repository.
- Never escalate twice for the same thing; update the existing item.
- If a run has produced no exceptions, say so in one line and proceed. No exceptions is
  the normal case, and manufacturing them to look thorough trains the human to ignore
  the channel.
- Check `hold` before escalating: if a human already took control, report to them
  directly rather than opening an exception.

## Templates

| Use | Path |
| --- | --- |
| Exception (any gate) | `.agents/skills/escalation/assets/exception.md` |
| Release readiness exception report (Gate 3) | `.agents/skills/production-readiness/assets/exception-report.md` |

## Related
- `production-readiness` — owns Gate 3's checks and the report they feed
- **AppsIndie Factory State Contract** — `open_exceptions`, the `hold` lever, invariant 6
- **AppsIndie AI Review Loop Convention** — the rework cap that escalates on round three
- **AppsIndie Static Analysis Convention** — the two-attempt cap on a check that will not
  go green, and the A/B/C options that exception offers
- **AppsIndie Team Rules** — the always-escalate list
