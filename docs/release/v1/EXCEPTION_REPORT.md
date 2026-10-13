# Release Readiness — Exception Report v1.0.0

## Verdict

**not ready** — v1.0.0, surfaces ios/android. Binaries under review: Android versionCode 8 (Play internal), iOS build 21 (TestFlight); fixes land in vc9 / b22.

- Re-run 2026-10-13 (`READINESS.md`, `STORE_COMPLIANCE.md`, raw reads in `evidence/2026-10-13/`). Checks run 46 — pass 20, waived 3, n/a 2, exception 21.
- Gate 2: **passed** 2026-10-05 (signed by the sponsor, `FACTORY_STATE.json` `gates.2`).
- Gate 3 decision needed: **yes** — default if silent is **block**.
- "Waived" below always means a **closed sponsor decision** recorded with date and quote; it is never a proceed-by-silence default.

## Exception summary

| ID                           | Title                                                                                                        | Rows covered                           | Owner                               | Deadline          | Default                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ----------------------------------- | ----------------- | ---------------------- |
| EX-native-sit-waiver         | Native device SIT not run — **waived 2026-10-04 (closed sponsor decision)**                                  | SIT regression                         | justin.nguyen@appsindie.com         | —                 | waived                 |
| EX-failure-mode-waiver       | Failure-mode cases not verified — **waived 2026-10-04 (closed sponsor decision)**                            | Failure-mode cases                     | justin.nguyen@appsindie.com         | —                 | waived                 |
| EX-north-star-events         | North-star analytics events not wired                                                                        | North-star events                      | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-alerts-not-wired          | Alerts not wired or test-fired                                                                               | Alerts wired                           | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-rollback-command          | Rollback command not finalized (owner named)                                                                 | Rollback command                       | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-rollback-rehearsal        | Rollback not rehearsed                                                                                       | Rollback rehearsed                     | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-runbook-placeholders      | Runbook procedures still placeholders                                                                        | Runbook                                | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-store-agreements          | Store agreements — **resolved 2026-10-11**                                                                   | Store agreements                       | justin.nguyen@appsindie.com         | —                 | done                   |
| EX-store-declarations        | Store declarations not completed                                                                             | Declarations                           | justin.nguyen@appsindie.com         | 2026-10-06        | block                  |
| EX-internal-test-build       | Internal testing build not produced — **resolved 2026-10-05**                                                | Internal testing                       | justin.nguyen@appsindie.com         | —                 | —                      |
| EX-data-safety               | Privacy / data-safety declaration not completed                                                              | Privacy delta                          | justin.nguyen@appsindie.com         | 2026-10-06        | block                  |
| EX-release-record            | Release record — **resolved 2026-10-04**                                                                     | Release notes, Changelog, Traceability | justin.nguyen@appsindie.com         | —                 | done                   |
| EX-console-products          | EAS / portal credentials and console products not fully provisioned                                          | Credentials                            | justin.nguyen@appsindie.com         | 2026-10-06        | block                  |
| EX-dashboards                | Dashboards not created                                                                                       | Dashboards                             | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-halt-thresholds           | Rollout halt thresholds not wired to alerts                                                                  | Rollout halt thresholds                | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-rollback-triggers         | Rollback trigger conditions not wired                                                                        | Trigger conditions                     | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-escalation-path           | Escalation path not defined                                                                                  | Escalation path                        | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-sit-retest-devices        | SIT waiver re-test condition — device items untested                                                         | (waiver condition)                     | justin.nguyen@appsindie.com         | 2026-10-11        | block                  |
| EX-ump-consent               | No Google UMP consent before ad requests (EEA/UK)                                                            | Ads (UMP)                              | Devin / justin.nguyen@appsindie.com | 2026-10-15        | block                  |
| EX-permission-gate-drift     | AAB merged manifest has 16 permissions, allowlist 8; CI gate blind to library-injected permissions           | Merged-manifest permission audit       | Devin / justin.nguyen@appsindie.com | 2026-10-15        | block                  |
| EX-att-e2e                   | ATT prompt not asserted by an E2E flow on clean launch                                                       | Ads (ATT), E2E coverage                | Devin / justin.nguyen@appsindie.com | 2026-10-15        | block                  |
| EX-ios-background-audio-mode | UIBackgroundModes=audio declared while sound pauses on background (App Review 2.5.4)                         | Pass A 2.5.4                           | Devin / justin.nguyen@appsindie.com | before b22        | block                  |
| EX-privacy-contact-email     | Privacy policy page has no contact email                                                                     | Legal — Privacy Policy, 5.1.1          | Devin / justin.nguyen@appsindie.com | 2026-10-15        | block                  |
| EX-asc-iap-metadata          | ASC IAPs plus.yearly + plus.lifetime MISSING_METADATA                                                        | Pass A 2.1, Pass B IAP                 | justin.nguyen@appsindie.com         | before iOS submit | block                  |
| EX-asc-version-setup         | ASC 1.0: primary category null, no build attached, es-MX without screenshots                                 | Pass B ASC                             | justin.nguyen@appsindie.com         | before iOS submit | block                  |
| EX-tablet-screenshots        | No iPad 13" / Android tablet screenshot sets although supportsTablet=true                                    | Store assets from this build           | Devin / justin.nguyen@appsindie.com | before iOS submit | block                  |
| EX-tablet-e2e                | Tablet layouts T01–T06 not verified on a tablet device/orientation                                           | Spec completeness, E2E coverage        | Devin / justin.nguyen@appsindie.com | 2026-10-16        | block                  |
| EX-owasp-checklist           | No OWASP Mobile Top 10 / MASVS disposition per category                                                      | OWASP coverage                         | Devin / justin.nguyen@appsindie.com | 2026-10-16        | block                  |
| EX-dependency-triage         | 28 outdated deps not triaged by major; npm audit 1 critical (shell-quote, dev-only path) + 67 high untriaged | Dependency freshness                   | Devin / justin.nguyen@appsindie.com | 2026-10-16        | block                  |
| EX-AI-REVIEW-TIMEOUT         | Claude review no verdict on PR #16 (non-blocking)                                                            | AI review                              | justin.nguyen@appsindie.com         | 2026-10-12        | proceed (non-blocking) |

