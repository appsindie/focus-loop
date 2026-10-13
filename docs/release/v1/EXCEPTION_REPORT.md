# Release Readiness — Exception Report v1.0.0

## Verdict

**not ready** — v1.0.0, surfaces ios/android. Binaries under review: Android versionCode 8 (Play internal), iOS build 21 (TestFlight); fixes land in vc9 / b22.

- Re-run 2026-10-13 (`READINESS.md`, `STORE_COMPLIANCE.md`, raw reads in `evidence/2026-10-13/`). Checks run 46 — pass 19, n/a 2, exception 25 (the three waived rows count as exceptions until EX-waiver-signature closes).
- Gate 2: **passed** 2026-10-05 (signed by the sponsor, `FACTORY_STATE.json` `gates.2`).
- Gate 3 decision needed: **yes** — default if silent is **block**.
- "Waived" below always means a **closed sponsor decision** recorded with date and quote; it is never a proceed-by-silence default.

## Exception summary

Every open item has default **block**; Devin implements the code/asset items, the sponsor decides and owns them.

| ID                             | Title                                                                                             | Rows covered                             | Owner                       | Deadline   | Default if silent |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------- | ---------- | ----------------- |
| EX-native-sit-waiver           | Native device SIT not run — waived 2026-10-04, signed 2026-10-13                                  | SIT regression                           | justin.nguyen@appsindie.com | —          | waived (closed)   |
| EX-failure-mode-waiver         | Failure-mode cases not verified — waived 2026-10-04, signed 2026-10-13                            | Failure-mode cases                       | justin.nguyen@appsindie.com | —          | waived (closed)   |
| EX-north-star-events           | North-star analytics events not wired                                                             | North-star events                        | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-alerts-not-wired            | Alerts not wired or test-fired                                                                    | Alerts wired                             | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-rollback-command            | Rollback command not finalized                                                                    | Rollback command                         | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-rollback-rehearsal          | Rollback not rehearsed                                                                            | Rollback rehearsed                       | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-runbook-placeholders        | Runbook procedures still placeholders                                                             | Runbook                                  | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-store-agreements            | Store agreements — **resolved 2026-10-11**                                                        | Store agreements                         | justin.nguyen@appsindie.com | —          | done              |
| EX-store-declarations          | Store declarations not completed                                                                  | Declarations                             | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-internal-test-build         | Internal testing build — **resolved 2026-10-05**                                                  | Internal testing                         | justin.nguyen@appsindie.com | —          | done              |
| EX-data-safety                 | Privacy / data-safety declaration not completed                                                   | Privacy delta                            | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-release-record              | Release record — **resolved 2026-10-04**                                                          | Release notes, Changelog                 | justin.nguyen@appsindie.com | —          | done              |
| EX-console-products            | Console products: Play yearly trial offer missing                                                 | Credentials, Pass B Play                 | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-dashboards                  | Dashboards not created                                                                            | Dashboards                               | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-halt-thresholds             | Rollout halt thresholds not wired to alerts                                                       | Rollout halt thresholds                  | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-rollback-triggers           | Rollback trigger conditions not wired                                                             | Trigger conditions                       | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-escalation-path             | Escalation path not defined                                                                       | Escalation path                          | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-sit-retest-devices          | SIT waiver re-test condition — device items untested                                              | Third-party sandboxes (waiver condition) | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-ump-consent                 | No Google UMP consent before ad requests (EEA/UK)                                                 | Ads (UMP)                                | justin.nguyen@appsindie.com | 2026-10-15 | block             |
| EX-analytics-consent           | Firebase Analytics runs before any consent in EEA/UK — **resolved 2026-10-13: option B accepted** | Privacy delta, Ads (UMP)                 | justin.nguyen@appsindie.com | —          | done              |
| EX-permission-gate-drift       | AAB has 16 permissions, allowlist 8; CI gate blind to injected ones                               | Merged-manifest permission audit         | justin.nguyen@appsindie.com | 2026-10-15 | block             |
| EX-att-e2e                     | ATT prompt not asserted by an E2E flow                                                            | Ads (ATT), E2E coverage                  | justin.nguyen@appsindie.com | 2026-10-15 | block             |
| EX-ios-background-audio-mode   | UIBackgroundModes=audio declared but unused (2.5.4)                                               | Pass A 2.5.4                             | justin.nguyen@appsindie.com | 2026-10-15 | block             |
| EX-android15-taskbar-nav-icons | Android 15 three-button Taskbar icon contrast                                                     | Android system bars                      | justin.nguyen@appsindie.com | 2026-10-20 | block             |
| EX-privacy-contact-email       | Privacy page contact email — **resolved 2026-10-13 (false positive)**                             | Legal — Privacy Policy                   | justin.nguyen@appsindie.com | —          | done              |
| EX-asc-iap-metadata            | ASC IAPs MISSING_METADATA                                                                         | Pass A 2.1, Pass B IAP                   | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-asc-version-setup           | ASC 1.0: no category or build; es-MX screenshots verified                                         | Pass B ASC                               | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-tablet-screenshots          | iPad 13" / Android tablet screenshot sets complete — resolved 2026-10-13                          | Store assets + readback evidence         | justin.nguyen@appsindie.com | —          | done              |
| EX-tablet-e2e                  | Tablet layouts T01–T06 not verified on tablets                                                    | Spec completeness, E2E coverage          | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-owasp-checklist             | No OWASP Mobile Top 10 disposition; review predates prod AdMob IDs                                | OWASP coverage, Findings by severity     | justin.nguyen@appsindie.com | 2026-10-17 | block             |
| EX-dependency-triage           | 28 outdated + npm audit 1 critical / 67 high untriaged                                            | Dependency freshness                     | justin.nguyen@appsindie.com | 2026-10-17 | block             |

