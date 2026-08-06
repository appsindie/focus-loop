# Exception — <one-line statement of the choice>

Post as a PR comment (**the record**), apply `human-decision`, add the matching entry to
`FACTORY_STATE.json` → `open_exceptions` (**the block**), and notify the owner in
`#appsindie-factory` (**the doorbell**). All three — see the `escalation` skill.

One exception per decision. If you are writing "and also", start a second one.

---

**ID**: `E<n>` · **Gate**: <0–4> · **Severity**: `low | medium | high | critical`
**Owner**: <name> · **Deadline**: <YYYY-MM-DD>
**Blocking**: yes / no · **Default if you say nothing**: `proceed` | `block`

## Situation

Two sentences. What was found, and why it cannot be resolved without you.

## Options

- **A** — <action>. Consequence: <what follows>.
- **B** — <action>. Consequence: <what follows>.

## Recommendation

**<A or B>**, because <reason grounded in evidence, not preference>.

## If you say nothing

By <deadline>, <the default> takes effect and this is recorded as decided by default.

> On Gate 0 and Gate 3 the default is always `block`. Silence never spends a portfolio
> slot and never ships to production. See the `escalation` skill.

## Evidence

- <path or command output>
- <PR link, review session URL, check name>

---

## Decision

- Chosen: **A / B / other** — <if other, state it>
- Decided by: __________________ Date: __________
- Applied by default: yes / no — <if yes, name the deadline that passed>

On resolution: remove the entry from `open_exceptions`, and reply in the Slack thread.
A thread that just stops reads as unresolved forever.
