---
name: expo-mobile-release-and-compliance
description: Wire an Expo app to the EAS release pipeline and keep its store compliance and rollout safety honest.
---

## Purpose

Wire an Expo app to the EAS Workflows release pipeline, and keep its store compliance and rollout safety honest. Use during Stage 2-3 of `!release_product`, and once per app when onboarding a new one.

## Day 0 — onboarding an app (once per app)

Onboarding is just the first release; everything after it is an upgrade, which is why it lives here and not in a playbook of its own. What blocks it is the portal work only a human can do.

| Task | Owner |
| --- | --- |
| App record in App Store Connect and in Google Play Console | **Human** — Apple exposes no `POST /v1/apps`, and Play needs an existing `packageName` plus one uploaded artifact |
| Apple Developer / Paid Apps agreements, tax and banking | **Human** — the pipeline fails fast on an unsigned agreement |
| Google Cloud service account and Play Console permissions | **Human** |
| `.p8` ASC key (`Key ID`, `Issuer ID`, `Team ID`), `EXPO_TOKEN`, `NODE_AUTH_TOKEN` as org secrets | **Human** — the `.p8` is global to the Apple team |
| Repo wiring below, with `ascAppId`, bundle ID and package adapted | Devin |
| Apple bundle ID when missing (`POST /v1/bundleIds`; the app record must exist first) | Devin |
| iOS distribution certificate and profile (`eas credentials:configure-build -p ios -e production`) | Devin |
| EAS environment variables, then one Android test build to prove the pipeline | Devin |

Preflight every release the same way — `GET /v1/bundleIds`, `GET /v1/apps`, a Play edits check — and when something is missing, stop and name exactly what the human must create in the portal.

## Pipeline shape

The CI pipeline does the deterministic part: set version from the branch, build the right profile, submit the binary to internal testing. Everything requiring judgement (preflight, credentials, recovery, promotion) sits outside it.

| Branch pattern | Workflow | Profile | Submit target |
| --- | --- | --- | --- |
| `release/X.Y.Z`, `releases/*-X.Y.Z` | `.eas/workflows/release.yml` | `production` | Play internal / TestFlight `Internal Testers` |
| `preview/X.Y.Z`, `sit/*` | `.eas/workflows/preview.yml` | `preview` | Play internal / TestFlight `SIT Testers` |

Repository artifacts the app must carry:

```
.eas/workflows/preview.yml        build + submit for SIT      (omit when the app has no backend)
.eas/workflows/release.yml        build + submit for RC
.github/workflows/trigger-eas.yml npm ci -> set version -> eas workflow:run  (needs EXPO_TOKEN)
eas.json                          profiles + ascAppId, bundle ID, package, EXPO_ASC_*
scripts/set-version-from-branch.js  parses X.Y.Z from the branch, sets expo.version
scripts/write-store-credentials.sh  materialises credentials from env at build time
plugins/withAndroidLintFix.js     registered in app.json
```

EAS environment variables per environment (`production`, plus `preview` when there is a SIT backend): `ANDROID_SERVICE_ACCOUNT_JSON`, `IOS_STORE_CONNECT_P8`, `NODE_AUTH_TOKEN`, `EXPO_APPLE_ID`.

## Operating rules

- `autoIncrement: true` with `appVersionSource: "remote"`, so every submit gets a unique `versionCode` / `buildNumber`.
- `fingerprint` + `get-build` before building, so unchanged native code is not rebuilt.
- Keep `submit.preview` (SIT) and `submit.internal` (release candidate) separate — their tester groups differ.
- The pipeline uploads a binary and nothing else: it does not create apps, sign agreements, or write store copy.
- Internal testing must pass before production promotion, and **promotion to the production store is a human action**.
- Permissions and privacy declarations must match what the app actually does; a behaviour change that touches data means the declarations change in the same release.
- A release with non-trivial risk needs a phased rollout and a rollback plan with trigger conditions before it ships.
- Never commit `serviceAccount.json`, `*.p8`, or any store credential; they come from the CI secret store.
- Never delete an iOS distribution certificate or provisioning profile without a restore plan.
- Store listing copy, keywords and screenshots are not release work: they belong to `!gtm_aso`.

## Recovery

Build failures are investigated from the workflow logs and retried; a third-party library that breaks on a newer Xcode is patched with `patch-package` and the patch is committed. Anything requiring a portal action (agreements, app records, permissions) is escalated via the `escalation` skill, naming the exact thing the human must click.

## Related

- `release` — owns rollout mechanics, progressive rollout and rollback.
- `production-readiness` — Gate 3 checks; store compliance rows are verified there.
- `escalation` — how portal blockers reach the human.