## Waiver records (closed exceptions)

### EX-native-sit-waiver. Native device SIT not run — waived

- **Decision**: waive the pre-release native-device SIT cycle for v1.0.0.
- **Decided by**: justin.nguyen@appsindie.com, 2026-10-04, verbatim: "k sit, làm release luôn đi. app mới chưa có user mà sit gì men" (no users yet — SIT adds nothing pre-release).
- **Human signature**: confirmed by justin.nguyen@appsindie.com in session chat 2026-10-13, verbatim: "ko cần sít"
- **Partial evidence retained**: iOS Simulator pass (iPhone 17, iOS 26, dev-client) — J1 first-launch + ATT prompt + display pick, J2 focus start/pause/end-early/save, Home (loop summary, weekly goal, live AdMob banner), Settings P20, Themes & sounds trial rows, Paywall P14 fallback prices. Three native build defects found and fixed in that pass (widget Info.plist, duplicate ActivityAttributes, expo-store-review `SceneGeometry` patch via patch-package).
- **Deliberately untested**: haptics, real push delivery, Live Activity on lock screen, IAP sandbox purchase, real device performance.
- **Re-test condition**: these items must be exercised during internal testing (TestFlight / Play internal) **before any production promotion**. Internal builds exist (vc8/b21, superseded by vc9/b22); the re-test itself is tracked as EX-sit-retest-devices.
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

- **Situation**: `apps/mobile/src/features/analytics/events.ts` exists as a thin hook but no analytics backend is connected, so north-star events (days-focused per week, retention) are not collected anywhere. **Progress 2026-10-04 (option A)**: sponsor supplied `GoogleService-Info.plist` / `google-services.json` (project `focus-loop-3db4a`); `@react-native-firebase/app+analytics+crashlytics` wired — `setEventSink` forwards all 15 events to `logEvent`, Crashlytics auto-captures on init (verified: `RNFBCrashlyticsInit initialization successful` in the iOS sim boot log). **Consent model**: Analytics + Crashlytics collect pseudonymous app-instance data from first launch (default ON) with an in-app opt-out (Settings → "Crash & usage reports", `diagnosticsConsent.ts`); there is no opt-in screen. ATT governs ad tracking only. Whether EEA/UK needs opt-in instead is the open decision **EX-analytics-consent**; `STORE_QUESTIONNAIRE.md` describes the same model. Remaining for closure: first real event rows seen in the Firebase console after a build runs.
- **Options**: A — wire Firebase Analytics event export before Gate 3. B — defer to post-launch growth phase.
- **Recommendation**: A before any paid/marketing spend; B acceptable for an organic initial release. Sponsor chose A (configs delivered 2026-10-04).
- **Default if you say nothing**: blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-alerts-not-wired. Alerts not wired or test-fired

