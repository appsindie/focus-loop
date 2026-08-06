# <Product> — current, target and transition views

A section of `docs/architecture/ARC42_SYSTEM_LIVE.md`, not a separate document. It exists so a reviewer can see what we are building *now*, what we are building *towards*, and what would make us move.

## Current state (`<pilot / today>`)

```
<deployment diagram in text: process boundaries, datastores, external systems>
```

- Why this shape: `<the forces that make it right today — team size, unknown load, speed of learning>`.
- What it deliberately does not do: `<scale/isolation/latency properties it does not have yet>`.
- Where it hurts first: `<the boundary expected to break earliest, and the signal that shows it>`.

## Target state (`<scale point, e.g. MMP / n tenants>`)

```
<deployment diagram in text>
```

- What changed vs today and why: `<the specific force each change answers>`.
- What deliberately did **not** change: `<what stays in the monolith/managed service forever, and why splitting it would be waste>`.

## Transition

| Step | Move | Trigger (signal, not date) | Prerequisite | Reversible? |
| --- | --- | --- | --- | --- |
| 1 | `<extract context X>` | `<measured signal>` | `<contract, event, data ownership already clean>` | `<yes/no>` |

**Day-one invariants that make the transition cheap** — these are decided now and are expensive to change later:
- Data ownership is exclusive per context; no cross-context table reads.
- Every context is reached through its published contract, in-process today, over the network tomorrow.
- External side effects are idempotent and audited, so retries survive a move.
- `<tenancy model / identity / event schema versioning>`.

**Irreversible vs reversible decisions**

| Decision | Irreversible? | Consequence if wrong |
| --- | --- | --- |
| `<data ownership / tenancy / identity / event contract>` | yes | `<migration cost>` |
| `<runtime, hosting, framework, queue technology>` | no | `<swap cost>` |

## Alternatives considered

| Option | Fits when | Rejected because | Would win if |
| --- | --- | --- | --- |
| `<option A>` | `<...>` | `<...>` | `<the condition that would flip the decision>` |

Recorded as ADR `<id>`.
