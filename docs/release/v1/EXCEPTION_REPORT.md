# Release Readiness — Exception Report v1.0.0

## Verdict

**not ready** — v1.0.0, surfaces ios/android

- Re-audited 2026-10-04 at release/1.0.0 head. Checks run: 26 — passed: 9, waived: 3 (RR-01, RR-02 sponsor waiver + the third-party-sandbox row folded under it), failed-and-remediated: 0, manual: 0, exception rows: 14. Open exceptions: 15 (RR-04..RR-12, RR-14..RR-19). RR-13 resolved (release notes + changelog). RR-11 in-flight.
- Gate 2 status: **open — human signature pending on this PR** (sponsor waived SIT verbally 2026-10-04; the waiver is recorded but the gate stays open until the owner signs here).
- Gate 3 decision needed: **yes**

## Exception summary

| ID    | Title                                                             | Rows covered            | Owner                       | Deadline   | Default |
| ----- | ----------------------------------------------------------------- | ----------------------- | --------------------------- | ---------- | ------- |
| RR-01 | Native device SIT not run — **waived 2026-10-04**                 | SIT regression          | justin.nguyen@appsindie.com | —          | waived  |
| RR-02 | Failure-mode cases not verified — **waived 2026-10-04**           | Failure-mode cases      | justin.nguyen@appsindie.com | —          | waived  |
| RR-04 | North-star analytics events not wired                             | North-star events       | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-05 | Alerts not wired or test-fired                                    | Alerts wired            | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-06 | Rollback command not finalized (owner named)                      | Rollback command        | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-07 | Rollback not rehearsed                                            | Rollback rehearsed      | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-08 | Runbook procedures still placeholders                             | Runbook                 | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-09 | Store agreements not verified                                     | Store agreements        | justin.nguyen@appsindie.com | 2026-10-06 | block   |
| RR-10 | Store declarations not completed                                  | Declarations            | justin.nguyen@appsindie.com | 2026-10-06 | block   |
| RR-11 | Internal testing build not produced — **in-flight 2026-10-04**    | Internal testing        | justin.nguyen@appsindie.com | 2026-10-06 | block   |
| RR-12 | Privacy / data-safety declaration not completed                   | Privacy delta           | justin.nguyen@appsindie.com | 2026-10-06 | block   |
| RR-13 | Release record — **resolved 2026-10-04**                          | Release notes, Changelog, Traceability | justin.nguyen@appsindie.com | — | done |
| RR-14 | EAS / portal credentials and console products not fully provisioned | Credentials           | justin.nguyen@appsindie.com | 2026-10-06 | block   |
| RR-15 | Dashboards not created                                            | Dashboards              | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-16 | Rollout halt thresholds not wired to alerts                       | Rollout halt thresholds | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-17 | Rollback trigger conditions not wired                             | Trigger conditions      | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-18 | Escalation path not defined                                       | Escalation path         | justin.nguyen@appsindie.com | 2026-10-11 | block   |
| RR-19 | SIT waiver re-test condition — device items untested               | (waiver condition)      | justin.nguyen@appsindie.com | 2026-10-11 | block   |

## Waiver records (closed exceptions)

### RR-01. Native device SIT not run — waived

- **Decision**: waive the pre-release native-device SIT cycle for v1.0.0.
- **Decided by**: justin.nguyen@appsindie.com, 2026-10-04, verbatim: "k sit, làm release luôn đi. app mới chưa có user mà sit gì men" (no users yet — SIT adds nothing pre-release).
- **Human signature**: pending — owner to sign on the release PR (`gate-signed` label or comment) so the record is human-authored.
- **Partial evidence retained**: iOS Simulator pass (iPhone 17, iOS 26, dev-client) — J1 first-launch + ATT prompt + display pick, J2 focus start/pause/end-early/save, Home (loop summary, weekly goal, live AdMob banner), Settings P20, Themes & sounds trial rows, Paywall P14 fallback prices. Three native build defects found and fixed in that pass (widget Info.plist, duplicate ActivityAttributes, expo-store-review `SceneGeometry` patch via patch-package).
- **Deliberately untested**: haptics, real push delivery, Live Activity on lock screen, IAP sandbox purchase, real device performance.
- **Re-test condition**: these items must be exercised during internal testing (TestFlight / Play internal) **before any production promotion**. Internal testing is the de-facto SIT for v1.
- **Owner**: justin.nguyen@appsindie.com

### RR-02. Failure-mode cases not verified — waived

- **Decision**: waive pre-release device failure-mode verification (same sponsor decision as RR-01).
- **Decided by**: justin.nguyen@appsindie.com, 2026-10-04 (same quote).
- **Partial evidence retained**: cancel regression passed on web preview; ATT denial verified on simulator ("Ask App Not to Track" → non-personalized banner still loads); store-product fetch failure degrades to fallback prices on the paywall.
- **Deliberately untested**: ad load-failure UI on device, notification permission denial flow, offline edge cases, IAP sandbox purchase failure paths.
- **Re-test condition**: exercise during internal testing before production promotion.
- **Owner**: justin.nguyen@appsindie.com