## Waiver records (closed exceptions)

### EX-native-sit-waiver. Native device SIT not run — waived

- **Decision**: waive the pre-release native-device SIT cycle for v1.0.0.
- **Decided by**: justin.nguyen@appsindie.com, 2026-10-04, verbatim: "k sit, làm release luôn đi. app mới chưa có user mà sit gì men" (no users yet — SIT adds nothing pre-release).
- **Human signature**: pending — owner to sign on the release PR (`gate-signed` label or comment) so the record is human-authored.
- **Partial evidence retained**: iOS Simulator pass (iPhone 17, iOS 26, dev-client) — J1 first-launch + ATT prompt + display pick, J2 focus start/pause/end-early/save, Home (loop summary, weekly goal, live AdMob banner), Settings P20, Themes & sounds trial rows, Paywall P14 fallback prices. Three native build defects found and fixed in that pass (widget Info.plist, duplicate ActivityAttributes, expo-store-review `SceneGeometry` patch via patch-package).
- **Deliberately untested**: haptics, real push delivery, Live Activity on lock screen, IAP sandbox purchase, real device performance.
- **Re-test condition**: these items must be exercised during internal testing (TestFlight / Play internal) **before any production promotion**. Internal testing is the de-facto SIT for v1.
- **Owner**: justin.nguyen@appsindie.com

### EX-failure-mode-waiver. Failure-mode cases not verified — waived

- **Decision**: waive pre-release device failure-mode verification (same sponsor decision as EX-native-sit-waiver).
- **Decided by**: justin.nguyen@appsindie.com, 2026-10-04 (same quote).
- **Partial evidence retained**: cancel regression passed on web preview; ATT denial verified on simulator ("Ask App Not to Track" → non-personalized banner still loads); store-product fetch failure degrades to fallback prices on the paywall.
- **Deliberately untested**: ad load-failure UI on device, notification permission denial flow, offline edge cases, IAP sandbox purchase failure paths.
- **Re-test condition**: exercise during internal testing before production promotion.
- **Owner**: justin.nguyen@appsindie.com

