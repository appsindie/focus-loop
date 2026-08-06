# <Product> — Product Concept (high-level sketch), v<n>

High level only: why each channel exists, pain/gain, journey -> screen map, what is cut, phases, business acceptance criteria, success metrics.
Journey and screen detail lives in `PRODUCT_SPEC_LIVE.md`.

Sources: <requester decisions, existing systems, research>.

## North-star metric(s)

1. `<metric>` — <direction and why it is the real lever>.
2. `<metric>` — <second metric only if it is the other side of the same lever>.

Guard-rail: <what must not get worse while the north-star improves, and how it is measured>.
Rule: every journey and every screen SHALL improve at least one north-star metric — otherwise it is cut.

## 1. Channels — objective, pain/gain

| Channel | Persona | Why it exists | Pain today | Expected gain |
| --- | --- | --- | --- | --- |
| <app/surface> | <persona> | <objective> | <pain> | <gain> |

**Cut now** (not enough pain/gain for the early phases): <explicit list — this is a standing decision>.

## 2. Journeys -> screens (each screen relieves one pain)

### <Channel A>
| Journey | Screens | Pain it relieves |
| --- | --- | --- |
| <J-x1> | <screen chain> | <pain> |
| *(cut)* | <screen> | <why it does not earn its place> |

## 3. Phases

| Phase | Goal | Content | Exit condition |
| --- | --- | --- | --- |
| Pilot | <prove the lever works> | <journeys> | <measurable exit> |
| MVP | <close the loop> | <journeys> | <measurable exit> |
| MMP | <ready to sell> | <hardening> | <measurable exit> |

Order is a dependency constraint, not a schedule, unless a deadline was actually given.

## 4. Journey x persona map (priority)

| Journey | <Persona A> | <Persona B> | Priority |
| --- | --- | --- | --- |

## 5. Acceptance criteria (business) & success metrics

| Journey | Acceptance criteria | Success metric |
| --- | --- | --- |

## 6. Design & brand

- Design system / brand source: <link>
- Design tool project (one per product): <id>
- Screens done / still missing: <list>