## Open exceptions

### RR-04. North-star analytics events not wired

- **Situation**: `apps/mobile/src/features/analytics/events.ts` exists as a thin hook but no analytics backend is connected, so north-star events (days-focused per week, retention) are not collected anywhere.
- **Options**: A — wire Firebase Analytics event export before Gate 3. B — defer to post-launch growth phase.
- **Recommendation**: A before any paid/marketing spend; B acceptable for an organic initial release.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-05. Alerts not wired or test-fired

- **Situation**: `docs/release/SLO_AND_ALERTING.md` defines SLOs (crash-free 99.9%, ANR <0.3%, ad-fail <5%) but no alert exists in Crashlytics / Play Console / AdMob, and none has been test-fired.
- **Options**: A — create alerts and test-fire them before Gate 3. B — wire alerts after the first internal-testing build ships.
- **Recommendation**: B — alerts need a live build to test-fire against; must be done before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-06. Rollback command not finalized (owner named)

- **Situation**: Rollback owner is named in `RUNBOOK_mobile.md` (justin.nguyen@appsindie.com). Mobile binaries cannot be recalled, so the rollback action is halt-rollout + hotfix; the halt step is written as console/API actions but has not been executed end-to-end.
- **Options**: A — rehearse the halt + hotfix sequence on the internal track before Gate 3. B — treat the first internal-test build as the rehearsal.
- **Recommendation**: B — the internal build is the natural rehearsal vehicle (see RR-07).
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-07. Rollback not rehearsed

- **Situation**: No EAS build exists yet, so the halt + hotfix flow has never been exercised.
- **Options**: A — rehearse during internal testing. B — full dress rehearsal before Gate 3.
- **Recommendation**: A — rehearse on the internal track during internal testing; required before 100% rollout.
- **Default if you say nothing**: blocks 100% rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before 100% rollout)

### RR-08. Runbook procedures still placeholders

- **Situation**: `docs/release/RUNBOOK_mobile.md` has owner, operate and diagnose rows, but the diagnose table and escalate routes are not yet validated against a real incident.
- **Options**: A — complete during internal testing with the first real signals. B — block Gate 3 until fully written.
- **Recommendation**: A — internal testing generates the real failure data the runbook needs; must be final before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-09. Store agreements not verified

- **Situation**: Apple / Google developer agreements, tax/banking and paid-app agreements have not been verified by a human on either portal.
- **Options**: A — verify before Gate 3. B — verify before store submission.
- **Recommendation**: B is acceptable; A removes a blocking surprise at submission time.
- **Default if you say nothing**: blocks store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before first submission)

### RR-10. Store declarations not completed

- **Situation**: Age rating, app-store permission/ATT/ads declarations not yet completed on either console. Legal pages exist at `appsindie.com/docs/legal/focus-loop/{privacy,tnc,disclaimer,licenses}` (appsindie-landing#5).
- **Options**: A — complete before Gate 3. B — complete before public store submission; internal testing does not require them.
- **Recommendation**: B for internal testing; A for public submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before public submission)

### RR-11. Internal testing build not produced

- **Situation**: No EAS build has been produced. **Progress 2026-10-04**: release pipeline wired (`.eas/workflows/release.yml` — `workflow_dispatch` only, no push trigger, so every build/submission is a separately confirmed go-ahead; `eas.json` `appVersionSource: remote` + `submit.internal` profile). First production build pending named confirmation.
- **Options**: A — run `eas build` production now (iOS first, then Android), submit to internal tracks. B — defer.
- **Recommendation**: A — the internal-testing build doubles as the SIT artifact under the RR-01/02 waiver; the items the waiver defers are tracked as blocking exception RR-19.
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06

### RR-12. Privacy / data-safety declaration not completed

- **Situation**: The app's actual data collection (local AsyncStorage, AdMob/ATT, Firebase Analytics if wired) has not been mapped to a store data-safety declaration.
- **Options**: A — complete before Gate 3. B — complete before public store submission.
- **Recommendation**: B for internal testing; A for public submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before public submission)

### RR-13. Release record — resolved 2026-10-04

- **Resolution**: `docs/release/v1/RELEASE_NOTES.md` written (rollout/monitoring/rollback, compliance, traceability to PR #4 + J1–J10 + 297-test verify); `CHANGELOG.md` carries the v1.0.0 product entry.
- **Owner**: justin.nguyen@appsindie.com

### RR-19. SIT waiver re-test condition — device items untested

- **Situation**: The RR-01/02 waiver drops pre-release device SIT, but the items it names (haptics, real push, Live Activity, IAP sandbox purchase, ad-failure UI on device, notification-denial flow, offline edge cases) still have to be exercised somewhere — the waiver moves them to internal testing, it does not delete them.
- **Options**: A — exercise each item on the internal-testing build before production promotion and record the result on this report. B — drop silently.
- **Recommendation**: A — internal testing is the de-facto SIT; the waiver is void if the items are never run.
- **Default if you say nothing**: blocks production promotion (internal testing itself is unblocked).
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production promotion)

