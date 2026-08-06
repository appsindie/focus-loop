# Focus Loop — Architecture (arc42-lite), v1 draft

## 1. Introduction and Goals

**Business goals**
- Ship a no-account, ad-supported Pomodoro timer for iOS + Android within 6 build + 2 validation weeks.
- Prove the portfolio slot: Month-9 net monthly contribution >= $2,000 and D30 retention >= 42%.

**Quality goals**
- Offline-first core timer; no backend needed for MVP.
- Sub-1.5-second cold start.
- Accurate timer even when backgrounded.
- Reusable timer engine and widget architecture *if* it can be achieved without extra abstraction; I04 Routine Clock is not a committed consumer until it clears its own Gate 0.

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
- User starts a focus session, completes it, views streaks, unlocks themes.
- Ad networks serve interstitial and rewarded ads.
- App stores distribute the binary.
- Widget/launcher surfaces start a session directly.

**Technical context**
- Mobile app (React Native/Expo) is the only runtime. No backend in Pilot/MVP.
- Local storage (MMKV/SQLite) for session log, settings, unlocked items.
- AdMob SDK for ad serving (with mediation evaluation later).
- Local notifications from `expo-notifications`.
- Optional Android AccessibilityService for app-blocking.

## 4. Solution Strategy

- **Local-first MVP**: all state lives on device; keeps build scope within 6 weeks.
- **Modular timer engine**: separate core timer, notifications, stats, ad breakpoints, widget, and app-blocking modules.
- **Ads at natural breakpoints**: interstitial after session, rewarded for unlock, banner on setup screen only.
- **Platform native APIs via Expo**: use managed workflow where possible; eject only if AccessibilityService requires it.

## 5. Building Block View

**Level 1 — System**
- Focus Loop mobile app (iOS + Android).

**Level 2 — Modules**
| Module | Responsibility |
| --- | --- |
| Timer Engine | Session duration, pause/resume, background accuracy, completion events. |
| Notification Scheduler | Local reminders, break alerts, persistent foreground notification on Android. |
| Session Store | Local session log, streak calculation, stats aggregation. |
| Settings Store | Durations, sound, theme, reminder schedule, app-blocking flag. |
| Ad Broker | Loads and shows interstitial, rewarded, banner ads; handles ATT. |
| Widget Bridge | Updates home-screen widget and handles widget tap. |
| App Blocker | Optional Android AccessibilityService wrapper. |
| Analytics | Firebase/PostHog events for D1/D7/D30, ad impressions, revenue. |

**Level 3 — Key components (Timer Engine)**
- Timer state machine (idle, running, paused, completed).
- Background timer / foreground service (Android).
- Event publisher (completion, pause, resume).

## 6. Runtime View

**Start a session from cold start**

```
User taps icon
  -> App bootstrap
    -> Load settings from MMKV
    -> Render Home (S1.1)
      -> User taps "Start Focus"
        -> Timer Engine starts countdown
        -> Notification Scheduler posts foreground notification (Android)
        -> App Blocker enables if configured (Android)
        -> Render Timer running (S1.2)
```

**Session completes**

```
Timer Engine fires completion
  -> Play end sound
  -> Write session to Session Store
  -> Update streak
  -> Request interstitial from Ad Broker
    -> If loaded, show interstitial
    -> Always proceed to Break/Summary (S1.3 / S1.4)
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

**Target shape (MMP)**
- Optional cloud sync for power users.
- Ad mediation for better fill.
- Wearable / tablet surfaces.

**Transition path**
1. Pilot: timer + ads + widget + streak.
2. MVP: reminders + settings + stats.
3. MMP: premium IAP (sync, advanced stats, themes) if MVP clears Gate 4.

Trigger signal for transition: D7 >= 45% and ad ARPU within +/-20% of $0.23 at Month 3.

Day-one invariant for future sync: session log schema includes stable local IDs and timestamps; no foreign-key assumptions that break sync later.

## 8. Cross-cutting Concepts

**Domain concepts**
- Session: one completed or cancelled focus interval.
- Streak: consecutive calendar days with >= 1 completed session.
- Theme/Sound pack: unlockable cosmetic.

**Security/authn/authz**
- No authentication. No PII leaves the device except pseudonymised analytics.

**Observability**
- Firebase Analytics events: session_start, session_complete, session_cancel, ad_impression, ad_reward, settings_change.
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

## 10. Quality Requirements

| Quality scenario | Metric | How measured |
| --- | --- | --- |
| Cold start to interactive | <= 1.5 s | Manual test / EAS profiling |
| Timer drift over 25 min | <= 1 s | Automated test with backgrounding |
| Session log durability | 0 unrecoverable writes | Unit test for store error handling |
| Accessibility | 44 dp touch targets, dynamic type | Manual inspection / lint |

## 11. Risks and Technical Debt

| Risk | Mitigation |
| --- | --- |
| Android AccessibilityService rejection | Optional, explain permission, no system-level blocking without user opt-in. |
| iOS background timer killed | Persistent local notification + background fetch / foreground service equivalent. |
| Ad ARPU below model | Monitor as kill criterion; keep ad frequency low to protect retention. |

## 12. Glossary

- **Pomodoro**: 25-minute focus interval followed by a short break.
- **MAU**: Monthly Active Users.
- **ARPU**: Average Revenue Per User.
- **ATT**: App Tracking Transparency (iOS 14.5+).
