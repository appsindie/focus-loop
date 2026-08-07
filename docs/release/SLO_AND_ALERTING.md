# SLOs, Alerts and Rollout Thresholds — Focus Loop

## Service level objectives

### Mobile (iOS / Android)

| SLI                  | Definition (how it is measured)                 | SLO target | Window      | Alert                            | Test-fired |
| -------------------- | ----------------------------------------------- | ---------- | ----------- | -------------------------------- | ---------- |
| Crash-free sessions  | Sessions without a fatal crash ÷ total sessions | 99.9%      | 30d rolling | Crashlytics alert                | not yet    |
| ANR rate (Android)   | ANRs ÷ total sessions                           | < 0.3%     | 30d rolling | Crashlytics / Play Console alert | not yet    |
| Ad load failure rate | Failed ad loads ÷ total ad requests             | < 5%       | 30d rolling | AdMob console alert              | not yet    |

## Error budget

- **Budget** = 1 − SLO target over the window.
- **Burn policy**: At 50% error budget consumed, staged rollout pauses; at 100%, only reliability work ships until the window resets.
- **Budget consumed this window**: N/A — first release.

## Rollout halt thresholds

| Surface | Stage | Error / crash threshold          | Latency threshold | Observation window | Action on breach        |
| ------- | ----- | -------------------------------- | ----------------- | ------------------ | ----------------------- |
| mobile  | 5%    | crash-free < 99% or ANR > 0.5%   | n/a               | 24h                | halt rollout            |
| mobile  | 25%   | crash-free < 99.5% or ANR > 0.4% | n/a               | 24h                | halt rollout            |
| mobile  | 100%  | crash-free < 99.9% or ANR > 0.3% | n/a               | 24h                | halt rollout and hotfix |

## Dashboards

| Surface | Dashboard | Shows                                           |
| ------- | --------- | ----------------------------------------------- |
| mobile  | TBD       | crash-free sessions, ANR rate, ad load failures |

## Escalation

| Alert                          | Severity | Route | Wakes a human |
| ------------------------------ | -------- | ----- | ------------- |
| Crash-free sessions SLO breach | high     | TBD   | yes           |
| ANR rate SLO breach            | high     | TBD   | yes           |
| Ad load failure rate spike     | medium   | TBD   | no            |
