# Release Readiness — Exception Report v1.0.0

## Verdict

**not ready** — v1.0.0, surfaces ios/android

- Checks run: 26 — passed: 7, failed-and-remediated: 0, manual: 0, exceptions: 19
- Gate 3 decision needed: **yes**

## Exception summary

| ID    | Title                                                            | Rows covered                                              | Owner                       | Deadline   | Default |
| ----- | ---------------------------------------------------------------- | --------------------------------------------------------- | --------------------------- | ---------- | ------- |
| RR-01 | Native device SIT not run                                        | SIT regression                                            | justin.nguyen@appsindie.com | 2026-08-15 | block   |
| RR-02 | Failure-mode cases not verified                                  | Failure-mode cases                                        | justin.nguyen@appsindie.com | 2026-08-15 | block   |
| RR-03 | Production AdMob / Firebase IDs are test values                  | —                                                         | justin.nguyen@appsindie.com | 2026-08-18 | block   |
| RR-04 | North-star events and dashboards not wired                       | North-star events, Dashboards                             | justin.nguyen@appsindie.com | 2026-08-20 | block   |
| RR-05 | Alerts, rollout thresholds and rollback triggers not operational | Alerts wired, Rollout halt thresholds, Trigger conditions | justin.nguyen@appsindie.com | 2026-08-20 | block   |
| RR-06 | Rollback command and owner not finalized                         | Rollback command, Rollback owner                          | justin.nguyen@appsindie.com | 2026-08-18 | block   |
| RR-07 | Rollback not rehearsed                                           | Rollback rehearsed                                        | justin.nguyen@appsindie.com | 2026-08-20 | block   |
| RR-08 | Runbook and escalation path not operational                      | Runbook, Escalation path                                  | justin.nguyen@appsindie.com | 2026-08-20 | block   |
| RR-09 | Store agreements not verified                                    | Store agreements                                          | justin.nguyen@appsindie.com | 2026-08-22 | block   |
| RR-10 | Store declarations not completed                                 | Declarations                                              | justin.nguyen@appsindie.com | 2026-08-22 | block   |
| RR-11 | Internal testing build not produced                              | Internal testing                                          | justin.nguyen@appsindie.com | 2026-08-18 | block   |
| RR-12 | Privacy / data-safety declaration not completed                  | Privacy delta                                             | justin.nguyen@appsindie.com | 2026-08-22 | block   |
| RR-13 | Release record not completed                                     | Release notes, Changelog, Traceability                    | justin.nguyen@appsindie.com | 2026-08-12 | block   |

## Exceptions

### RR-01. Native device SIT not run

- **Situation**: E2E verification was run on the Expo web preview (`docs/qa/v1-e2e-test-report.md`). The web preview has known mouse/keyboard interaction regressions that do not affect native builds. No iOS or Android native SIT build has been executed.
- **Options**: A — run `eas build` plus native QA before Gate 3. B — accept web-preview functional evidence and move to TestFlight/Play Console internal testing after Gate 3.
- **Recommendation**: A.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-15

### RR-02. Failure-mode cases not verified

- **Situation**: Cancel regression passed on web preview. Ad load-failure graceful handling, notification permission denial, and offline edge cases have not been exercised on a device.
- **Options**: A — add and run failure-mode cases on native SIT before Gate 3. B — defer to internal testing.
- **Recommendation**: A.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-15

### RR-03. Production AdMob / Firebase IDs are test values

- **Situation**: `app.json` and `src/features/ads/adsConfig.ts` use Google's test AdMob App IDs and ad unit IDs. Firebase project is configured for the correct package/bundle.
- **Options**: A — provide production AdMob App IDs and ad unit IDs before store submission. B — keep test IDs for the next QA build and replace them before release.
- **Recommendation**: B for QA, A before store submission.
- **Default if you say nothing**: blocks production rollout; QA build can still proceed.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-18

### RR-04. North-star events and dashboards not wired

- **Situation**: No analytics events or dashboards are wired for the mobile app. This is a deliberate bundle of the two analytics observability rows that share the same remediation path.
- **Options**: A — wire Firebase Analytics events and a dashboard before Gate 3. B — defer to post-launch growth phase.
- **Recommendation**: A before any paid/marketing spend; B acceptable for an organic initial release.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-20

### RR-05. Alerts, rollout thresholds and rollback triggers not operational

