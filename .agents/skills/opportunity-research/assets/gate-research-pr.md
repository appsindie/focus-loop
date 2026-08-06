# Gate 0 — Research PR (Approve Opportunity)

Use this body for the Stage 3 Research PR.
Label: `devin` + `ai-product-research`. Claude review required before human sign-off.

## Idea

- **idea_id**:
- **idea_name**:
- **niche_id**:
- **platform**:
- **S3.13 decision**: `VALIDATE NOW` | `VALIDATE AFTER EVIDENCE GAP IS CLOSED` | `HOLD FOR PORTFOLIO LATER` | `REJECT`

## Final Decision JSON

```json
{}
```

Paste the complete S3.13 output JSON above.

## Economics (Base case) — monthly metrics

Copy from `scoring-output.json` → `economics.month_snapshots`.

| Metric | Month 9 | Month 12 |
| --- | ---: | ---: |
| MAU | | |
| Ad ARPU | | |
| Variable Contribution per MAU | | |
| Net Monthly Contribution | | |

## Economics — scalars (not monthly)

These do **not** change by month. One value each from `scoring-output.json` → `economics`.

| Metric | Value |
| --- | ---: |
| Cash break-even MAU | |
| Build weeks | |
| Validation weeks | |
| Monthly contribution per build-week (Base Month-12 Net) | |
| Twelve-month contribution per build-week | |
| `month_9_net_contribution_at_least_2000` | true / false |
| `meets_numeric_target_month_9` (Net≥$2k **and** build≤8) | true / false |

## Scenarios (Month-12 MAU × multiplier; retention unchanged)

| Scenario | MAU multiplier | MAU | Net Monthly Contribution |
| --- | ---: | ---: | ---: |
| Conservative | | | |
| Base | 1.0 | | |
| Optimistic | | | |

All figures must match committed `scoring-output.json` produced by:

```sh
python scripts/scoring.py inputs.json
# reviewer: re-run and diff scoring-output.json
```

## Machine-readable artifacts in this PR

- [ ] `inputs.json` committed (see `inputs.example.json` for schema)
- [ ] `scoring-output.json` committed (report tables are a presentation of this file)
- [ ] `python scripts/scoring.py --selftest` passed locally

## Open unknowns still alive

List every remaining `[UNKNOWN]` and `[LOW-CONFIDENCE]` tag. Required for signature box 2.

-

## Claude review

- Reviewer verdict: `APPROVE` | `APPROVE WITH CORRECTIONS` | `RESEARCH REQUIRED` | `REJECT`
- Rework round count:
- Corrections CSV applied and re-verified: yes / n/a

---

## Human signatures (two separate acts)

These are different decisions. Do not collapse them into one tick.

### 1. Verdict is trustworthy

I confirm the Claude reviewer ran the material checks (evidence tags, arithmetic via re-running `scoring.py`, URL spot check) and I accept this research as usable.

- Sign: __________________ Date: __________

### 2. Grant portfolio slot

I accept spending ≤8 build-weeks on this idea under the Base-case economics above.

**Living unknowns I am accepting** (copy from section above; must not be empty if any exist, write `none` only if truly none):

-

- Sign: __________________ Date: __________
- Decision recorded: `VALIDATE NOW` | other (do not grant slot)