## Open exceptions

### EX-north-star-events. North-star analytics events not wired

- **Situation**: `apps/mobile/src/features/analytics/events.ts` exists as a thin hook but no analytics backend is connected, so north-star events (days-focused per week, retention) are not collected anywhere. **Progress 2026-10-04 (option A)**: sponsor supplied `GoogleService-Info.plist` / `google-services.json` (project `focus-loop-3db4a`); `@react-native-firebase/app+analytics+crashlytics` wired — `setEventSink` forwards all 15 events to `logEvent`, Crashlytics auto-captures on init (verified: `RNFBCrashlyticsInit initialization successful` in the iOS sim boot log). **Consent decision**: Analytics + Crashlytics collect pseudonymous app-instance data by default from first launch — no separate consent screen; ATT governs ad tracking only (recorded here per code-review CR-2). Remaining for closure: first real event rows seen in the Firebase console after a build runs.
- **Options**: A — wire Firebase Analytics event export before Gate 3. B — defer to post-launch growth phase.
- **Recommendation**: A before any paid/marketing spend; B acceptable for an organic initial release. Sponsor chose A (configs delivered 2026-10-04).
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-alerts-not-wired. Alerts not wired or test-fired

- **Situation**: `docs/release/SLO_AND_ALERTING.md` defines SLOs (crash-free 99.9%, ANR <0.3%, ad-fail <5%) but no alert exists in Crashlytics / Play Console / AdMob, and none has been test-fired.
- **Options**: A — create alerts and test-fire them before Gate 3. B — wire alerts after the first internal-testing build ships.
- **Recommendation**: B — alerts need a live build to test-fire against; must be done before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-rollback-command. Rollback command not finalized (owner named)

- **Situation**: Rollback owner is named in `RUNBOOK_mobile.md` (justin.nguyen@appsindie.com). Mobile binaries cannot be recalled, so the rollback action is halt-rollout + hotfix; the halt step is written as console/API actions but has not been executed end-to-end.
- **Options**: A — rehearse the halt + hotfix sequence on the internal track before Gate 3. B — treat the first internal-test build as the rehearsal.
- **Recommendation**: B — the internal build is the natural rehearsal vehicle (see EX-rollback-rehearsal).
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-rollback-rehearsal. Rollback not rehearsed

- **Situation**: No EAS build exists yet, so the halt + hotfix flow has never been exercised.
- **Options**: A — rehearse during internal testing. B — full dress rehearsal before Gate 3.
- **Recommendation**: A — rehearse on the internal track during internal testing; required before 100% rollout.
- **Default if you say nothing**: blocks 100% rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before 100% rollout)

### EX-runbook-placeholders. Runbook procedures still placeholders

- **Situation**: `docs/release/RUNBOOK_mobile.md` has owner, operate and diagnose rows, but the diagnose table and escalate routes are not yet validated against a real incident.
- **Options**: A — complete during internal testing with the first real signals. B — block Gate 3 until fully written.
- **Recommendation**: A — internal testing generates the real failure data the runbook needs; must be final before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-store-agreements. Store agreements — resolved 2026-10-11

- **Resolution**: owner confirmed account-level Apple/Google developer agreements (incl. paid-app agreements, tax/banking) already in place from previously shipped AppsIndie apps.
- **Situation**: Apple / Google developer agreements, tax/banking and paid-app agreements have not been verified by a human on either portal.
- **Options**: A — verify before Gate 3. B — verify before store submission.
- **Recommendation**: B is acceptable; A removes a blocking surprise at submission time.
- **Default if you say nothing**: blocks store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before first submission)

### EX-store-declarations. Store declarations not completed

