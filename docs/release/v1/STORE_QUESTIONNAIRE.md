# Store Questionnaire — Focus Loop v1.0.0

Answer pack for the store-console questionnaires (Play "App content" + App Store
Connect). Every answer is traced to the repo or a live console read on
2026-10-13. `[HUMAN]` = only the sponsor can supply or confirm it.
This file is the **single source** for every console answer; `STORE_DECLARATIONS.md`
is now a pointer here. Live console state and drift: `STORE_COMPLIANCE.md`.

**Diagnostics consent (what "Optional" means below).**
`src/features/analytics/diagnosticsConsent.ts` gates **Firebase Analytics and
Firebase Crashlytics** (`setAnalyticsCollectionEnabled` /
`setCrashlyticsCollectionEnabled`). It is **ON by default** at first launch (no
stored pref → `true`) and the user can turn it off in Settings → "Crash & usage
reports"; the choice persists under `focus-loop/diagnostics-consent`. It does
**not** gate AdMob. So: crash logs and diagnostics = Optional (user can opt
out); app interactions and device IDs = Required, because AdMob collects them
regardless of the toggle (only the Firebase share of them stops). There is no opt-in screen; whether EEA/UK should get opt-in for Analytics is the open decision EX-analytics-consent in `EXCEPTION_REPORT.md` (if option A ships, these answers stay the same).

App identity: `com.appsindie.focusloop` (iOS + Android), ASC app `6818991496`,
EAS `592916ef-5e3c-4257-b853-cbcf0d21aa78`, AdMob
`ca-app-pub-9324885420924703~9653900797` (Android) / `~3266907687` (iOS).
Binaries to promote: Android **vc8**, iOS **build 21**.

---

## Google Play Console

### Privacy policy

| Question           | Answer                                                     | Evidence                                                               |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| Privacy policy URL | `https://www.appsindie.com/docs/legal/focus-loop/privacy/` | `src/features/settings/about.ts` `PRIVACY_URL`; HTTP 200 on 2026-10-13 |

### App access

| Question                                            | Answer                                   | Evidence                                                 |
| --------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| All functionality available without special access? | **Yes** — no sign-in, no restricted area | No auth SDK in `package.json`; no login screen in `src/` |
| Account deletion                                    | **n/a — no accounts**                    | Same                                                     |

### Ads

| Question                   | Answer  | Evidence                                                                                                                           |
| -------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Does your app contain ads? | **Yes** | `react-native-google-mobile-ads` plugin in `app.json`; home banner, end-of-loop interstitial, rewarded video (`src/features/ads/`) |

### Advertising ID

| Question                          | Answer                                      | Evidence                                      |
| --------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Does your app use advertising ID? | **Yes**                                     | `AD_ID` merged from the Google Mobile Ads SDK |
| Purposes                          | **Advertising or marketing**, **Analytics** | AdMob + Firebase Analytics                    |

### Content rating (IARC) — expected **Everyone / PEGI 3**

| Question                                                                    | Answer                                             | Evidence                                                                                    |
| --------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Category                                                                    | **Utility, productivity, communication, or other** | Focus timer                                                                                 |
| Violence, sexual content, profanity, drugs, alcohol/tobacco, gambling, hate | **No** to all                                      | No such content                                                                             |
| Users can interact / exchange content                                       | **No**                                             | Parked thoughts stay on-device; share card goes through the OS share sheet (`expo-sharing`) |
| Shares user's location with other users                                     | **No**                                             | No location permission                                                                      |
| Allows purchase of digital goods                                            | **Yes**                                            | Focus Loop Plus (`expo-iap`)                                                                |
| Web browsing                                                                | **No**                                             | `expo-web-browser` opens only fixed legal/studio links (`about.ts`)                         |

### Target audience and content

