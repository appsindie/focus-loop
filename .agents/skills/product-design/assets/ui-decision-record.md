# UI decision record — <product>

Goes into `docs/product/DESIGN_REVIEW.md` alongside the per-screen findings. It answers three questions a reviewer will ask: *which screens deserve extra design effort*, *why this design and not the other one*, and *is every element on the screen earning its place*.

## 1. Metric-impact matrix (which screens are metric-critical)

| Screen | Metric it moves | Mechanism | Critical? |
| --- | --- | --- | --- |
| `<S-x.y name>` | `<north-star / guard-rail / acceptance criterion>` | `<the causal story: what the user or operator does here that changes the number>` | yes / no |

Rule: only screens marked *yes* get alternative variants, an element audit and (where justified) a wide-surface variant. Everything else gets one design and the standard checklist.

## 2. Variant comparison (per metric-critical screen)

### `<S-x.y>` — `<screen name>`

**Intent**: `<the one thing this screen must achieve>` · **Metric**: `<metric>`

| | Variant A — `<hypothesis in five words>` | Variant B — `<competing hypothesis>` |
| --- | --- | --- |
| Bet | `<what it assumes about the user>` | `<...>` |
| Mandatory fields | `<n>` | `<n>` |
| Taps to done | `<n>` | `<n>` |
| Screens before the user sees value | `<n>` | `<n>` |
| Points needing a human | `<n and which>` | `<...>` |
| Recovery when the user is wrong | `<cost>` | `<...>` |
| Risk | `<what breaks if the bet is wrong>` | `<...>` |
| Artifacts | `<image / export ids>` | `<...>` |

**Chosen**: `<A or B>` — `<why, in terms of the metric, not taste>`.
**Kept as fallback**: `<the other one>` — re-run it if `<metric>` misses `<target>` after `<window>`.

## 3. Element minimisation audit (per metric-critical screen)

| Element / field | Job it does for the intent | Verdict |
| --- | --- | --- |
| `<field>` | `<job>` | keep / derive / defer / behind disclosure / **removed** |

Removed and why: `<list>`.
Explicitly kept although it costs a step: `<element>` — `<the operational or legal reason>`.
Check: nothing removed here silently became the user's or support's problem.

## 4. Surface decision

| Screen | Phone | Tablet / wide | Why |
| --- | --- | --- | --- |
| `<S-x.y>` | yes | `<yes/no>` | `<who actually uses that surface>` |

## 5. Open items

- `<what is still undecided, and the working default>`