- **Situation**: `docs/release/SLO_AND_ALERTING.md` is seeded with mobile SLOs and placeholder thresholds, but no alert backend is connected, no alerts have been test-fired, and rollback trigger conditions are not wired to an alert. This is a deliberate bundle because all three rows share the same remediation: define numeric thresholds and wire them to Crashlytics / AdMob / Play Console alerts.
- **Options**: A — wire alerts and test-fire them before Gate 3. B — seed thresholds now and wire alerts after first internal release.
- **Recommendation**: A before production rollout; B acceptable for internal testing.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-20

### RR-06. Rollback command and owner not finalized

- **Situation**: Mobile binaries cannot be rolled back from user devices. `RUNBOOK_mobile.md` states staged-rollout halt + hotfix but does not yet name a rollback owner or a literal hotfix command sequence.
- **Options**: A — name an owner and rehearse the hotfix command before Gate 3. B — finalize before production rollout and use internal testing to validate the command.
- **Recommendation**: A before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-18

### RR-07. Rollback not rehearsed

- **Situation**: No native SIT build exists, so the hotfix/rollback flow has not been rehearsed for this release.
- **Options**: A — build the production profile and rehearse the hotfix pipeline before Gate 3. B — rehearse during internal testing before 100% rollout.
- **Recommendation**: B is acceptable for first internal release; A required before 100% production rollout.
- **Default if you say nothing**: blocks 100% rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-20

### RR-08. Runbook and escalation path not operational

- **Situation**: `docs/release/RUNBOOK_mobile.md` is a seeded template. Operating procedures, diagnose steps, and escalation contacts are placeholders. This is a deliberate bundle of the two support rows that share the same remediation: fill the runbook and define escalation routes.
- **Options**: A — complete runbook and escalation path before Gate 3. B — seed now and finalize before production rollout.
- **Recommendation**: B for internal testing; A for production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-20

### RR-09. Store agreements not verified

- **Situation**: Required Apple / Google developer agreements, tax/banking, and paid-app agreements have not been verified by a human.
- **Options**: A — verify portal status before Gate 3. B — verify before submitting to store review.
- **Recommendation**: B is acceptable; A reduces last-minute blocking risk.
- **Default if you say nothing**: blocks store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-22

### RR-10. Store declarations not completed

- **Situation**: Privacy policy, data safety form, age rating, and app-store permission/ATT/ads declarations have not been drafted.
- **Options**: A — complete declarations before Gate 3. B — complete before public store submission and use internal testing without them.
- **Recommendation**: B for internal testing; A for public store submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-22

### RR-11. Internal testing build not produced

- **Situation**: No EAS build has been produced for iOS or Android.
- **Options**: A — run `eas build` for internal testing before Gate 3. B — defer build until after Gate 3 and use it as the first SIT artifact.
- **Recommendation**: A.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-18

### RR-12. Privacy / data-safety declaration not completed

- **Situation**: The app's actual data collection (local AsyncStorage, AdMob/ATT, Firebase) has not been mapped to a store data-safety declaration.
- **Options**: A — publish privacy policy and complete data-safety form before Gate 3. B — complete before public store submission.
- **Recommendation**: B for internal testing; A for public store submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-22

### RR-13. Release record not completed

- **Situation**: `RELEASE_NOTES.md`, `CHANGELOG.md`, and issue-traceability references do not exist for v1. This is a deliberate bundle of the three release-record rows that share the same remediation: write release notes, changelog, and link shaping/build issues.
- **Options**: A — complete release record before Gate 3. B — complete before store submission.
- **Recommendation**: A before Gate 3 so the human sign-off has a record of what ships.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-08-12

## What ships

- Focus Loop v1.0.0: Pomodoro timer with 15/25/45-minute presets, session history, streak, local notifications, and AdMob banner + interstitial ads.
- Rollout plan: 5% → 25% → 100% on TestFlight / Play Console internal testing tracks, halting on thresholds in `docs/release/SLO_AND_ALERTING.md` once wired.
- Rollback: mobile binary cannot be recalled; rollout is halted and a hotfix is submitted. Owner and command to be recorded in `RUNBOOK_mobile.md`.

## Accepted risks carried into production

| Risk                                                             | Accepted by                 | Date       | Revisit at                |
| ---------------------------------------------------------------- | --------------------------- | ---------- | ------------------------- |
| AdMob SDK collecting device/usage data per Google/Apple policies | justin.nguyen@appsindie.com | 2026-08-08 | Before store submission   |
| Test AdMob IDs in QA builds                                      | justin.nguyen@appsindie.com | 2026-08-08 | Before production rollout |

## After the release

- Day 7 / day 14 north-star comparison scheduled for: TBD