- **Situation**: `docs/release/SLO_AND_ALERTING.md` defines SLOs (crash-free 99.9%, ANR <0.3%, ad-fail <5%) but no alert exists in Crashlytics / Play Console / AdMob, and none has been test-fired.
- **Options**: A — create alerts and test-fire them before Gate 3. B — wire alerts after the first internal-testing build ships.
- **Recommendation**: B — alerts need a live build to test-fire against; must be done before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-rollback-command. Rollback command not finalized (owner named)

- **Situation**: Rollback owner is named in `RUNBOOK_mobile.md` (justin.nguyen@appsindie.com). Mobile binaries cannot be recalled, so the rollback action is halt-rollout + hotfix; the halt step is written as console/API actions but has not been executed end-to-end.
- **Options**: A — rehearse the halt + hotfix sequence on the internal track before Gate 3. B — treat the first internal-test build as the rehearsal.
- **Recommendation**: B — the internal build is the natural rehearsal vehicle (see EX-rollback-rehearsal).
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-rollback-rehearsal. Rollback not rehearsed

- **Situation**: No EAS build exists yet, so the halt + hotfix flow has never been exercised.
- **Options**: A — rehearse during internal testing. B — full dress rehearsal before Gate 3.
- **Recommendation**: A — rehearse on the internal track during internal testing; required before 100% rollout.
- **Default if you say nothing**: blocks 100% rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before 100% rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-runbook-placeholders. Runbook procedures still placeholders

- **Situation**: `docs/release/RUNBOOK_mobile.md` has owner, operate and diagnose rows, but the diagnose table and escalate routes are not yet validated against a real incident.
- **Options**: A — complete during internal testing with the first real signals. B — block Gate 3 until fully written.
- **Recommendation**: A — internal testing generates the real failure data the runbook needs; must be final before production rollout.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-store-agreements. Store agreements — resolved 2026-10-11

