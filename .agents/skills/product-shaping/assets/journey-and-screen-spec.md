# <Product> — Product Spec (journey & screen level)

Concept, scope cuts, phases, business acceptance criteria and success metrics live in `PRODUCT_CONCEPT.md` and are **not repeated here**.
Design system and UI/UX standards: `DESIGN.md`. Design review findings: `DESIGN_REVIEW.md`.

Normative language: **SHALL** = mandatory. Anything not stated as a rule is an implementation decision.

## Document control

- Document ID / Version / Status / Owner / Last updated (UTC)
- Change history table: version, date, change summary.

## Spec contract (how this document is meant to be used)

- Fixes **outcomes, rules and constraints** — not implementation. Layout, components, data shapes and API design are the engineer's call.
- Every screen SHALL meet the state and accessibility baseline in `DESIGN.md`; it is not repeated per screen.
- **Push-back rule**: if implementation shows a rule is wrong, missing, or beaten by a better solution, the implementer SHALL raise it and update this spec in the same PR. Silently following a rule known to be wrong is a defect, not compliance.
- Undecided things go to *Open questions*; they are never invented here.

## Experience principles (apply to every journey)

<3-6 product-wide invariants, e.g. no silent automation failure; a critical field is never blank; "nothing to do" is worded as success.>

---

# Part 1 — Journey specs

## <J-xx> — <journey name> · <phase>

**Value** — Pain: <what hurts today>. Gain: <what the actor gets>. North-star: <which metric and why>.

**Entry (external navigation)**
- <link / push / email / deep link / default surface / hand-off from another journey>

**Exit**
- Success: <end state, and which journey it hands off to>
- Alternate: <legitimate non-happy ending>
- Failure: <what the actor sees, who gets the exception>

**Internal navigation (happy path)**

```
<S-x.1 screen> → <S-x.2 screen> → <S-x.3 screen>
   └─ <branch> → <screen>
```

**Journey rules**
- R1: <SHALL statement>
- R2: ...

**Variants / failure modes**
- <variant or failure> → <expected behaviour>

**Screens**: <S-x.1, S-x.2 …>

*(Optional, for high-risk journeys — specification by example)*
- Given <context> / When <event> / Then <observable outcome on each surface>

---

# Part 2 — Screen specs

## <S-x.1> — <screen name>

- **Value / intent**: <the one thing this screen removes or enables>
- **Entry**: <where the actor arrives from>
- **Content & data**: <blocks and the data each needs>
- **Primary action**: <one>, plus secondary/destructive actions
- **Rules**: <screen-specific SHALL statements; reference journey rules instead of copying them>
- **Metric impact**: <which north-star metric / guard-rail / acceptance criterion this screen moves, and how — or "supporting" if it moves none>
- **Surface**: <phone / phone + wide, and who uses the wide one>
- **Design**: <image path> · <design-tool screen id> · <prototype/HTML export> · <flow board>
- *(metric-critical screens only)* **Variant chosen**: <A or B, one line of why> · rejected variant and the full comparison live in `DESIGN_REVIEW.md`

---

# Part 3 — Constraints, dependencies, risks

## Non-functional requirements (derived from the north-star metrics)

| NFR | Rule | Derived from |
| --- | --- | --- |

Deferred (open questions, not invented): <targets nobody has decided yet>.

## Journey dependencies (build order hint, not a task list)

```
<journey> ─> <journey that cannot exist before it>
```
- <why the dependency exists, and which journeys must ship together to avoid shipping a silent failure mode>

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |

## Open questions

1. <question — and the current working default, if any>

## Review & signoff

- Product/scope: <who, status>
- Design: <who, status>
