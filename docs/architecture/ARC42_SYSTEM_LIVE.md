# Focus Loop — Architecture (arc42-lite), v2 draft

Re-shaped on hi-fi design canvas `1791071241-7cd3` (2026-10-03): the unit is now a **loop** (N × focus+break + long break), streaks are replaced by a **weekly goal**, and monetisation adds **Focus Loop Plus** (IAP) beside ads.

## 1. Introduction and Goals

**Business goals**

- Ship a no-account Pomodoro loop for iOS + Android within 6 build + 2 validation weeks.
- Prove the portfolio slot: Month-9 net monthly contribution >= $2,000 (ad ARPU + Plus) and D30 retention >= 42%.

**Quality goals**

- Offline-first core timer; no backend needed for MVP.
- Sub-1.5-second cold start.
- Accurate timer even when backgrounded.
- Reusable timer engine and widget architecture _if_ it can be achieved without extra abstraction; I04 Routine Clock is not a committed consumer until it clears its own Gate 0.

**Stakeholders**

- Product owner: justin.nguyen@appsindie.com
- End users: ADHD adults, remote workers, students.
- Reviewer: Claude Code shaping routine.

## 2. Architecture Constraints

- **Technical**: React Native / Expo managed workflow; no native modules except where unavoidable (notifications, ad SDK, Android AccessibilityService).
- **Organizational**: Ads-first unit economics; no AI cost in base case.
- **Regulatory/privacy**: No account or PII; analytics pseudonymised; ATT opt-in required for iOS ad attribution.

## 3. System Scope and Context

**Business context**

- User runs a loop of focus + break rounds, tracks days focused vs a weekly goal, shares a weekly card.
- Ad networks serve interstitial (trigger points only) and rewarded ads; AdMob server-side configuration decides whether an ad shows at a trigger (frequency caps, grace — sponsor, 2026-10-03).
- App stores distribute the binary and carry Plus purchases (StoreKit / Play Billing).
- Widget, lock-screen and Live Activity surfaces start and show a session directly.

**Technical context**

- Mobile app (React Native/Expo) is the only owned runtime. No backend in this cycle — "server-side" ad limits live in the AdMob console, not in an AppsIndie service (ADR-003).
- Local storage (MMKV/SQLite) for session log, intentions, parked thoughts, outcomes, settings, unlock trials, Plus entitlement.
- AdMob SDK for ad serving (frequency caps configured in the AdMob console; mediation evaluation later).
- StoreKit / Play Billing for Plus (yearly + lifetime) and restore; entitlement stored locally.
- Local notifications from `expo-notifications`; iOS Live Activity (ActivityKit via Expo config plugin), home-screen + lock-screen widgets.
- Optional Android AccessibilityService for app-blocking.

## 4. Solution Strategy

- **Local-first**: all state lives on device; keeps build scope within 6 weeks. The one exception is that ad frequency is decided by AdMob's server-side configuration — no owned backend (ADR-003).
- **Modular loop engine**: separate timer/loop state machine, notifications, stats, ad triggers, widget/Live Activity, share-card, entitlement, and app-blocking modules.
- **Ads at designed trigger points only**: banner on Home (free tier); interstitial triggers on leaving Loop complete and on leaving Close-out after the 2nd focus when the loop is not completed; rewarded only on explicit tap. Whether a trigger shows an ad is an AdMob console decision (caps, grace) — the app always fires the trigger.
- **Platform native APIs via Expo**: managed workflow where possible; config plugins for Live Activity and widgets; eject only if AccessibilityService requires it.

## 5. Building Block View

**Level 1 — System**

- Focus Loop mobile app (iOS + Android).

**Level 2 — Modules**

| Module                 | Responsibility                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Timer Engine           | Session duration, pause/resume, background accuracy, completion events.                                                                                      |
| Notification Scheduler | Local reminders, break alerts, persistent foreground notification on Android.                                                                                |
| Session Store          | Session log (intention, outcome, partial flag), parked thoughts, weekly-goal day counting, stats aggregation.                                                |
| Settings Store         | Rhythm preset/durations, display mode (Disc/Numbers), show-seconds, appearance, weekly goal, auto-break, sound, theme, reminder schedule, app-blocking flag. |
| Ad Broker              | Loads and shows banner, interstitial (trigger points only), rewarded ads; handles ATT; logs trigger fires and fill.                                          |
| Entitlement Store      | Plus flag (local), store receipt/restore, 24h rewarded-trial ledger.                                                                                         |
| Widget Bridge          | Home-screen, lock-screen widgets and Live Activity updates; handles surface taps into a running session.                                                     |
| Share Card             | Renders the 9:16 weekly card image (Ink/Paper/Ember) for the system share sheet.                                                                             |
| App Blocker            | Optional Android AccessibilityService wrapper.                                                                                                               |
| Analytics              | Firebase/PostHog events for D1/D7/D30, days-per-week, ad triggers/impressions, Plus funnel, share usage.                                                     |

**Level 3 — Key components (Loop Engine)**

- Loop state machine: focus -> break rounds -> long break (N and durations from Rhythm); idle/running/paused/completed per segment.
- Background timer / foreground service (Android); keeps real elapsed time for OS-kill recovery (J9).
- Event publisher (focus complete, break complete, loop complete, pause, resume).

## 6. Runtime View

**First launch -> first session (J1)**

