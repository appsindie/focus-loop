# Focus Loop — Product Spec (journey & screen level), v1.0 shaping

Concept, scope cuts, phases, business acceptance criteria and success metrics live in `PRODUCT_CONCEPT.md` and are **not repeated here**.
Design system and UI/UX standards: `DESIGN.md` (v2.0). Approved screens: `design/SNAPSHOT.md`, canvas `1791070597-62cf`. Design decisions and open points: `DESIGN_REVIEW.md`.

Normative language: **SHALL** = mandatory. Anything not stated as a rule is an implementation decision.

## Document control

- **Document ID**: PRODUCT_SPEC_LIVE.md
- **Version**: v1.1 draft (design-sync, canvas `1791070597-62cf`)
- **Status**: draft
- **Owner**: justin.nguyen@appsindie.com
- **Last updated (UTC)**: 2026-10-03

## Spec contract

- Fixes **outcomes, rules and constraints** — not implementation. Layout, components, data shapes and API design are the engineer's call.
- Every screen SHALL meet the state and accessibility baseline in `DESIGN.md`; it is not repeated per screen.
- **Push-back rule**: if implementation shows a rule is wrong, missing, or beaten by a better solution, the implementer SHALL raise it and update this spec in the same PR.
- Undecided things go to _Open questions_; they are never invented here.

## Experience principles

1. **One tap to focus** — the app exists to start a 25-minute session as fast as possible.
2. **No account, no cloud** — local storage first; sync is a premium expansion.
3. **Distraction-free timer screen** — no banners or upsells while the timer runs.
4. **Natural ad breakpoints only** — ads appear after value is delivered (session complete), not during focus.
5. **Respect platform limits** — app-blocking is optional and asks for permission at the right time.

---

# Part 1 — Journey specs

## J1 — Start a focus session · Pilot

**Value** — Pain: user sits down to work but gets pulled into their phone. Gain: a timer starts immediately and creates a boundary until break. North-star: D30 retention (daily habit) and interstitial ad show rate.

**Entry (external navigation)**

- App icon from home screen.
- Home-screen widget (J2).
- Local notification tap (J3).

**Exit**

- Success: session completes, break reminder shown, summary logged, optional ad shown.
- Alternate: user cancels session early; partial log still recorded.
- Failure: notification/permission denied, ad fails to load, timer process killed by OS.

**Internal navigation (happy path)**

```
S1.1 Home (focus setup)
  -> S1.2 Timer running
       -> S1.4 Session close-out (outcome)
            -> S1.3 Break
                 -> next focus ... (x rounds)
                      -> S1.6 Loop complete -> long break
```

**Journey rules**

- R1: A session SHALL be startable in <= 3 taps from app cold start (tap icon, tap start, optionally confirm duration).
- R2: The default session duration SHALL be 25 minutes; the user SHALL be able to change it before starting and in settings.
- R3: The timer screen SHALL NOT show banner ads, upsells, or non-timer UI during the countdown.
- R4: At session completion the app SHALL show the close-out and then a break (S1.3). An interstitial ad MAY be shown only when leaving Loop complete (S1.6), or after the 2nd completed focus if no loop completes; at most 1 per 30 minutes and never in a user's first 3 sessions.
- R5: Ending a session early SHALL always require confirmation. The partial session SHALL be saved unless the user explicitly discards it.
- R6: There is no streak. A calendar day counts toward the weekly goal (default 4 of 7 days) if at least one session, including a partial one, was recorded that day.
- R7: The user SHALL choose how time is shown (Disc or Numbers) on first launch; tapping the choice starts the first 25-minute session. The choice SHALL be switchable on the timer screen and in settings, and SHALL apply to widgets and Live Activity.
- R8: The user MAY write one intention per session; it SHALL be optional and never block starting.
- R9: While the timer runs, the user SHALL be able to park a thought without leaving the timer; parked thoughts SHALL be offered at the next session.

**Variants / failure modes**