- **Situation**: Answers: `STORE_QUESTIONNAIRE.md` (single source; `STORE_DECLARATIONS.md` is now a pointer). Console forms not submitted as of 2026-10-13 (Pass B). Age rating, app-store permission/ATT/ads declarations not yet completed on either console. Legal pages exist at `appsindie.com/docs/legal/focus-loop/{privacy,tnc,disclaimer,licenses}` (appsindie-landing#5). **Progress 2026-10-04**: all form answers drafted in `docs/release/v1/STORE_DECLARATIONS.md` — owner copies them into the consoles.
- **Options**: A — complete before Gate 3. B — complete before public store submission; internal testing does not require them.
- **Recommendation**: B for internal testing; A for public submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before public submission)

### EX-internal-test-build. Internal testing build not produced — resolved 2026-10-05

- **Resolution**: sponsor go-ahead "go" (2026-10-05) — `eas build --platform ios --profile production` → build `d19deb41` (app version 1.0.0, build number 8) submitted to TestFlight via `eas submit` (`submit.production`, ASC API key `KHJLUQ98Z9`). Artifact includes Firebase Analytics + Crashlytics and all six production ad units (built from the PR #7 head). Android AAB pending — opens the Play product console, separately confirmed.
- **Owner**: justin.nguyen@appsindie.com

### EX-data-safety. Privacy / data-safety declaration not completed

- **Situation**: Answers: `STORE_QUESTIONNAIRE.md` (single source; `STORE_DECLARATIONS.md` is now a pointer). Console forms not submitted as of 2026-10-13 (Pass B). The app's actual data collection (local AsyncStorage, AdMob/ATT, Firebase Analytics — wired 2026-10-04) has not been mapped to a store data-safety declaration. **Progress 2026-10-04**: mapping drafted in `docs/release/v1/STORE_DECLARATIONS.md` (Play data-safety table + ASC App Privacy + ATT note, both updated for the wired Firebase SDKs); iOS `PrivacyInfo.xcprivacy` verified auto-generated correctly.
- **Options**: A — complete before Gate 3. B — complete before public store submission.
- **Recommendation**: B for internal testing; A for public submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-06 (before public submission)

### EX-release-record. Release record — resolved 2026-10-04

- **Resolution**: `docs/release/v1/RELEASE_NOTES.md` written (rollout/monitoring/rollback, compliance, traceability to PR #4 + J1–J10 + 297-test verify); `CHANGELOG.md` carries the v1.0.0 product entry.
- **Owner**: justin.nguyen@appsindie.com

### EX-sit-retest-devices. SIT waiver re-test condition — device items untested

- **Situation**: The EX-native-sit-waiver/EX-failure-mode-waiver waiver drops pre-release device SIT, but the items it names (haptics, real push, Live Activity, IAP sandbox purchase, ad-failure UI on device, notification-denial flow, offline edge cases) still have to be exercised somewhere — the waiver moves them to internal testing, it does not delete them.
- **Options**: A — exercise each item on the internal-testing build before production promotion and record the result on this report. B — drop silently.
- **Recommendation**: A — internal testing is the de-facto SIT; the waiver is void if the items are never run.
- **Default if you say nothing**: blocks production promotion (internal testing itself is unblocked).
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production promotion)

### EX-console-products. EAS / portal credentials and console products not fully provisioned

- **Situation (2026-10-13 read-back)**: Play `plus.yearly` base plan `yearly` ACTIVE but **no offers** (7-day free trial missing); Play `plus.lifetime` purchase option ACTIVE. ASC side split out to EX-asc-iap-metadata. AdMob rewarded units wired; interstitial frequency cap is a console setting (sponsor).
- **Remaining action**: add the 7-day free-trial offer on Play yearly; confirm $19.99 / $49.99 price points.
- **Options**: A — provision before Gate 3. B — provision before first store submission.
- **Recommendation**: A — without products, Plus and J8 trials cannot be exercised in internal testing.
- **Default if you say nothing**: blocks store submission and J7/J8 sandbox verification.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: before Android production promote

### EX-dashboards. Dashboards not created

- **Situation**: No dashboard exists for crash-free rate, ANR, or ad metrics. **Progress 2026-10-04**: `SLO_AND_ALERTING.md` now lists the vendor consoles that cover each SLI (ASC Metrics/Crashes, Play Vitals, AdMob reports) — the option-B resolution is written down; owner confirms the choice.
- **Options**: A — create a minimal dashboard (Crashlytics + AdMob links collected in one place) before production rollout. B — rely on per-vendor consoles.
- **Recommendation**: B acceptable for v1 — vendor consoles cover each SLI; revisit when usage grows.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-halt-thresholds. Rollout halt thresholds not wired to alerts

- **Situation**: `SLO_AND_ALERTING.md` defines numeric halt thresholds per rollout stage, but they are not wired to a live alert — a breach would need manual watching of the consoles. **Progress 2026-10-04**: a concrete daily manual-check cadence is written into `SLO_AND_ALERTING.md` (option B); sources are Play Vitals + ASC Metrics + AdMob + the Firebase console (Crashlytics wired 2026-10-04 — email alerts can be enabled in the Firebase console as part of EX-alerts-not-wired/EX-rollback-triggers).
- **Options**: A — wire Crashlytics/Play Console alerts to the thresholds before production rollout. B — manual daily check during staged rollout (owner does it).
- **Recommendation**: B is honest for a low-volume first release if the owner commits to the daily check; A before any paid push.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-rollback-triggers. Rollback trigger conditions not wired

- **Situation**: The conditions that trigger a rollback decision (SLO breaches in `SLO_AND_ALERTING.md`) are documented but not connected to an alerting channel that wakes the owner. **Progress 2026-10-04**: escalation routes drafted (owner daily check + Play Console auto-email on crash spikes); a real alert channel still needs an SDK or wiring — tracked under EX-north-star-events/EX-alerts-not-wired.
- **Options**: A — route Crashlytics alerts to email/Slack before production rollout. B — same manual daily check as EX-halt-thresholds.
- **Recommendation**: A — Crashlytics email alerts are free and one-time setup.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

### EX-escalation-path. Escalation path not defined

- **Situation**: `SLO_AND_ALERTING.md` escalation routes were `TBD`. **Progress 2026-10-04**: routes now written — owner daily console check during rollout + Play Console auto-emails for crash spikes; the waking-human channel is the account-owner email.
- **Options**: A — record the owner's contact route (email/Slack) in `SLO_AND_ALERTING.md` before production rollout. B — n/a for internal testing.
- **Recommendation**: A — trivial to fill in, required before users can hit a real incident.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-11 (before production rollout)

## What ships

- Focus Loop v1.0.0: no-account focus–break loop (Disc/Numbers, weekly goal 4-of-7 replacing streak), widgets + Live Activity, reminders, share card, Plus (Yearly $19.99 7-day trial / Lifetime $49.99), rewarded 24h theme/sound trials, session history, local notifications, and AdMob banner + interstitial ads.
- Rollout plan: internal testing first (TestFlight + Play internal track, full cohort — internal tracks are not percentage-staged). After internal testing clears the waived EX-native-sit-waiver/EX-failure-mode-waiver items, the owner promotes to production and runs the staged rollout 5% → 25% → 100% per `docs/release/SLO_AND_ALERTING.md`.
- Build/submission model: `.eas/workflows/release.yml` is `workflow_dispatch`-only — pushing to `release/*` does **not** build or submit. Every build and every submission is a separate confirmed go-ahead.
- Rollback: mobile binary cannot be recalled; rollout is halted and a hotfix is submitted. Owner and command in `RUNBOOK_mobile.md`.
- Store submission and promotion to production App Store / Play Store remains a human action after Gate 3; this release artifact does not perform a store submission.

## Accepted risks carried into production

| Risk                                                                           | Accepted by                 | Date       | Revisit at                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------ | --------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AdMob SDK collecting device/usage data per Google/Apple policies               | justin.nguyen@appsindie.com | 2026-08-08 | Before store submission (`docs/security/ads-integration-security-review.md` — predates production AdMob IDs and `write-store-credentials.sh`; refresh before production promotion if the ad config changes again) |
| No pre-release device SIT (EX-native-sit-waiver/EX-failure-mode-waiver waiver) | justin.nguyen@appsindie.com | 2026-10-04 | Internal testing before any production promotion                                                                                                                                                                  |

## After the release

- Day 7 / day 14 north-star comparison scheduled for: TBD

## New exceptions — 2026-10-13 re-run

### EX-ump-consent. No Google UMP consent before ad requests (EEA/UK)

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Ads (UMP)"; evidence `evidence/2026-10-13/`.
- **Recommendation**: A — add UMP gatherConsent + Privacy options row, rebuild vc9/b22 (sponsor chose A 2026-10-13: "Fix hết đi").
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin implements; sponsor verifies on device
- **Deadline**: 2026-10-15
- **Status**: open

### EX-permission-gate-drift. AAB merged manifest has 16 permissions, allowlist 8; CI gate blind to library-injected permissions

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Merged-manifest permission audit"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Allowlist justified ones, strip unused, add AAB-level check to the release runbook.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: 2026-10-15
- **Status**: open

### EX-att-e2e. ATT prompt not asserted by an E2E flow on clean launch

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Ads (ATT), E2E coverage"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Hard-assert Maestro flow + deny path on iOS sim.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: 2026-10-15
- **Status**: open

### EX-ios-background-audio-mode. UIBackgroundModes=audio declared while sound pauses on background (App Review 2.5.4)

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Pass A 2.5.4"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Strip the mode in the b22 config; b21 is consistent (still plays in background).
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: before b22
- **Status**: open

### EX-privacy-contact-email. Privacy policy page has no contact email

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Legal — Privacy Policy, 5.1.1"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Add info@appsindie.com on the landing privacy page.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: 2026-10-15
- **Status**: resolved 2026-10-13 — false positive (see `evidence/2026-10-13/legal-pages.txt` correction)

### EX-asc-iap-metadata. ASC IAPs plus.yearly + plus.lifetime MISSING_METADATA

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Pass A 2.1, Pass B IAP"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Sponsor fills display name/description/review screenshot, attaches to 1.0.
- **Default if you say nothing**: block Gate 3.
- **Owner**: human
- **Deadline**: before iOS submit
- **Status**: open

### EX-asc-version-setup. ASC 1.0: primary category null, no build attached, es-MX without screenshots

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Pass B ASC"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Sponsor sets Productivity + attaches b22; Devin uploads es-MX set.
- **Default if you say nothing**: block Gate 3.
- **Owner**: human + Devin
- **Deadline**: before iOS submit
- **Status**: open

### EX-tablet-screenshots. No iPad 13" / Android tablet screenshot sets although supportsTablet=true

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Store assets from this build"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Capture tablet sets from vc9/b22 for 19 locales and upload.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: before iOS submit
- **Status**: open

### EX-tablet-e2e. Tablet layouts T01–T06 not verified on a tablet device/orientation

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Spec completeness, E2E coverage"; evidence `evidence/2026-10-13/`.
- **Recommendation**: iPad sim + Android tablet emulator pass, portrait + landscape.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: 2026-10-16
- **Status**: open

### EX-owasp-checklist. No OWASP Mobile Top 10 / MASVS disposition per category

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "OWASP coverage"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Write docs/security/v1-owasp-mobile.md.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: 2026-10-16
- **Status**: open

### EX-dependency-triage. 28 outdated deps not triaged by major; npm audit 1 critical (shell-quote, dev-only path) + 67 high untriaged

- **Situation**: see `STORE_COMPLIANCE.md` / `READINESS.md` row "Dependency freshness"; evidence `evidence/2026-10-13/`.
- **Recommendation**: Triage each major + advisory reachability; exception rows for any dep that cannot move.
- **Default if you say nothing**: block Gate 3.
- **Owner**: Devin
- **Deadline**: 2026-10-16
- **Status**: open