### RR-14. EAS / portal credentials and console products not fully provisioned

- **Situation**: `EXPO_TOKEN` valid (account tuan3.nguyen@gmail.com). ASC app "Your Focus Loop" (id 6818991496) exists; ASC API key works (app visible via API). `EXPO_APPLE_ID`, iOS distribution credentials and EAS env vars (`ANDROID_SERVICE_ACCOUNT_JSON`, `IOS_STORE_CONNECT_P8`, `EXPO_APPLE_ID`) still to be provisioned on the EAS project. Console products:
  - IAP `com.appsindie.focusloop.plus.yearly` (auto-renewable, 7-day trial, $19.99) and `com.appsindie.focusloop.plus.lifetime` (non-consumable, $49.99) — sponsor created the ids on ASC; Play products blocked until first AAB upload.
  - AdMob rewarded unit for J8 24h-trial — production banner/interstitial ids exist (RR-03 resolved); rewarded id still needed.
  - AdMob console frequency caps on the interstitial unit (sponsor decision: limits live server-side).
- **Options**: A — provision before Gate 3. B — provision before first store submission.
- **Recommendation**: A — without products, Plus and J8 trials cannot be exercised in internal testing.
- **Default if you say nothing**: blocks store submission and J7/J8 sandbox verification.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before first submission)

### RR-15. Dashboards not created

- **Situation**: No dashboard exists for crash-free rate, ANR, or ad metrics (`SLO_AND_ALERTING.md` lists TBD).
- **Options**: A — create a minimal dashboard (Crashlytics + AdMob links collected in one place) before production rollout. B — rely on per-vendor consoles.
- **Recommendation**: B acceptable for v1 — vendor consoles cover each SLI; revisit when usage grows.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-16. Rollout halt thresholds not wired to alerts

- **Situation**: `SLO_AND_ALERTING.md` defines numeric halt thresholds per rollout stage, but they are not wired to a live alert — a breach would need manual watching of Crashlytics/Play Console.
- **Options**: A — wire Crashlytics/Play Console alerts to the thresholds before production rollout. B — manual daily check during staged rollout (owner does it).
- **Recommendation**: B is honest for a low-volume first release if the owner commits to the daily check; A before any paid push.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-17. Rollback trigger conditions not wired

- **Situation**: The conditions that trigger a rollback decision (SLO breaches in `SLO_AND_ALERTING.md`) are documented but not connected to an alerting channel that wakes the owner.
- **Options**: A — route Crashlytics alerts to email/Slack before production rollout. B — same manual daily check as RR-16.
- **Recommendation**: A — Crashlytics email alerts are free and one-time setup.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### RR-18. Escalation path not defined

- **Situation**: `SLO_AND_ALERTING.md` escalation routes are all `TBD`; no contact channel is recorded for a live incident.
- **Options**: A — record the owner's contact route (email/Slack) in `SLO_AND_ALERTING.md` before production rollout. B — n/a for internal testing.
- **Recommendation**: A — trivial to fill in, required before users can hit a real incident.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

## What ships

- Focus Loop v1.0.0: no-account focus–break loop (Disc/Numbers, weekly goal 4-of-7 replacing streak), widgets + Live Activity, reminders, share card, Plus (Yearly $19.99 7-day trial / Lifetime $49.99), rewarded 24h theme/sound trials, session history, local notifications, and AdMob banner + interstitial ads.
- Rollout plan: internal testing first (TestFlight + Play internal track, full cohort — internal tracks are not percentage-staged). After internal testing clears the waived RR-01/02 items, the owner promotes to production and runs the staged rollout 5% → 25% → 100% per `docs/release/SLO_AND_ALERTING.md`.
- Build/submission model: `.eas/workflows/release.yml` is `workflow_dispatch`-only — pushing to `release/*` does **not** build or submit. Every build and every submission is a separate confirmed go-ahead.
- Rollback: mobile binary cannot be recalled; rollout is halted and a hotfix is submitted. Owner and command in `RUNBOOK_mobile.md`.
- Store submission and promotion to production App Store / Play Store remains a human action after Gate 3; this release artifact does not perform a store submission.

## Accepted risks carried into production

| Risk                                                             | Accepted by                 | Date       | Revisit at                                                                   |
| ---------------------------------------------------------------- | --------------------------- | ---------- | ---------------------------------------------------------------------------- |
| AdMob SDK collecting device/usage data per Google/Apple policies | justin.nguyen@appsindie.com | 2026-08-08 | Before store submission (`docs/security/ads-integration-security-review.md` — predates production AdMob IDs and `write-store-credentials.sh`; refresh before production promotion if the ad config changes again) |
| No pre-release device SIT (RR-01/02 waiver)                      | justin.nguyen@appsindie.com | 2026-10-04 | Internal testing before any production promotion                             |

## After the release

- Day 7 / day 14 north-star comparison scheduled for: TBD