- Timer screen killed by OS: on relaunch the app SHALL recover the active session if within the original duration, or show the elapsed time if expired.
- Notification permission denied: the app SHALL still allow manual sessions and prompt for permission only after the first session.
- Ad fails to load: the summary screen SHALL still appear; the ad load failure SHALL be logged.

**Screens**: S1.1, S1.2, S1.3, S1.4

---

## J2 — Start a session from the home-screen widget · Pilot

**Value** — Pain: opening the app and navigating is friction when user is already distracted. Gain: one-tap session start from home screen. North-star: D30 retention and session start rate.

**Entry**

- Home-screen widget on iOS / Android.

**Exit**

- Success: app opens directly to Timer running (S1.2) with default duration.
- Failure: widget not yet configured / not supported on device; fallback to S1.1.

**Internal navigation**

```
Widget tap -> S1.2 Timer running -> S1.3 Break/complete -> S1.4 Summary
```

**Journey rules**

- R1: The widget SHALL display a prominent "Focus" action.
- R2: Tapping the widget SHALL start a session with the last-used duration (default 25 min).
- R3: The widget SHALL show week progress (days focused vs goal); a medium widget SHALL show the next parked thought.

**Screens**: S1.2, S1.3, S1.4

---

## J3 — Scheduled focus reminders · MVP

**Value** — Pain: user forgets to start a planned focus block. Gain: timely nudge returns them to the app. North-star: active days per month.

**Entry**

- Local notification at scheduled time.

**Exit**

- Success: user taps notification -> S1.2 with default duration.
- Alternate: user dismisses notification.
- Failure: permission denied.

**Journey rules**

- R1: The user SHALL be able to schedule recurring reminders (e.g., weekdays 09:00 and 14:00).
- R2: Reminders SHALL use local notifications; no server required.
- R3: The app SHALL request notification permission only after the user has completed their first session.

**Screens**: S5.3 Reminder settings, S1.2 Timer running

---

## J4 — View focus stats and weekly goal · MVP

**Value** — Pain: without feedback, motivation fades. Gain: visible progress without the punishment of a broken streak. North-star: D30 retention.

**Entry**

- Stats tab from bottom navigation.

**Exit**

- Success: user views days focused vs goal, total minutes, outcomes and history.

**Journey rules**

- R1: The stats screen SHALL show days focused vs the weekly goal, minutes per day, total focus minutes and session outcomes (finished / moved forward). It SHALL NOT show streaks.
- R2: A day counts if at least one session (including partial) was recorded. Missing a day SHALL NOT reset anything.
- R4: Free users SHALL see the last 7 days of history; older history is a Plus feature.
- R3: Stats SHALL be computed locally from the session log; no backend.

**Screens**: S1.5 Stats

---

## J5 — Customise the experience · MVP

**Value** — Pain: rigid timer does not fit personal preference. Gain: user controls duration, sound, theme. North-star: session completion rate.

**Entry**

- Settings tab from bottom navigation.

**Exit**

- Success: user changes duration, sound, theme, reminder schedule.

**Journey rules**

- R1: Default focus duration SHALL be configurable (15/25/45/60 min presets and custom).
- R2: Break duration SHALL be configurable (default 5 min).
- R3: Sound options SHALL include: silent, white noise, soft chime at start/end.
- R4: Theme SHALL support at least light/dark and one accent colour; additional themes unlocked via J6.
- R5: Optional app-blocking SHALL be toggled from settings with a clear permission request.

**Screens**: S5.1 Settings, S5.2 Theme/sound picker, S5.3 Reminder settings

---

## J6 — Unlock a theme/sound pack with a rewarded ad · Pilot

**Value** — Pain: free users want personalisation without paying. Gain: small reward in exchange for an ad view. North-star: ad ARPU and retention.

**Entry**

- From S5.2 theme/sound picker when a locked item is selected.

**Exit**

- Success: rewarded video completes, item unlocked.
- Alternate: user skips ad, item remains locked.
- Failure: ad fails to load; show friendly error and allow retry.

**Journey rules**