```
User taps icon
  -> App bootstrap -> Load settings from MMKV
    -> P01 Splash -> P02 Choose display
      -> tap saves display mode AND starts a 25-min focus
        -> Loop Engine starts countdown
        -> Notification Scheduler posts foreground notification (Android)
        -> App Blocker enables if configured (Android)
        -> Render P06/P07 Focus
```

**Focus completes inside a loop (J2)**

```
Loop Engine fires focus completion
  -> Play end sound + haptic
  -> Write session to Session Store (intention, outcome pending, partial flag)
  -> Render P10 Close-out (outcome optional)
    -> if this was the 2nd focus and loop not completed -> interstitial trigger
       (AdMob server-side config decides show/skip)
    -> Render P11 Break
  -> ... xN rounds ...
  -> Last focus -> P12 Loop complete
    -> leaving P12 -> interstitial trigger (or P14 Paywall on first-ever loop)
    -> P11 Long break
```

**App killed by OS (J9)**

```
Relaunch -> P01 Splash
  -> within original duration -> resume P06/P07
  -> expired -> P13 Welcome back -> P10 or P11
```

**Purchase Plus (J7)**

```
P14 Paywall -> StoreKit / Play Billing sheet
  -> success -> Entitlement Store writes Plus flag -> P16 Welcome
  -> all ad surfaces gated off by entitlement
```

## 7. Deployment View

**Environments**

- Local dev: Expo Go / development build on device/emulator.
- SIT: internal TestFlight / Play Console internal testing.
- Production: App Store / Play Store.

**No Azure / backend in MVP.** CI/CD via GitHub Actions + EAS (Expo Application Services).

**Current shape (Pilot/MVP)**

- Single Expo/React Native app.
- Local storage only.
- AdMob directly, no mediation.
- Firebase Analytics + Crashlytics.

**Target shape (after this cycle)**

- Optional cloud sync for Plus users.
- Ad mediation for better fill.
- Wearable surfaces.

**Transition path**

1. v1 Pilot (done): timer + ads + widget — superseded by the v2.1 canvas.
2. v2 (this cycle): full loop J1–J10 — loop + breaks, Disc/Numbers, weekly goal, widgets/Live Activity, share card, Plus IAP + rewarded 24h trials, tablet.
3. Later: sync, advanced stats, wearables — re-enters Phase 1 shaping on Gate 4.

Trigger signal for transition: D7 >= 45% and ad ARPU within +/-20% of $0.23 at Month 3.

Day-one invariant for future sync: session log schema includes stable local IDs and timestamps; no foreign-key assumptions that break sync later.

## 8. Cross-cutting Concepts

**Domain concepts**

- Session: one focus interval — finished, ended early (partial), or discarded.
- Loop: N x (focus + break) + long break; the unit the UI shows.
- Weekly goal: a calendar day counts toward the goal (default 4 of 7) if >= 1 session incl. partial was recorded. **No streak anywhere.**
- Intention / parked thought: user-typed text attached to a session / offered later.
- Entitlement: Plus flag + store receipt; 24h rewarded trials are per-item local records.
- Theme/Sound pack: cosmetic, 24h rewarded trial or Plus.

**Security/authn/authz**

- No authentication. No PII leaves the device except pseudonymised analytics.

**Observability**

- Firebase Analytics events: session_start, session_complete, session_partial, loop_complete, day_counted, widget_session_start, ad_trigger_fired, ad_impression, ad_reward, paywall_view, plus_purchase, plus_restore, share_card_created, settings_change.
- Firebase Crashlytics for crashes.
- No OpenTelemetry in mobile client (use vendor SDK per AppsIndie stack).

**Error handling**

- Ad load failures are logged and do not block user flow.
- Timer inaccuracies are surfaced to analytics, not the user.
- App-blocking permission denial is handled gracefully.

**Data management**

- MMKV for settings and unlocks.
- SQLite or AsyncStorage for session log (schema must support future sync).
- No cloud backup in MVP; device backup only.

## 9. Architectural Decisions

- ADR-001: Local-first, no backend for MVP — see `docs/architecture/ADR/001-local-first-no-backend.md`
- ADR-002: React Native / Expo managed workflow — see `docs/architecture/ADR/002-react-native-expo.md`
- ADR-003: Ad limits via AdMob console, Plus entitlement local — see `docs/architecture/ADR/003-admob-server-config-plus-entitlement.md`

## 10. Quality Requirements

| Quality scenario          | Metric                            | How measured                       |
| ------------------------- | --------------------------------- | ---------------------------------- |
| Cold start to interactive | <= 1.5 s                          | Manual test / EAS profiling        |
| Timer drift over 25 min   | <= 1 s                            | Automated test with backgrounding  |
| Session log durability    | 0 unrecoverable writes            | Unit test for store error handling |
| Accessibility             | 44 dp touch targets, dynamic type | Manual inspection / lint           |

## 11. Risks and Technical Debt

| Risk                                   | Mitigation                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| Android AccessibilityService rejection | Optional, explain permission, no system-level blocking without user opt-in.       |
| iOS background timer killed            | Persistent local notification + background fetch / foreground service equivalent. |
| Ad ARPU below model                    | Monitor as kill criterion; keep ad frequency low to protect retention.            |

## 12. Glossary

- **Pomodoro**: 25-minute focus interval followed by a short break.
- **MAU**: Monthly Active Users.
- **ARPU**: Average Revenue Per User.
- **ATT**: App Tracking Transparency (iOS 14.5+).