| Question             | Answer                                 | Evidence                                                  |
| -------------------- | -------------------------------------- | --------------------------------------------------------- |
| Target age groups    | **18+ only** — tick no child/teen band | Product spec targets adults with ADHD / knowledge workers |
| Appeals to children? | **No**                                 | Not child-directed                                        |

### Data safety

Form-level: **collects data: Yes** · **shares data: Yes (Google — AdMob)** ·
**encrypted in transit: Yes** · **deletion request**: no account — all app data
is on-device; Settings → "Your data" wipes it in-app, uninstall clears it;
contact `info@appsindie.com`.

Rows reconciled with Google's published "Data safety section for the Google
Mobile Ads SDK" disclosure (IP address → approximate location, app
interactions, crash logs, diagnostics, advertising ID — shared for
advertising).

| Data type                                                                                     | Collected | Shared                                  | Purpose                      | Optional?                                         | Evidence                                                                                            |
| --------------------------------------------------------------------------------------------- | --------- | --------------------------------------- | ---------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Location → **Approximate location**                                                           | Yes       | **Yes** (Google Mobile Ads, IP-derived) | Advertising                  | Required                                          | GMA SDK disclosure; no location permission — **Precise location = No**                              |
| App activity → **App interactions**                                                           | Yes       | **Yes** (Google Mobile Ads)             | Analytics, Advertising       | Required                                          | `src/features/analytics/events.ts` — 15 coarse events (session/goal/ad/paywall/trial), no free text |
| App info & performance → **Crash logs**                                                       | Yes       | **Yes** (Google Mobile Ads)             | Analytics, App functionality | **Optional** — Settings → "Crash & usage reports" | `diagnosticsConsent.ts` → `setCrashlyticsCollectionEnabled`                                         |
| App info & performance → **Diagnostics**                                                      | Yes       | **Yes** (Google Mobile Ads)             | Analytics, App functionality | Optional — same toggle                            | Same                                                                                                |
| Device or other IDs                                                                           | Yes       | **Yes** (Google Mobile Ads)             | Advertising, Analytics       | Required                                          | `AD_ID`; Firebase app-instance id                                                                   |
| Financial info → **Purchase history**                                                         | Yes       | No                                      | App functionality            | Required                                          | Play Billing via `expo-iap`; app reads entitlement only                                             |
| Personal info, messages, photos/videos, audio, files, calendar, contacts, health, web history | **No**    | No                                      | —                            | —                                                 | No accounts/forms; mic blocked (`expo-audio` `microphonePermission:false`); no media permissions    |

### Other declarations

| Section            | Answer                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Government app     | **No**                                                                                                                     |
| Financial features | **No** (Play Billing IAP is not a financial feature)                                                                       |
| Health apps        | **No health features** — productivity timer; "ADHD" in copy is audience positioning, the app makes no medical/health claim |
| News app           | **No**                                                                                                                     |
| Foreground service | Not asked any more — vc8 declares no typed foreground service                                                              |

### Category & contact

| Field        | Answer                        |
| ------------ | ----------------------------- |
| App category | **Productivity** (type: App)  |
| Tags         | Productivity, Time management |
| Email        | `info@appsindie.com`          |
| Website      | `https://www.appsindie.com`   |
| Phone        | `[HUMAN]` optional            |

### Monetization (live read 2026-10-13)

| Product                                                                  | Play state | Action                                                             |
| ------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------ |
| `com.appsindie.focusloop.plus.yearly` (subscription, base plan `yearly`) | ACTIVE     | `[HUMAN]` confirm $19.99 + 7-day free-trial offer on the base plan |
| `com.appsindie.focusloop.plus.lifetime` (one-time)                       | exists     | `[HUMAN]` confirm $49.99 + active purchase option                  |

---

## App Store Connect

### App information