- R1: A locked item SHALL display a "Watch ad to unlock" action.
- R2: The rewarded video SHALL only play when explicitly requested by the user.
- R3: A rewarded unlock SHALL grant a 24-hour trial of the item, persisted locally; no account. Permanent unlock is via Plus. (Open point OP-02 in `DESIGN_REVIEW.md`.)
- R4: The user SHALL be able to use the unlocked item immediately after the ad completes.

**Screens**: S5.2 Theme/sound picker, S6.1 Rewarded unlock

---

# Part 2 — Screen specs

## S1.1 — Home (focus setup)

- **Value / intent**: the fastest place to start a focus session.
- **Entry**: app cold start, back navigation from other tabs.
- **Content & data**:
  - Large "Start Focus" primary action.
  - Current duration selector (default 25 min).
  - Today's loop progress and week progress vs goal; the next parked thought.
  - Small banner ad only below the fold or in a footer (not the hero).
- **Primary action**: tap "Start Focus" -> S1.2.
- **Secondary actions**: navigate to Stats (S1.5), Settings (S5.1).
- **Rules**:
  - R1: The screen SHALL load in < 1.5 s on a mid-range device.
  - R2: "Start Focus" button SHALL be reachable within one thumb zone.
- **Metric impact**: session start rate; banner ad impressions.
- **Surface**: phone portrait; phone landscape optional.
- **Design**: high-contrast, minimal, one primary action.

## S1.2 — Timer running

- **Value / intent**: keep the user focused for the chosen duration.
- **Entry**: from S1.1, S2 widget, or S3 notification.
- **Content & data**:
  - Time remaining as a Disc or as Numbers (R7), with "Focus N of M" and the loop strip.
  - Optional intention.
  - Pause/resume, "Later, not now" (park a thought) and "End early" (with confirmation).
- **Primary action**: complete session naturally.
- **Secondary actions**: pause, park a thought, end early.
- **Rules**:
  - R1: NO banner, interstitial, or upsell while the timer runs.
  - R2: If the app is backgrounded, the countdown SHALL continue via a background timer / notification.
  - R3: If app-blocking is enabled, distracting apps SHALL be blocked while the timer is active (Android only, via AccessibilityService).
- **Metric impact**: session completion rate; active minutes.
- **Surface**: phone portrait and landscape.
- **Design**: minimal, calming, large timer, reduced motion by default.

## S1.3 — Break / session complete

- **Value / intent**: mark the transition from focus to break and deliver a natural ad breakpoint.
- **Entry**: S1.2 when countdown reaches 0 or user manually completes.
- **Content & data**:
  - Break countdown (default 5 min) shown in the user's display mode.
  - Off-screen suggestions.
- **Primary action**: start the next focus now.
- **Secondary actions**: +5 min.
- **Rules**:
  - R1: No ads on the break screen.
  - R2: Break timer SHALL be optional and skippable; auto-start of the next focus is a setting.
- **Metric impact**: interstitial show rate; next-session start rate.
- **Surface**: phone.

## S1.4 — Session close-out

- **Value / intent**: give immediate feedback and record honest progress.
- **Entry**: from S1.2 when the focus ends.
- **Content & data**:
  - Focus number and duration, the intention.
  - Optional outcome: Finished it / Moved it forward / Got stuck.
- **Primary action**: start break.
- **Secondary actions**: keep going 10 more minutes.
- **Rules**:
  - R1: Session log SHALL be written before showing the close-out.
  - R2: No ads on the close-out.

## S1.6 — Loop complete

- **Value / intent**: celebrate a full loop and offer sharing.
- **Entry**: after the last focus of a loop.
- **Content & data**: total focus minutes, one row per focus (intention, outcome), week-goal progress.
- **Primary action**: long break. **Secondary**: share my week.
- **Rules**:
  - R1: The first time this screen is left, the Plus paywall MAY be shown instead of an interstitial.
- **Metric impact**: session completion rate; share card usage.
- **Surface**: phone.

## S1.5 — Stats

- **Value / intent**: show progress to keep motivation high.
- **Entry**: Home header "Your week" icon.
- **Content & data**:
  - Days focused vs weekly goal, minutes per day (bar chart), finished / moved-forward counts.
  - History grouped by day with intention and outcome.
