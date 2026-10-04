# Release Notes — Focus Loop v1.0.0

## Document control

- **Version**: v1.0.0 (store-facing marketing version; build numbers auto-increment via `appVersionSource: remote`)
- **Date**: 2026-10-04
- **Platforms**: iOS | Android
- **Release owner**: justin.nguyen@appsindie.com
- **Release PR**: this PR (`release/1.0.0` → `main`)
- **Gate 3 exception report**: `docs/release/v1/EXCEPTION_REPORT.md`

## Summary (user impact)

- First public release of Focus Loop: a calm Pomodoro-style focus timer — "one thing, then a break" — with a weekly focus goal replacing streaks.
- Free with light ads (home banner + an end-of-loop interstitial, capped server-side in the AdMob console); Focus Loop Plus removes ads and unlocks all themes/sounds.

## What's new

- J1–J10 complete (canvas `1791071241-7cd3`):
  - First-launch display choice — Disc or Numbers — with ATT consent before any ad request.
  - Focus loop engine: N × (focus + break) + long break, pause/resume, end-early with keep/save/discard closeout.
  - Weekly goal 4-of-7-days on the Home screen.
  - Step-boundary local notifications + Live Activity (iOS) / ongoing notification + home-screen widgets (iOS + Android).
  - App-kill recovery with welcome-back resume.
  - Focus Loop Plus: yearly $19.99 (7-day free trial) or lifetime $49.99 via `expo-iap`; rewarded-ad 24-hour trials for individual themes/sounds.
  - Reminders (per-day schedule + evening note), share-card export, parked thoughts, CSV data export / full reset in "Your data".
  - 19 locales (Tier 1 + Tier 2 incl. ar/hi), dark/system appearance, tablet layouts ≥600pt, portrait lock on phones.

## Fixes

- First native build surfaced four defects, all fixed in this cycle: widget extension `Info.plist`, duplicate `FocusLoopActivityAttributes` across app/extension targets, upstream `expo-store-review@57.0.3` `SceneGeometry` compile error (patched via `patch-package`), and a focus-sound asset path bug.

## Breaking changes

- None — first release; the prior pilot never shipped.

## Known issues

- iOS Simulator-only SIT: physical-device behaviours (haptics, real push delivery, lock-screen Live Activity, IAP sandbox purchase) are unexercised — waived for this release by the sponsor (see EXCEPTION_REPORT RR-01/RR-02).
- `expo-store-review` upstream bug carried as a committed `patch-package` patch; drop it when an SDK-57-compatible release ships.
- Web preview has secondary-button click regressions; not a release surface (`docs/qa/v1-e2e-test-report.md`).

## Rollout, monitoring, rollback

- Rollout: phased — internal testing first (TestFlight internal + Play internal track), then staged production rollout decided at promotion.
- Monitoring: Crashlytics crash-free sessions ≥ 99.9%, Android ANR < 0.3%, ad load-failure < 5% (`docs/release/SLO_AND_ALERTING.md`).
- Rollback: staged-rollout halt + hotfix forward (`docs/release/RUNBOOK_mobile.md`); binaries cannot be recalled.
- Alert/dashboard wiring is console-side work tracked in RR-05..RR-08 — open at this PR's merge.

## Compliance / store notes

- Legal pages live at `www.appsindie.com/docs/legal/focus-loop/{privacy,tnc,disclaimer,licenses}/`; in-app links resolve through `src/features/settings/about.ts`.
- ATT prompt precedes ad requests; privacy/data-safety declarations (RR-10/RR-12) are console-side, pending.
- IAP products `com.appsindie.focusloop.plus.{yearly,lifetime}` — App Store Connect side created by sponsor; Play side unblocks after the first AAB upload (RR-14).

## Traceability

- Cycle: shaping + build PR #4 (merged 2026-10-04); this release PR carries the release pipeline and readiness docs.
- Requirements: `docs/product/PRODUCT_SPEC_LIVE.md` J1–J10.
- Tests: `npm run verify` — tsc + eslint + jest (297 tests / 37 suites) + prettier; iOS Simulator SIT pass (RR-01 evidence); web E2E report `docs/qa/v1-e2e-test-report.md`.
- Reviews: 14 rounds on PR #4, final `ai-review-pass`; release-review routine on this PR.