- **Resolution**: owner confirmed account-level Apple/Google developer agreements (incl. paid-app agreements, tax/banking) already in place from previously shipped AppsIndie apps.
- **Situation**: Account-level paid-apps / developer agreements, shared with the AppsIndie apps already live on both stores.
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
- **Deadline**: 2026-10-17 — **Re-dated 2026-10-13** (was 2026-10-06 (before public submission)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-internal-test-build. Internal testing build not produced — resolved 2026-10-05

- **Resolution**: sponsor go-ahead "go" (2026-10-05) — `eas build --platform ios --profile production` → build `d19deb41` (app version 1.0.0, build number 8) submitted to TestFlight via `eas submit` (`submit.production`, ASC API key `KHJLUQ98Z9`). Artifact includes Firebase Analytics + Crashlytics and all six production ad units (built from the PR #7 head). Android AAB pending — opens the Play product console, separately confirmed.
- **Owner**: justin.nguyen@appsindie.com

### EX-data-safety. Privacy / data-safety declaration not completed

- **Situation**: Answers: `STORE_QUESTIONNAIRE.md` (single source; `STORE_DECLARATIONS.md` is now a pointer). Console forms not submitted as of 2026-10-13 (Pass B). The app's actual data collection (local AsyncStorage, AdMob/ATT, Firebase Analytics — wired 2026-10-04) has not been mapped to a store data-safety declaration. **Progress 2026-10-04**: mapping drafted in `docs/release/v1/STORE_DECLARATIONS.md` (Play data-safety table + ASC App Privacy + ATT note, both updated for the wired Firebase SDKs); iOS `PrivacyInfo.xcprivacy` verified auto-generated correctly.
- **Options**: A — complete before Gate 3. B — complete before public store submission.
- **Recommendation**: B for internal testing; A for public submission.
- **Default if you say nothing**: blocks public store submission.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-17 — **Re-dated 2026-10-13** (was 2026-10-06 (before public submission)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-release-record. Release record — resolved 2026-10-04

- **Resolution**: `docs/release/v1/RELEASE_NOTES.md` written (rollout/monitoring/rollback, compliance, traceability to PR #4 + J1–J10 + 297-test verify); `CHANGELOG.md` carries the v1.0.0 product entry.
- **Owner**: justin.nguyen@appsindie.com

### EX-sit-retest-devices. SIT waiver re-test condition — device items untested

- **Situation**: The EX-native-sit-waiver/EX-failure-mode-waiver waiver drops pre-release device SIT, but the items it names (haptics, real push, Live Activity, IAP sandbox purchase, ad-failure UI on device, notification-denial flow, offline edge cases) still have to be exercised somewhere — the waiver moves them to internal testing, it does not delete them.
- **Options**: A — exercise each item on the internal-testing build before production promotion and record the result on this report. B — drop silently.
- **Recommendation**: A — internal testing is the de-facto SIT; the waiver is void if the items are never run.
- **Default if you say nothing**: blocks production promotion (internal testing itself is unblocked).
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production promotion)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-console-products. EAS / portal credentials and console products not fully provisioned

- **Situation (2026-10-13 read-back)**: Play `plus.yearly` base plan `yearly` ACTIVE but **no offers** (7-day free trial missing); Play `plus.lifetime` purchase option ACTIVE. ASC side split out to EX-asc-iap-metadata. AdMob rewarded units wired; interstitial frequency cap is a console setting (sponsor).
- **Remaining action**: add the 7-day free-trial offer on Play yearly; confirm $19.99 / $49.99 price points.
- **Options**: A — provision before Gate 3. B — provision before first store submission.
- **Recommendation**: A — without products, Plus and J8 trials cannot be exercised in internal testing.
- **Default if you say nothing**: blocks store submission and J7/J8 sandbox verification.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-17 — **Re-dated 2026-10-13** (was before Android production promote): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-dashboards. Dashboards not created

- **Situation**: No dashboard exists for crash-free rate, ANR, or ad metrics. **Progress 2026-10-04**: `SLO_AND_ALERTING.md` now lists the vendor consoles that cover each SLI (ASC Metrics/Crashes, Play Vitals, AdMob reports) — the option-B resolution is written down; owner confirms the choice.
- **Options**: A — create a minimal dashboard (Crashlytics + AdMob links collected in one place) before production rollout. B — rely on per-vendor consoles.
- **Recommendation**: B acceptable for v1 — vendor consoles cover each SLI; revisit when usage grows.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-halt-thresholds. Rollout halt thresholds not wired to alerts

- **Situation**: `SLO_AND_ALERTING.md` defines numeric halt thresholds per rollout stage, but they are not wired to a live alert — a breach would need manual watching of the consoles. **Progress 2026-10-04**: a concrete daily manual-check cadence is written into `SLO_AND_ALERTING.md` (option B); sources are Play Vitals + ASC Metrics + AdMob + the Firebase console (Crashlytics wired 2026-10-04 — email alerts can be enabled in the Firebase console as part of EX-alerts-not-wired/EX-rollback-triggers).
- **Options**: A — wire Crashlytics/Play Console alerts to the thresholds before production rollout. B — manual daily check during staged rollout (owner does it).
- **Recommendation**: B is honest for a low-volume first release if the owner commits to the daily check; A before any paid push.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-rollback-triggers. Rollback trigger conditions not wired

- **Situation**: The conditions that trigger a rollback decision (SLO breaches in `SLO_AND_ALERTING.md`) are documented but not connected to an alerting channel that wakes the owner. **Progress 2026-10-04**: escalation routes drafted (owner daily check + Play Console auto-email on crash spikes); a real alert channel still needs an SDK or wiring — tracked under EX-north-star-events/EX-alerts-not-wired.
- **Options**: A — route Crashlytics alerts to email/Slack before production rollout. B — same manual daily check as EX-halt-thresholds.
- **Recommendation**: A — Crashlytics email alerts are free and one-time setup.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

### EX-escalation-path. Escalation path not defined

- **Situation**: `SLO_AND_ALERTING.md` escalation routes were `TBD`. **Progress 2026-10-04**: routes now written — owner daily console check during rollout + Play Console auto-emails for crash spikes; the waking-human channel is the account-owner email.
- **Options**: A — record the owner's contact route (email/Slack) in `SLO_AND_ALERTING.md` before production rollout. B — n/a for internal testing.
- **Recommendation**: A — trivial to fill in, required before users can hit a real incident.
- **Default if you say nothing**: blocks production rollout.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20 — **Re-dated 2026-10-13** (was 2026-10-11 (before production rollout)): still open because the release moved to vc9/b22; deferred, not dropped. Must close before production promotion.

## What ships

- Focus Loop v1.0.0: no-account focus–break loop (Disc/Numbers, weekly goal 4-of-7 replacing streak), widgets + Live Activity, reminders, share card, Plus (Yearly $19.99 7-day trial / Lifetime $49.99), rewarded 24h theme/sound trials, session history, local notifications, and AdMob banner + interstitial ads.
- Rollout plan: internal testing first (TestFlight + Play internal track, full cohort — internal tracks are not percentage-staged). After internal testing clears the waived EX-native-sit-waiver/EX-failure-mode-waiver items, the owner promotes to production and runs the staged rollout 5% → 25% → 100% per `docs/release/SLO_AND_ALERTING.md`.
- Build/submission model: `.eas/workflows/release.yml` is `workflow_dispatch`-only — pushing to `release/*` does **not** build or submit. Every build and every submission is a separate confirmed go-ahead.
- Rollback: mobile binary cannot be recalled; rollout is halted and a hotfix is submitted. Owner and command in `RUNBOOK_mobile.md`.
- Store submission and promotion to production App Store / Play Store remains a human action after Gate 3; this release artifact does not perform a store submission.

## Accepted risks carried into production

| Risk                                                                                                             | Accepted by                                                               | Date       | Revisit at                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AdMob SDK collecting device/usage data per Google/Apple policies                                                 | justin.nguyen@appsindie.com                                               | 2026-08-08 | Before store submission (`docs/security/ads-integration-security-review.md` — predates production AdMob IDs and `write-store-credentials.sh`; refresh before production promotion if the ad config changes again) |
| No pre-release device SIT (EX-native-sit-waiver/EX-failure-mode-waiver waiver)                                   | signed 2026-10-13 ("ko cần sít") — decided by justin.nguyen@appsindie.com | 2026-10-04 | Internal testing before any production promotion                                                                                                                                                                  |
| Firebase Analytics/Crashlytics default-ON before consent in EEA/UK, opt-out only (EX-analytics-consent option B) | justin.nguyen@appsindie.com                                               | 2026-10-13 | regulator/store flag, or the 1.1 privacy review                                                                                                                                                                   |

## After the release

- Day 7 / day 14 north-star comparison scheduled for: TBD

## New exceptions — 2026-10-13 re-run

### EX-ump-consent. No Google UMP consent before ad requests (EEA/UK)

- **Situation**: vc8/b21 call no `AdsConsent` API (`evidence/2026-10-13/ads-consent-facts.txt`). The AdMob Privacy & messaging message is configured in the console, but the app never asks UMP to show it, so EEA/UK users get ad requests with no consent record. The in-app "Ad choices & tracking" switch is a home-made non-personalized flag, not a certified CMP.
- **Options**: A — call `AdsConsent.gatherConsent()` on launch, request ads only when `canRequestAds`, replace the home-made switch with a "Privacy options" row shown when UMP reports it required; rebuild vc9/b22. B — ship vc8/b21 and fix in 1.0.1 (AdMob policy exposure for EEA/UK traffic until then).
- **Recommendation**: A. Sponsor chose A on 2026-10-13 ("Fix hết đi").
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin implements, sponsor verifies on device
- **Deadline**: 2026-10-15
- **Status**: open

### EX-analytics-consent. Firebase Analytics runs before any consent in EEA/UK

- **Situation**: `diagnosticsConsent.ts` starts Firebase Analytics + Crashlytics at first launch in every region (default ON, opt-out in Settings). UMP (EX-ump-consent) gates ad requests only, so in EEA/UK pseudonymous analytics identifiers are written before the user is asked anything. The store forms declare analytics/diagnostics as **Optional** because of the opt-out, which is true, but opt-out is not opt-in. Inference, not legal advice: EU ePrivacy rules generally treat non-essential analytics storage as needing prior consent.
- **Options**: A — in regions where UMP says consent is required, start Analytics with Consent Mode denied (`analytics().setConsent({analytics_storage:false, ad_storage:false, ad_user_data:false, ad_personalization:false})`, available in the installed `@react-native-firebase/analytics` 26.4.0) and grant it from the UMP result; Crashlytics stays default-ON with the opt-out (crash data, not linked); rides vc9/b22, no store-form change. B — keep default-ON + opt-out everywhere and record it as an accepted legal risk.
- **Recommendation**: A — small change in the same code PR, matches the UMP flow, and keeps the declarations true.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — sponsor decides; Devin implements A if chosen
- **Deadline**: 2026-10-15 (before the vc9/b22 build)
- **Status**: resolved 2026-10-13 — sponsor chose **B** ("B for simplicity"): default-ON + in-app opt-out everywhere; accepted legal risk (see Accepted risks)

### EX-waiver-signature. EX-native-sit-waiver / EX-failure-mode-waiver not signed by the sponsor

- **Situation**: Both waivers quote the sponsor's 2026-10-04 decision, but the records say "Human signature: pending". An unsigned waiver is agent-written, so READINESS cannot count those rows (SIT regression, Failure-mode cases, Third-party sandboxes) as closed.
- **Options**: A — sponsor comments on PR #25 "signed: EX-native-sit-waiver, EX-failure-mode-waiver". B — run device SIT now instead of waiving.
- **Recommendation**: A (the decision is already made; it only needs the human signature).
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — sponsor signs
- **Deadline**: 2026-10-17
- **Status**: resolved 2026-10-13 — sponsor confirmed in session chat, verbatim: "ko cần sít"

### EX-permission-gate-drift. AAB merged manifest has 16 permissions, allowlist 8; CI gate blind to library-injected permissions

- **Situation**: `bundletool dump manifest` on vc8 lists 16 permissions; `android-permissions.json` lists 8. The extras come from AdMob (AD_ID, ACCESS_ADSERVICES_AD_ID/ATTRIBUTION/TOPICS), Firebase (c2dm.RECEIVE, install-referrer) and a library FOREGROUND_SERVICE. `check-android-permissions.mjs` only reads the prebuild manifest, so CI passes (`evidence/2026-10-13/permissions-audit.txt`).
- **Options**: A — allowlist the ones the shipped SDKs use (with justification), strip the rest via `blockedPermissions`, add `check-aab-permissions.mjs` as a mandatory runbook step on the built AAB. B — allowlist all 16 as-is.
- **Recommendation**: A (B keeps permissions the app does not use, which Play may ask about).
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin implements, sponsor approves the allowlist in the code PR
- **Deadline**: 2026-10-15
- **Status**: open

### EX-att-e2e. ATT prompt not asserted by an E2E flow on clean launch

- **Situation**: The ATT request code exists and was seen once by hand on the simulator, but no Maestro flow hard-asserts the system prompt and the deny path, so a regression that skips the prompt (App Review 5.1.2) would pass CI.
- **Options**: A — add a clean-install iOS Maestro flow: reset ATT with `xcrun simctl privacy`, assert the prompt, tap "Ask App Not to Track", assert Home is usable; evidence in `docs/qa/evidence/att-2026-10-13/`. B — rely on the manual check.
- **Recommendation**: A.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin implements
- **Deadline**: 2026-10-15
- **Status**: open

### EX-ios-background-audio-mode. UIBackgroundModes=audio declared while sound pauses on background (App Review 2.5.4)

- **Situation**: Since PR #24 focus sound stops when the app goes to the background and `expo-audio` has `enableBackgroundPlayback: false`, but `expo config --type introspect` still shows `UIBackgroundModes: ["audio"]` (`evidence/2026-10-13/ios-config-introspect.txt`). Apple may reject a declared background mode the app does not use.
- **Options**: A — find the plugin that adds it and remove it (or add a final-order config plugin that filters it), verify by introspect, ship in b22. B — submit b21 with the mode and answer App Review if asked.
- **Recommendation**: A.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin implements
- **Deadline**: 2026-10-15
- **Status**: open

### EX-privacy-contact-email. Privacy policy page contact email

- **Situation**: Raw-HTML check found no email, but the page's "Contact Us" section does say info@appsindie.com; Cloudflare email obfuscation hid it from the scraper (`evidence/2026-10-13/legal-pages.txt`, correction).
- **Options**: —
- **Recommendation**: —
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — —
- **Deadline**: —
- **Status**: resolved 2026-10-13 — false positive

### EX-asc-iap-metadata. ASC IAPs plus.yearly + plus.lifetime MISSING_METADATA

- **Situation**: ASC read-back: `com.appsindie.focusloop.plus.yearly` and `com.appsindie.focusloop.plus.lifetime` are `MISSING_METADATA` (no localized display name/description, price or review screenshot). Apple will not review IAPs in this state, and an app with a paywall but no reviewable IAP fails guideline 2.1.
- **Options**: A — sponsor fills name/description, price ($19.99/yr with 7-day trial; $49.99 lifetime), review screenshot, and attaches both to version 1.0. B — submit 1.0 without IAP (paywall would not work in review).
- **Recommendation**: A.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — sponsor (console-only)
- **Deadline**: 2026-10-17
- **Status**: open

### EX-asc-version-setup. ASC 1.0: primary category null, no build attached

- **Situation**: ASC read-back for version 1.0 (`PREPARE_FOR_SUBMISSION`): primary category is null and no build is attached. The es-MX screenshot set was uploaded and verified on 2026-10-13 (`evidence/2026-10-13/store-screenshots-readback.json`).
- **Options**: A — sponsor sets Productivity and attaches b22 when it lands. B — attach b21 now (lacks the UMP / background-mode fixes).
- **Recommendation**: A.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — sponsor (category, build)
- **Deadline**: 2026-10-17
- **Status**: open

### EX-tablet-e2e. Tablet layouts T01–T06 not verified on a tablet device/orientation

- **Situation**: No E2E flow runs on an iPad simulator or Android tablet emulator, and the landscape Focus split (T04) has never been exercised, although the binary installs on tablets.
- **Options**: A — run the Maestro core flows on iPad 13" (portrait + landscape) and an Android 10" tablet, and add them to `LIVE_E2E_INDEX.md`. B — ship tablets unverified.
- **Recommendation**: A (done together with the tablet screenshot capture).
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin implements
- **Deadline**: 2026-10-17
- **Status**: open

### EX-owasp-checklist. No OWASP Mobile Top 10 / MASVS disposition per category

- **Situation**: The last security review (`docs/security/ads-integration-security-review.md`) predates the production AdMob IDs and the UMP change, and gives no per-category M1–M10 disposition.
- **Options**: A — refresh the review on the vc9/b22 code with one line per M1–M10 (applies / mitigated / n/a + evidence). B — accept the older review.
- **Recommendation**: A.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin writes, sponsor reads
- **Deadline**: 2026-10-17
- **Status**: open

### EX-dependency-triage. 28 outdated deps not triaged by major; npm audit 1 critical + 67 high untriaged

- **Situation**: `npm outdated` lists 28 packages; `npm audit` reports 79 (1 critical `shell-quote` via `react-devtools-core`, a dev-tool path not in the release bundle; 67 high; 11 moderate), none triaged per release-gate rule.
- **Options**: A — triage each major and each critical/high into upgrade / not-reachable (with path) / exception before Gate 3. B — carry them into 1.0.1.
- **Recommendation**: A.
- **Default if you say nothing**: block Gate 3.
- **Owner**: justin.nguyen@appsindie.com — Devin triages, sponsor accepts any residual
- **Deadline**: 2026-10-17
- **Status**: open

### EX-android15-taskbar-nav-icons. Android 15 three-button Taskbar icon contrast

- **Situation**: On Android 15 with 3-button navigation, the launcher Taskbar ignores the app's light-nav-bar flag for icon colour. When app and phone themes differ, the buttons follow the phone theme; measured contrast is 1.7:1. Android 16 and gesture navigation are unaffected.
- **Options**: A — accept the scoped platform limitation (recommended). B — follow the system theme (rejected; measured contrast is 2.1:1, still below 3:1).
- **Recommendation**: A — the limitation is confined to Android 15's 3-button Taskbar; option B also misses 3:1 contrast.
- **Default if you say nothing**: stays open and blocks Gate 3.
- **Owner**: justin.nguyen@appsindie.com
- **Deadline**: 2026-10-20
- **Status**: open (blocks Gate 3 pending Justin's acceptance)

## Resolved / non-gate items

### EX-AI-REVIEW-TIMEOUT. Claude review returned no verdict on PR #16

- **Status**: resolved 2026-10-05 — PR #16 was human-reviewed and merged (merge commit `67769eb`); later round reviews returned verdicts. Not a Gate 3 item, carries no default, removed from the summary table.

### EX-tablet-screenshots. iPad 13" and Android tablet screenshot sets

- **Resolution**: Published r2 and uploaded Play 7-inch and 10-inch screenshot buckets for all 20 locales on 2026-10-13; confirmed counts, order, dimensions, and downloaded image hashes. ASC and Play phone assets are byte-identical to r1, so they were not re-uploaded.
- **Supersession**: r1 was superseded because its rounded Android tablet screen corners clipped status-bar glyphs.
- **Evidence**: `evidence/2026-10-13/store-screenshots-readback.json`
- **Status**: resolved 2026-10-13
