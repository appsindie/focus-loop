---
name: architecture
description: Define architecture decisions, boundaries and contracts with ADR-backed rationale.
---

## Purpose
Define architecture decisions, boundaries and contracts with ADR-backed rationale.

## When to use
- High-level architecture for a new product or major change.
- Detailed design per capability/bounded context.

## Outputs
- `docs/architecture/ARC42_SYSTEM_LIVE.md`
- ADRs under `docs/architecture/ADR/`
- `docs/architecture/LIVE_LLD.md` or per-context LLD

## Operating rules
- Capture tradeoffs and rejected options; keep interfaces and boundaries explicit.
- Every architecture pack carries at least two views and one comparison:
  - **Current state** — what exists today (or the first shippable shape for greenfield).
  - **Target state** — shape at planned scale and why it differs.
  - **Transition** — ordered path between them, trigger signal, and day-one invariants that keep the move cheap.
- Record genuinely open decisions as ADRs comparing options on the forces (team size, latency, failure isolation, cost, operational load), including what would flip the decision.
- Separate irreversible decisions (data ownership, tenancy, identity, event contracts) from reversible ones; spend review time on the irreversible ones.
- Cover failure paths and idempotency/retry/audit for operations with external side effects.

## Templates

| Use | Path |
| --- | --- |
| Architecture pack (ARC42-lite) | `.agents/skills/architecture/assets/architecture-arc42.md` |
| Current / target / transition views | `.agents/skills/architecture/assets/architecture-states.md` |
| ADR skeleton | `.agents/skills/architecture/assets/adr.md` |
| LLD | `.agents/skills/architecture/assets/lld.md` |