- **Primary action**: none (read-only).
- **Rules**:
  - R1: Data SHALL be computed from local session log.
  - R2: Empty state SHALL encourage the user to start a session.
- **Metric impact**: D30 retention.
- **Surface**: phone.

## S5.1 — Settings

- **Value / intent**: let the user control timer, sound, theme, reminders, and app-blocking.
- **Entry**: Home header settings icon.
- **Content & data**:
  - Default focus duration, break duration.
  - Sound (silent / white noise / chime).
  - Display (Disc / Numbers), appearance (Light / Dark / System), theme packs.
  - Plus, restore purchases, export and delete data, legal links and app version.
  - Reminder schedule.
  - App-blocking toggle (Android).
- **Primary action**: back to Home.
- **Rules**:
  - R1: App-blocking toggle SHALL show an explanation before requesting system permission.
  - R2: Changes SHALL save immediately; there is no Save button.
- **Metric impact**: session completion rate (sound/theme fit).
- **Surface**: phone.

## S5.2 — Theme / sound picker

- **Value / intent**: browse and unlock personalisation options.
- **Entry**: from S5.1.
- **Content & data**:
  - Grid of themes and sounds.
  - Locked items offer a 24-hour trial via a rewarded video, or Plus.
- **Primary action**: select active item or trigger rewarded ad.
- **Rules**:
  - R1: Unlocked items SHALL be usable immediately.
- **Metric impact**: rewarded ad completion rate.
- **Surface**: phone.

---

# Part 3 — Constraints, dependencies, risks

## Non-functional requirements (derived from the north-star metrics)

| NFR           | Rule                                                                 | Derived from                      |
| ------------- | -------------------------------------------------------------------- | --------------------------------- |
| Performance   | Cold start to interactive home <= 1.5 s                              | Session start rate, one-tap focus |
| Reliability   | Timer accuracy within 1 second over 25 min, even when backgrounded   | Session completion rate           |
| Offline       | All core features work without network                               | No-account, no-backend wedge      |
| Privacy       | No account, analytics pseudonymised, no PII on servers               | No backend in MVP                 |
| Accessibility | Minimum 44x44 dp touch targets, support dynamic type, reduced motion | ADHD / accessibility persona      |

Deferred (open questions, not invented): Wear OS / Apple Watch. iOS Live Activity is designed (P23); build phase not yet scheduled.

## Journey dependencies

```
J1 -> J2 (widget reuses timer engine)
J1 -> J3 (reminders need timer to be useful)
J1 -> J4 (stats need session log)
J5 -> J6 (unlock needs settings/themes)
```

J1 is the only journey that must ship in Pilot; all others depend on it.

## Risks and mitigations

| Risk                                          | Impact | Mitigation                                                                                               |
| --------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| App store rejection for "minimal utility"     | High   | Include loop, widget, Live Activity, weekly goal, stats, sounds, themes; not just a timer with a banner. |
| Android AccessibilityService policy rejection | High   | Make app-blocking optional; keep UI minimal; explain permission use.                                     |
| iOS ATT opt-in crushes eCPM                   | High   | Use contextual pre-screen; ad frequency low; monitor ARPU as kill criterion.                             |
| Organic ASO too slow                          | Medium | Target long-tail keywords first; shareable cards; widget word-of-mouth.                                  |
| Timer process killed by OS                    | Medium | Foreground service / persistent notification on Android; background timer + local notification on iOS.   |

## Open questions

1. Default session duration and preset values? Working default: 25 min, presets 15/25/45/60.
2. White noise source: bundled asset or streaming? Working default: bundled 30-second loop.
3. ATT prompt timing? Working default: at first ad load, with pre-screen.
4. Ad mediation now or later? Working default: AdMob only for Pilot; evaluate mediation in MVP.

## Review & signoff

- Product/scope: draft, pending Gate 1 review.
- Design: v2.0 hi-fi, canvas `1791070597-62cf`; approved when the design-sync PR is merged. Open points in `DESIGN_REVIEW.md`.
