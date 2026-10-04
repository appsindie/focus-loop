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

No custom dashboard for v1 (RR-15, option B accepted): each SLI is watched in
its vendor console. Links to check during rollout:

| Surface | Console entry | Shows |
| ------- | ------------- | ----- |
| mobile (iOS)     | App Store Connect → app 6818991496 → Metrics/Crashes | crash-free sessions, adoption |
| mobile (Android) | Play Console → Android Vitals → overview | crash rate, ANR rate (automatic for AAB installs — no SDK needed) |
| mobile (ads)     | AdMob console → app reports | ad requests, fill/failure rate, revenue |

## Escalation

No in-app crash SDK in v1, so alerting is console-native + a manual check
cadence (RR-16/RR-17, option B):

| Alert                          | Severity | Route                                                        | Wakes a human |
| ------------------------------ | -------- | ------------------------------------------------------------ | ------------- |
| Crash-free sessions SLO breach | high     | Play Vitals / ASC Metrics checked daily by owner during rollout; Play Console auto-emails crash spikes to the account owner | yes (manual + auto email) |
| ANR rate SLO breach            | high     | Same daily Vitals check                                      | yes (manual)  |
| Ad load failure rate spike     | medium   | AdMob console daily check                                    | no            |

Manual-check cadence: owner checks the three consoles once a day while any
staged rollout is running (RR-16 option B). Wiring Crashlytics/Slack alerts is
deferred until an analytics SDK ships (RR-04).
