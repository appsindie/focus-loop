---
name: AppsIndie AI Review Loop Convention
id: note-02757cee68524107b19160900398010c
author: user
scope: When requesting, performing, or acting on AI review of any AppsIndie pull request
---

# AppsIndie AI Review Loop Convention

**Claude Code is the only AI reviewer.** GitHub Copilot code review is not used.

Review is **automated and is an independent control**. Devin fires a pre-registered
reviewer routine; the routine posts the verdict and applies the review label. The human
does not appear in the per-PR loop at all — human authority moves to the four gates,
where it belongs.

## Why firing an API is not self-review

An earlier version of this note argued that having Devin call a review API "would put
the author back in charge of its own review". For **routines** that reasoning does not
hold, and the distinction is worth stating precisely because the whole loop rests on it:

| | Who controls it |
| --- | --- |
| The reviewer's prompt, model, criteria and repository access | The **human**, at registration time |
| The decision to start a review run | Devin (or a GitHub event) |
| The review criteria applied during the run | The routine's own prompt and the `.agents/` corpus |
| The verdict | The **routine** |
| The gate signature | The **human** |

Devin holds a doorbell, not a pen. It cannot alter what the reviewer looks for, and the
fire payload it sends arrives wrapped as untrusted data that the reviewer is instructed
to use for addressing only. Author and reviewer remain separate parties, which is the
property that actually matters — not who pressed start.

What Devin still may not do: issue a verdict, declare a verify-only pass complete, apply
`gate-signed`, or merge.

## Precondition: the deterministic layer ran first

A fire is only permitted on a pushed head where the repository's `verify` entry point is
**green** — see **AppsIndie Static Analysis Convention**. A reviewer routine spending its
ten finding slots on type errors and unused imports is a wasted fire against the six-fire
cap, and the defects the routine exists to find get crowded out. Firing on a red tree is
not a shortcut; it is a round spent.

## Trigger

1. Apply `devin` + the correct `ai-product-*` label when the PR is created.
2. Fire the phase's routine: `scripts/fire_review.sh --phase <phase> …`. See
   **AppsIndie Review Routine Registry** for the URL and token per phase.
3. Record the returned session URL on the PR and in
   `FACTORY_STATE.json.last_review.session_url`.
4. The routine posts a verdict comment and applies `ai-review-pass` or
   `ai-review-rework`.
5. Devin applies corrections and re-fires. The human is not involved unless the loop
   escalates.

**Devin is the only firer.** GitHub Actions holds no reviewer token, so there is no
workflow fallback and no `pull_request.opened` trigger — a PR that Devin does not fire
on is not reviewed. Firing is therefore part of the definition of done for a slice, not
an optional courtesy: a PR reaching a gate with no verdict recorded in
`FACTORY_STATE.json` is blocked at that gate, and the enforcement workflow fails it.

### Fired is not reviewed

A `2xx` from the fire endpoint means a session started. It is not a review. Devin waits
for the verdict comment; if none appears within 30 minutes, treat it as the fallback
case below. Never record a verdict that was not posted by the reviewer, and never
advance a gate on a session URL alone.

### Who may do what

| Action | Who |
| --- | --- |
| Fire a reviewer routine | Devin (or a human); **not** GitHub Actions — it holds no token |
| Apply corrections from a review | Devin |
| Report which corrections were applied | Devin |
| Issue a verdict (`APPROVE`, `RESEARCH REQUIRED`, …) | Reviewer routine only |
| Declare a verify-only pass complete | Reviewer routine only |
| Apply `ai-review-pass` / `ai-review-rework` | Reviewer routine |
| Apply `gate-signed` | **Human only** |
| Apply / clear `human-hold` | **Human only** |
| Merge to `main` | **Human only** |

"Corrections applied, please re-check" is Devin's to say. "Verified" is not.

## When to fire, and when not to

- Fire at **slice completion** and after **material rework** (security surface,
  architecture, a corrections CSV applied, findings invalidated).
- Do not fire on every push. Do not fire to check whether a trivial edit broke anything.
- **Cap: 6 fires per PR.** The seventh is an escalation, not a fire — something is wrong
  with the work or with the criteria, and a human needs to say which.

## Verdict format

```text
DECISION: pass | rework

Findings:
- [critical|high|medium|low] path/to/file — action required
```

For Squad 0 / research PRs, the reviewer may also emit the V5 decisions:

| Reviewer / V5 verdict | Label | Next |
| --- | --- | --- |
| `pass` / `APPROVE` | `ai-review-pass` | Ready for the human gate |
| `APPROVE WITH CORRECTIONS` | stays `ai-review-rework` until the CSV is applied | Short verify-only pass on the CSV rows, then `ai-review-pass`. Verify does **not** count toward the rework cap |
| `rework` / `RESEARCH REQUIRED` | `ai-review-rework` | Devin reworks; counts toward the **2-round** cap |
| `REJECT` (reviewer — untrustworthy research) | `ai-review-rework` | Rerun the stage; the idea stays alive; counts as one round. A second `REJECT` on the same stage escalates |
| S3.13 `REJECT` (bad idea) | n/a | Kill the idea; record it in `backlog.md` — **not** the same as a reviewer `REJECT` |

## Rework cap

- Two rework cycles on the same problem is the cap (same rule as **AppsIndie Team
  Rules**).
- The third cycle escalates via the **escalation** skill: the choice, the
  recommendation, the default if silent, the deadline, the owner.
- `critical` findings block the gate. A `high` finding deferred needs human approval —
  raise it as an exception, do not defer it silently. Align with **AppsIndie Security
  Trigger Policy** when security-triggered.

## Fallback when the reviewer does not run

If a fire fails, returns no session, or produces no verdict within 30 minutes:

1. Record the failure on the PR, with the fire response or the session URL.
2. Set `last_review.verdict` to `no-verdict` in `FACTORY_STATE.json`.
3. Request a human reviewer and raise an exception naming what is blocked.

**Do not leave the PR hanging** waiting for a reviewer that will not arrive, and do not
proceed as though a missing verdict were a pass.

## Scope

**Every PR type is reviewed**, including `ai-product-shaping` and `ai-product-research`.
Documents are reviewable; the old Copilot-era exemption for shaping docs does not apply.

## Related

- **AppsIndie Review Routine Registry** — URLs, secrets, and the routine prompt
  requirements (a routine whose prompt ignores the fire payload reviews nothing)
- **AppsIndie PR Labeling and Reviewer Convention** — the label taxonomy
- **AppsIndie Factory State Contract** — where the verdict is recorded
- `.agents/skills/escalation/` — how the third round leaves the loop
- Research review checklist: `.agents/skills/opportunity-research/assets/opportunity-research-v5.md` (`# REVIEW CHECKPOINT`)
