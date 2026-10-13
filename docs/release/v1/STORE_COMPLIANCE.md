# Store Compliance — Focus Loop v1.0.0

Two passes per `.agents/skills/production-readiness/assets/store-compliance.md`.
Pass A is read from the repo and the built binary; Pass B is read back from the consoles.
Run 2026-10-13 by Devin. Raw evidence: `docs/release/v1/evidence/2026-10-13/` (each file
carries its UTC timestamp and the exact command). Read-back scripts:
`scripts/store-readback/asc-read.mjs`, `scripts/store-readback/play-read.mjs`.

Binaries under review: **Android versionCode 8** (`apps/mobile/build-vc8.aab`, Play internal)
and **iOS build 21** (TestFlight, `VALID`). The b21 IPA is not on disk, so iOS Info.plist
facts come from `npx expo config --type introspect` at the b21-equivalent config
(`ios-config-introspect.txt`) — marked _(config)_ where used.

## Applicability

| Question                                  | Answer                                                                                 | Makes live                                |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| Platforms shipping                        | both                                                                                   | Apple + Play sections                     |
| Ads in the build?                         | yes — banner, interstitial, rewarded (AdMob)                                           | Ads and AdMob                             |
| In-app purchase or subscription?          | yes — `plus.yearly` subscription, `plus.lifetime` one-time                             | Business rows                             |
| Accounts / sign-in?                       | no                                                                                     | Account deletion rows → n/a (no accounts) |
| Directed to children (or mixed audience)? | no — 18+ target audience                                                               | Families rows → n/a                       |
| Collects any personal data?               | yes — device/ad IDs, app activity, diagnostics, IP-derived approximate location (SDKs) | Privacy rows                              |

---

# Pass A — Metadata check (repo + binary)

## Apple — App Review Guidelines