| Field              | Answer                                                                                  | Live state                  |
| ------------------ | --------------------------------------------------------------------------------------- | --------------------------- |
| Primary category   | **Productivity**                                                                        | **NOT SET** — blocks submit |
| Secondary category | leave empty (Health & Fitness invites health-claim scrutiny)                            | not set                     |
| Privacy policy URL | `https://www.appsindie.com/docs/legal/focus-loop/privacy/`                              | —                           |
| Content rights     | **No** third-party content (sounds are generated in-repo, `scripts/generate-sounds.py`) | —                           |

### Age rating — expected **4+**

| Question                                                                                    | Answer                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Violence, sexual/nudity, profanity, horror, drugs/alcohol, gambling, contests, medical info | **None / No**                                  |
| User-generated content, messaging/chat                                                      | **No**                                         |
| Unrestricted web access                                                                     | **No** — in-app browser opens fixed links only |
| Advertising                                                                                 | **Yes** (third-party ads)                      |
| Parental controls / age assurance                                                           | **No**                                         |

### App Privacy (nutrition labels)

| Data type                                       | Purposes                           | Linked to user | Used for tracking              |
| ----------------------------------------------- | ---------------------------------- | -------------- | ------------------------------ |
| Identifiers → Device ID                         | Third-party advertising, Analytics | Yes            | **Yes** (IDFA after ATT allow) |
| Usage Data → Product Interaction                | Analytics                          | Yes            | No                             |
| Usage Data → Advertising Data                   | Third-party advertising            | Yes            | **Yes**                        |
| Location → Coarse Location (IP, by AdMob)       | Third-party advertising            | No             | No                             |
| Diagnostics → Crash Data, Other Diagnostic Data | App functionality, Analytics       | No             | No                             |
| Purchases → Purchase History                    | App functionality                  | Yes            | No                             |

ATT prompt: `@appsindie/react-native-ads` `useAdsPermission` in
`src/features/ads/AdsProvider.tsx`; denied → `requestNonPersonalizedAdsOnly`.
`NSUserTrackingUsageDescription` = "This identifier will be used to deliver
personalized ads to you."

### Encryption / IDFA / review info

| Question              | Answer                                                                                                                                                                | Evidence                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Non-exempt encryption | **No**                                                                                                                                                                | `ITSAppUsesNonExemptEncryption: false` |
| Uses IDFA             | **Yes** — serve ads + attribute ad actions                                                                                                                            | GMA SDK + ATT                          |
| Sign-in required      | **No** — notes: "All features work without an account. Plus is unlocked via in-app purchase; locked colours can also be tried for 24 h by watching a rewarded video." | —                                      |
| Contact               | Justin Nguyen, `info@appsindie.com`, phone `[HUMAN]`                                                                                                                  | —                                      |

### In-app purchases (live read 2026-10-13)

| Product                                                         | ASC state            | Missing                                                                                                     |
| --------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `com.appsindie.focusloop.plus.yearly` (group "Focus Loop Plus") | **MISSING_METADATA** | `[HUMAN]` price $19.99, 7-day free intro offer, en-US display name/description, review screenshot (paywall) |
| `com.appsindie.focusloop.plus.lifetime` (non-consumable)        | **MISSING_METADATA** | `[HUMAN]` price $49.99, display name/description, review screenshot                                         |

Both must be attached to version 1.0 ("In-App Purchases and Subscriptions"
section) before submitting — first IAPs are reviewed together with the app.
Paywall already shows Terms + Privacy links (`PaywallScreen.tsx`) as 3.1.2
requires; add the Terms URL `https://www.appsindie.com/docs/legal/focus-loop/tnc/`
to the "License Agreement" field or the description.

---

## Outstanding human actions (in submit order)

1. ASC → App Information → **set primary category Productivity**.
2. ASC → both IAPs: fill price, localization, review screenshot → state "Ready to Submit"; attach to v1.0.
3. ASC → App Privacy + Age Rating per tables above; select build 21 → Submit for review.
4. Play → App content: ads, advertising ID, content rating, target audience 18+, data safety, health = none.
5. Play → confirm yearly trial offer + lifetime purchase option active → Production → release from internal **vc8**.
