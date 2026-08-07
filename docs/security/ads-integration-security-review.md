# Ads and Firebase Integration Security Review

## Scope

This review covers the integration added in this slice:

- Firebase project configuration (`google-services.json` / `GoogleService-Info.plist`)
- AdMob via `react-native-google-mobile-ads` through `@appsindie/react-native-ads`
- iOS App Tracking Transparency (`expo-tracking-transparency`)
- `.npmrc` GitHub Packages authentication for `@appsindie` scope

## What changed and why

Focus Loop needs monetization with banner and interstitial ads. The chosen implementation
uses the internal `@appsindie/react-native-ads` wrapper around `react-native-google-mobile-ads`.
Firebase config files were added for Google Mobile Ads / Analytics initialization. Ad unit
IDs are configured as code constants and are public identifiers by design (they ship with
the binary).

## Threat model

### 1. Disclosure

- **Firebase API keys** in `google-services.json` and `GoogleService-Info.plist` are
  client-side public keys. They are required by the SDK and are not server secrets.
- **AdMob App IDs and ad unit IDs** are public identifiers.
- **GitHub Packages token** is referenced as the `NODE_AUTH_TOKEN` environment variable in
  `.npmrc`; the token itself is never committed.
- **iOS / Android app secrets** (e.g. `GoogleService-Info.plist` `API_KEY`) are not
  encryption keys; they only identify the Firebase project.

### 2. Replay

- The Firebase SDKs use certificate pinning and App Check where available. We are not
  implementing custom auth flows, so replay of API keys is not a meaningful attack.
- `react-native-google-mobile-ads` ad requests are signed by Google on the client and
  verified by AdMob servers.

### 3. Escalation

- Ads SDKs can load arbitrary third-party content. We mitigate this by:
  - Using Google’s official SDK with default ad content rating filters.
  - Requesting non-personalized ads when the user denies tracking.
  - Never passing local user data (focus sessions, history) to the ad SDK.

### 4. Cross-tenant

- Firebase project `focus-loop-3db4a` and bundle/package `com.appsindie.focusloop` are
  scoped to this app. No multi-tenant data exists in the app.

## Findings

| ID | Severity | Finding | Resolution |
|---|---|---|---|
| F01 | LOW | Ad SDK errors are not surfaced in the UI. | All SDK load/show errors are swallowed/ignored by the wrapper and the app continues. |
| F02 | LOW | ATT permission is requested one second after app start. | This is the standard placement; the copy is configured in `app.json`. No PII is collected before permission. |
| F03 | LOW | Test AdMob IDs are committed. | They are replaced at release time with production IDs via `app.json` and `src/features/ads/adsConfig.ts`. |

## Outcome

**PASS** with non-HIGH findings.

The integration introduces no server-side secrets, no user PII flow, and relies on Google's
official mobile SDKs. The remaining work before release is to replace test AdMob App IDs and
ad unit IDs with production values and run native device QA.
