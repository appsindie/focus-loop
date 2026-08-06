# SLOs, Alerts and Rollout Thresholds

Instantiate as `docs/release/SLO_AND_ALERTING.md` — per product, carried across releases, not per release.

This file is the source of the numbers the progressive rollout halts on. The `release` skill's `5% → 25% → 100%` rule and the "hold on error/crash threshold breach" instruction are meaningless without it — if a surface being rolled out has no thresholds here, readiness fails.

Rule: **every SLO has exactly one alert, and every alert has been test-fired at least once.** An SLO with no alert behind it escalates to the human.

## Service level objectives

One table per surface. Keep the count small — an SLO you would not roll back for is not an SLO.

### API

| SLI | Definition (how it is measured) | SLO target | Window | Alert | Test-fired |
|---|---|---|---|---|---|
| Availability | Successful responses ÷ total, excluding 4xx | | 30d rolling | | |
| Latency | p95 response time on the primary journey endpoint | | 30d rolling | | |
| Correctness | Failed background jobs ÷ total | | 30d rolling | | |

### Web

| SLI | Definition | SLO target | Window | Alert | Test-fired |
|---|---|---|---|---|---|
| Page availability | Successful loads ÷ attempts | | 30d rolling | | |
| Client error rate | Unhandled JS errors ÷ sessions | | 30d rolling | | |

### Mobile (iOS / Android)

| SLI | Definition | SLO target | Window | Alert | Test-fired |
|---|---|---|---|---|---|
| Crash-free sessions | Sessions without a fatal ÷ total | | 30d rolling | | |
| ANR rate (Android) | ANRs ÷ sessions | | 30d rolling | | |

## Error budget

- **Budget** = 1 − SLO target over the window.
- **Burn policy**: state what happens as budget is consumed — e.g. at 50% burn, feature rollout pauses; at 100%, only reliability work ships until the window resets.
- Budget consumed this window:

## Rollout halt thresholds

These are the numbers the rollout step reads. They are tighter than the SLOs by design: the rollout window is short, so a breach must be caught before it spends the budget. **A breached threshold rolls back; it does not "get monitored".**

| Surface | Stage | Error / crash threshold | Latency threshold | Observation window | Action on breach |
|---|---|---|---|---|---|
| api | 5% | | | | roll back |
| api | 25% | | | | roll back |
| api | 100% | | | | roll back |
| web | 5% / 25% / 100% | | | | roll back |
| mobile | staged rollout % | | n/a | | halt rollout |

Baseline for comparison: the same metrics from the previous release over an equivalent window. A threshold expressed only as "no regression" is not machine-checkable — state the number.

## Dashboards

| Surface | Dashboard | Shows |
|---|---|---|
| | | |

## Escalation

Which alerts wake a human, and which only file. For a solo operator, keep the waking set to the ones a rollback would fix.

| Alert | Severity | Route | Wakes a human |
|---|---|---|---|
| | | | |
