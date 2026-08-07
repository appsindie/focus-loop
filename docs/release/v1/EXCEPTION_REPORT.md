# Release Readiness — Exception Report v1.0.0

## Verdict

**not ready** — v1.0.0, surfaces ios/android

- Checks run: 20 — passed: 4, failed-and-remediated: 0, exceptions: 15
- Gate 3 decision needed: **yes**

## Exceptions

### 1. Native device SIT not yet performed

- **Situation**: E2E verification was run on the Expo web preview (`docs/qa/v1-e2e-test-report.md`). The web preview has known mouse/keyboard interaction regressions that do not affect native builds. No iOS or Android native SIT build has been executed.
- **Options**: A — run `eas build` and native QA before Gate 3. B — accept web-preview functional evidence and move to internal TestFlight/Play Console testing after Gate 3.
- **Recommendation**: A.
- **Default if you say nothing**: blocks Gate 3.

### 2. Production AdMob / Firebase IDs are still test values

- **Situation**: `app.json` and `src/features/ads/adsConfig.ts` use Google's test AdMob App IDs and ad unit IDs. Firebase project is configured for the correct package/bundle.
- **Options**: A — provide production AdMob App IDs and ad unit IDs before store submission. B — keep test IDs for the next QA build and replace them before release.
- **Recommendation**: B for QA, A before store submission.
- **Default if you say nothing**: blocks production rollout; QA build can still proceed.

### 3. Staged-rollout thresholds and alerts are not wired

- **Situation**: `docs/release/SLO_AND_ALERTING.md` is seeded with mobile SLOs and placeholder thresholds, but no alerting backend, dashboards, or test-fired alerts exist.
- **Options**: A — wire Crashlytics/Expo analytics alerts and define numeric thresholds before Gate 3. B — seed thresholds now and wire alerts after first internal release.
- **Recommendation**: A before any production rollout; B is acceptable for an internal TestFlight/closed beta.
- **Default if you say nothing**: blocks production rollout.

### 4. Store compliance artifacts not completed

- **Situation**: Privacy policy, data safety form, age rating, and app-store declarations for ATT, notifications, and ads have not been drafted or verified.
- **Options**: A — complete store declarations before Gate 3. B — proceed to internal testing while store copy is prepared in parallel.
- **Recommendation**: B for internal testing, A before public store submission.
- **Default if you say nothing**: blocks public store submission; internal testing still allowed.

### 5. Operating runbook and escalation path are seeded, not operational

- **Situation**: `docs/release/RUNBOOK_mobile.md` exists as a template. Rollback owner, escalation contacts, and literal commands are placeholders.
- **Options**: A — fill the runbook and name an owner before Gate 3. B — accept seeded runbook for first internal release and finalize before production.
- **Recommendation**: A before production; B acceptable for internal testing.
- **Default if you say nothing**: blocks production rollout.

## What ships

- Focus Loop v1.0.0: Pomodoro timer with 15/25/45-minute presets, session history, streak, local notifications, and AdMob banner + interstitial ads.
- Rollout plan: 5% → 25% → 100% on TestFlight / Play Console internal testing tracks, halting on thresholds in `SLO_AND_ALERTING.md` once they are wired.
- Rollback: mobile binary cannot be recalled; rollout is halted and a hotfix is submitted. Owner and command to be recorded in `RUNBOOK_mobile.md`.

## Accepted risks carried into production

| Risk                                                           | Accepted by | Date | Revisit at                |
| -------------------------------------------------------------- | ----------- | ---- | ------------------------- |
| Ads SDK collecting device/usage data per Google/Apple policies | TBD         |      | Before store submission   |
| Test AdMob IDs in QA builds                                    | TBD         |      | Before production rollout |

## After the release

- Day 7 / day 14 north-star comparison scheduled for: TBD