| Ref       | Check                                                      | Result                | Evidence                                                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1       | App completeness — build, IAPs reviewable                  | **fail**              | b21 `VALID`; both IAPs `MISSING_METADATA`, no build attached to 1.0 (`asc-readback.json`) → `EX-asc-iap-metadata`, `EX-asc-version-setup`                                                                                                  |
| 2.3.1     | Metadata accurate, no hidden features                      | pass                  | `docs/product/store_metadata/*.md` vs `PRODUCT_SPEC_LIVE.md`                                                                                                                                                                               |
| 2.3.7/8   | Name/subtitle/keywords within limits; icon 1024², no alpha | pass                  | `assets/icon.png` 1024px, `hasAlpha: no` (sips)                                                                                                                                                                                            |
| 2.3.10    | No other-platform references                               | pass                  | listing copy reviewed in PR #18                                                                                                                                                                                                            |
| 2.5.4     | Background modes only for audible background use           | **fail (next build)** | `UIBackgroundModes: ["audio"]` _(config)_. b21 still plays sound in background (pre-PR #24) → consistent for b21. HEAD pauses sound on background, so the mode must be stripped before the next iOS build → `EX-ios-background-audio-mode` |
| 3.1.1     | Digital unlocks via StoreKit; restore present              | pass                  | `expo-iap`; Settings → Restore purchases                                                                                                                                                                                                   |
| 4.2 / 4.3 | Minimum functionality, not spam                            | pass                  | timer, loops, weekly goal, widgets                                                                                                                                                                                                         |
| 5.1.1     | Privacy policy reachable; covers every declared type       | **fail (minor)**      | URL HTTP 200, covers AdMob/Firebase/IP location/ad IDs; **no contact email on the page** (`legal-pages.txt`) → `EX-privacy-contact-email`                                                                                                  |
| 5.1.1(v)  | Account deletion                                           | n/a                   | no accounts; "Your data" reset in Settings                                                                                                                                                                                                 |
| 5.1.2     | ATT before tracking use of IDFA                            | pass _(source)_       | iOS banner gate waits on ATT result (`ads-consent-facts.txt`). E2E assertion missing — see Ads                                                                                                                                             |

## Apple — HIG / marketing

| Check                                | Result | Evidence                                   |
| ------------------------------------ | ------ | ------------------------------------------ |
| Launch screen matches first screen   | pass   | splash = brand bg #141210                  |
| Screenshots real UI, current version | pass   | captured from b21 / vc7, `STORE_ASSETS.md` |
| App Preview                          | n/a    | none uploaded                              |
| App Store badge / Apple marks        | n/a    | no badge in app or listing                 |

## Google Play — Developer Program Policy

| Check                                                       | Result         | Evidence                                                                                                                                                                                                                                   |
| ----------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data safety matches collection incl. SDKs                   | pass (answers) | `STORE_QUESTIONNAIRE.md` §Data safety — single source; includes approximate location (AdMob IP)                                                                                                                                            |
| Declared data types match privacy policy                    | pass           | `legal-pages.txt` quotes                                                                                                                                                                                                                   |
| Permissions minimal and justified                           | **fail**       | AAB has **16** `uses-permission`, allowlist `android-permissions.json` has **8**; CI `verify:permissions` passes because it audits the prebuild manifest, not the Gradle-merged one (`permissions-audit.txt`) → `EX-permission-gate-drift` |
| `AD_ID` declared when advertising ID used                   | pass           | `com.google.android.gms.permission.AD_ID` in vc8 manifest; Advertising ID form = Yes                                                                                                                                                       |
| Target API level                                            | pass           | targetSdk 36 / minSdk 24 (RN 0.86 defaults, no override in `expo-build-properties`)                                                                                                                                                        |
| Listing accurate, no price/promo keywords                   | pass           | `store_metadata/*.md`                                                                                                                                                                                                                      |
| Screenshots/icon/feature graphic meet spec, from this build | pass           | 1080×1920 ×6, 1024×500, 512 icon, `STORE_ASSETS.md`                                                                                                                                                                                        |
| Account deletion in-app + web URL                           | n/a            | no accounts                                                                                                                                                                                                                                |
| Content rating answers match content                        | pass (answers) | `STORE_QUESTIONNAIRE.md` §Content rating                                                                                                                                                                                                   |
| Foreground service declaration                              | pass           | `FOREGROUND_SERVICE_MEDIA_PLAYBACK` removed (PR #24); vc8 has bare `FOREGROUND_SERVICE` only, no `foregroundServiceType` service                                                                                                           |

## Ads and AdMob

| Check                                                  | Result         | Evidence                                                                                                                                                      |
| ------------------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ATT prompt asserted by E2E on clean launch + deny path | **fail**       | no Maestro flow asserts the prompt (`ads-consent-facts.txt`) → `EX-att-e2e`                                                                                   |
| `NSUserTrackingUsageDescription` specific              | pass           | "This identifier will be used to deliver personalized ads to you." _(config)_                                                                                 |
| **UMP consent before ad requests (EEA/UK)**            | **fail**       | no UMP / `AdsConsent` call in app or `@appsindie/react-native-ads`; Mobile Ads SDK initialises on provider mount (`ads-consent-facts.txt`) → `EX-ump-consent` |
| Nutrition labels declare IDFA + Used for Tracking      | pass (answers) | `STORE_QUESTIONNAIRE.md` §App Privacy                                                                                                                         |
| SKAdNetwork IDs                                        | pass           | 49 `SKAdNetworkItems` _(config)_                                                                                                                              |
| Play data safety declares ad data                      | pass (answers) | `STORE_QUESTIONNAIRE.md`                                                                                                                                      |
| Ad placement / density                                 | pass           | `docs/security/ads-integration-security-review.md`; rules `appsindie-mobile-ads-request-lifecycle` (no interstitial on open, banner outside controls)         |
| Child-directed config                                  | n/a            | not child-directed; no `tagForChildDirectedTreatment`                                                                                                         |

## Privacy artifacts

| Check                                              | Result            | Evidence                                                                                                         |
| -------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `PrivacyInfo.xcprivacy` incl. required-reason APIs | pass _(by build)_ | Expo SDK 57 generates the app manifest; Firebase/GMA pods ship their own. Not re-read from b21 (IPA not on disk) |
| Privacy policy current, covers declared types      | fail (minor)      | see 5.1.1 — contact email missing                                                                                |

**Diagnostics consent (what "Optional" means).** `apps/mobile/src/features/analytics/diagnosticsConsent.ts`
gates **Firebase Analytics and Firebase Crashlytics** only. Default is **ON** at first launch
(absent pref → `true`); the user can turn it off in Settings → "Crash & usage reports". It does
not gate AdMob. Store forms therefore mark crash logs, diagnostics and Firebase-sourced app
interactions **Optional** (user can opt out), and device/ad IDs, AdMob app interactions and
approximate location **Required** (no in-app off switch beyond ATT/ad choices).

---

# Pass B — Store verification (read back 2026-10-13)

## App Store Connect (`asc-readback.json`)

| Item                           | Live value                                                                                           | Matches Pass A?                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------ |
| App name, subtitle, promo text | 20 localizations on version 1.0                                                                      | yes                            |
| Description / what's-new       | present, 20 localizations                                                                            | yes                            |
| Screenshots per locale         | 19 locales × 6 `APP_IPHONE_67`; **es-MX: no set**                                                    | **no** → drift D1              |
| Privacy nutrition labels       | not exposed by API — manual; not yet submitted (human)                                               | open → `EX-store-declarations` |
| Age rating questionnaire       | every `ageRatingDeclaration` field `null`                                                            | open → `EX-store-declarations` |
| Primary category               | `null`                                                                                               | open → `EX-asc-version-setup`  |
| Export compliance              | build 21 `usesNonExemptEncryption: false`                                                            | yes                            |
| Agreements, tax, banking       | account-level, active (human confirmation 2026-10-11)                                                | yes                            |
| Build attached to 1.0          | **none** (b21 `VALID` in TestFlight)                                                                 | open → `EX-asc-version-setup`  |
| IAP                            | yearly `MISSING_METADATA` (prices set, 1 localization); lifetime `MISSING_METADATA` (1 localization) | open → `EX-asc-iap-metadata`   |
| Prior rejections               | `reviewSubmissions: []`, no rejected history                                                         | yes (none)                     |

## Google Play Console (`play-readback.json`; edit opened and deleted, HTTP 204)

| Item                               | Live value                                                        | Matches Pass A?                |
| ---------------------------------- | ----------------------------------------------------------------- | ------------------------------ |
| Listing title / short / full       | 20 locales                                                        | yes                            |
| Screenshots, feature graphic, icon | 20/20 locales × (6 phone + 1 feature + 1 icon)                    | yes (after D2 fix)             |
| Data safety form                   | not exposed by API — manual; not yet submitted (human)            | open → `EX-data-safety`        |
| Content rating certificate         | manual; not yet issued                                            | open → `EX-store-declarations` |
| Target audience + ads declaration  | manual; not yet submitted                                         | open → `EX-store-declarations` |
| App access                         | no login — "All functionality available without special access"   | n/a                            |
| Privacy policy URL in console      | manual                                                            | open → `EX-store-declarations` |
| Track / rollout                    | internal: vc8 `completed`, release notes 20 languages             | yes                            |
| Subscription `plus.yearly`         | base plan `yearly` `ACTIVE`, **offers: [] (no 7-day free trial)** | **no** → drift D3              |
| One-time `plus.lifetime`           | purchase option `ACTIVE`                                          | yes                            |

## Drift found

| #   | Item                   | Pass A said                                       | Store holds                                                                                | Corrected where                                                                  | Fixed by                                                          |
| --- | ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| D1  | ASC screenshots es-MX  | every listing locale has a set                    | es-MX localization, no screenshot set                                                      | ASC upload of the `es` set to es-MX                                              | Devin — open, tracked in `EX-asc-version-setup`                   |
| D2  | Play es-419 listing    | 20 locales with notes + assets                    | es-419 had no release notes / images                                                       | Play API 2026-10-13: vc8 notes (from `es`), 6 screenshots, feature graphic, icon | Devin — **corrected**; re-read shows 20/20 (`play-readback.json`) |
| D3  | Play yearly free trial | 7-day free trial (`PRODUCT_SPEC_LIVE.md` pricing) | base plan with no offers                                                                   | Play Console → Subscriptions → yearly → add free-trial offer                     | Justin — open, `EX-console-products`                              |
| D4  | Declaration answers    | `STORE_QUESTIONNAIRE.md`                          | `STORE_DECLARATIONS.md` (older) lacked approximate location and had no diagnostics default | `STORE_DECLARATIONS.md` reduced to a pointer                                     | Devin — **corrected** in PR #25                                   |

### es-419 upload record (D2)

- **When:** 2026-10-13 (Play Developer API v3, one edit, committed).
- **What:** `es-419` release notes for versionCode 8 internal release = `es` "What's new" text;
  6 `phoneScreenshots`, `featureGraphic`, `icon` = the `es` renders of asset set
  `store-assets/focus-loop/v1` (reuse; es-419 has no separate caption file).
- **Verified by:** independent read-back `play-readback.json` — es-419 present in listings,
  images 6/1/1, internal track release notes 20 languages.

---

## Verdict

- **Pass A**: run · 31 rows · passed 23 · failed 5 (2.1, 2.5.4-next-build, permissions, ATT E2E, UMP) · n/a 8
- **Pass B**: run · 21 rows · matched 11 · drift 2 open (D1, D3) · 8 open console items (human)
- **Drift items found / corrected**: 4 / 2
- **Exceptions raised**: `EX-ump-consent`, `EX-permission-gate-drift`, `EX-att-e2e`, `EX-ios-background-audio-mode`, `EX-asc-iap-metadata`, `EX-asc-version-setup`, plus existing `EX-store-declarations`, `EX-data-safety`, `EX-console-products`
- Store compliance verdict: **`not ready`** — UMP and the permission gate need code + new builds (vc9 / b22); console items are human.
