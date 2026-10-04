# Focus Loop — Product Spec (journey & screen level), v1.0 shaping

Concept, scope cuts, phases, business acceptance criteria and success metrics live in `PRODUCT_CONCEPT.md` and are **not repeated here**.
Design system and UI/UX standards: `DESIGN.md` (v2.1). Approved screens: `design/SNAPSHOT.md`, canvas `1791071241-7cd3`. Design decisions and sponsor answers: `DESIGN_REVIEW.md`.

Normative language: **SHALL** = mandatory. Anything not stated as a rule is an implementation decision.

## Document control

- **Document ID**: PRODUCT_SPEC_LIVE.md
- **Version**: v1.0 draft (re-shaped on canvas `1791071241-7cd3`)
- **Status**: draft
- **Owner**: justin.nguyen@appsindie.com
- **Last updated (UTC)**: 2026-10-04

## Spec contract

- Fixes **outcomes, rules and constraints** — not implementation. Layout, components, data shapes and API design are the engineer's call.
- Every screen SHALL meet the state and accessibility baseline in `DESIGN.md`; it is not repeated per screen.
- **Push-back rule**: if implementation shows a rule is wrong, missing, or beaten by a better solution, the implementer SHALL raise it and update this spec in the same PR.
- Undecided things go to _Open questions_; they are never invented here.

## Experience principles

1. **One tap to focus** — cold start to running timer in ≤ 2 taps on first launch, 1 tap from Home or a widget afterwards.
2. **The loop, not the session** — the unit is a loop of N × (focus + break) + long break; the app always shows where the user is in it.
3. **Two ways to see time** — Disc or Numbers, chosen on first launch, switchable on the Focus screen; every surface follows the choice.
4. **No shame** — no streaks, no red failure states; ended-early and "Got stuck" sessions still count toward the weekly goal.
5. **No account, no cloud** — local storage first; sync is a Plus expansion.
6. **Ads only after value** — never on Focus, Break, Close-out or any sheet. The design fixes where ads may trigger; AdMob server-side configuration decides whether they show (sponsor, 2026-10-03).
7. **Respect platform limits** — app-blocking is optional and asks for permission at the right time.

---

# Part 1 — Journey specs

Journey numbering follows the design journey map `design/source/J-Map.dc.html` (rendered `design/png/J-Map.png`). Old spec ids: design J3 was spec J1-R5; J4 was J2; J5 was J3; J6 was J4; J8 was J6; J9 was a J1 variant; J10 was J5.

All journeys ship together in v1 — sponsor decision 2026-10-03 ("dev het slices version nay, chua lên store nên v1 thôi"), recorded in `DESIGN_REVIEW.md` round 7. An earlier release-slice/fast-follow split (shaping review SR-02/SR-07) is superseded; the dependency graph in Part 3 is the build-order guide inside the cycle.

## J1 — First app open

**Value** — Pain: a distracted user cannot survive onboarding. Gain: the first session is running in ≤ 2 taps, before they can wander. North-star: D1/D30 retention and session start rate.

**Entry (external navigation)**

- App icon from the OS launcher, cold start.

**Exit**

- Success: first 25-minute focus started and a display mode (Disc or Numbers) saved.
- Failure: app killed during first run — nothing is persisted until the first session starts, so relaunch just repeats the flow.

**Internal navigation (happy path)**

```
P01 Splash -> P02 Choose display -> P06/P07 Focus (25 min starts on tap)
   -> P10 Close-out -> P03 Notification pre-prompt -> OS permission -> P11 Break
```

**Journey rules**

- R1: Tapping a display card on P02 SHALL save the choice **and** start the first 25-minute focus — no extra Start button, no account, no other onboarding pages.
- R2: The notification pre-prompt (P03) SHALL appear only after the first completed focus and SHALL list exactly the three notification types the app sends (break over, back-to-focus, scheduled reminder). "Not now" SHALL NOT re-ask within 7 days.
- R3: First-launch flow SHALL be shown exactly once.

**Variants / failure modes**

- Permission denied at P03: the app continues normally; manual sessions unaffected.

**Screens**: SCR-splash, SCR-first-launch, SCR-focus, SCR-closeout, SCR-notification-ask, SCR-break

---

## J2 — A daily loop

**Value** — Pain: one isolated timer is not a work rhythm. Gain: N × (focus + break) + long break as one guided unit. North-star: D30 retention and interstitial ad show rate.

**Entry**

- P04/P05 Home primary action; P24 widget (J4); P22 reminder notification (J5).

**Exit**

- Success: loop completes -> P12 Loop complete -> long break.
- Alternate: loop abandoned mid-way via J3; partial sessions still count.
- Failure: app killed by OS -> J9.

**Internal navigation**

```
P04 Home -> P06/P07 Focus -> (SHT-later parked thoughts) -> P10 Close-out
   -> P11 Break -> P06 ... xN -> P12 Loop complete
   -> interstitial trigger (AdMob server decides) -> P11 Long break
```

**Journey rules**

- R1: A loop SHALL be N rounds of (focus + break) + one long break; N and durations come from Rhythm (P21, default Classic 25/5 ×4 + 15).
- R2: The user MAY write one intention per focus; it SHALL be optional and never block starting.
- R3: While the timer runs the user SHALL be able to park a thought via SHT-later without leaving the timer; parked thoughts SHALL surface on Home, in the Next-up widget, and at the next session.
- R4: At each focus completion the app SHALL write the session log before showing P10, then show P11 break. Close-out outcome (Finished / Moved forward / Got stuck) is optional; skipping records no outcome.
- R5: Interstitial trigger points are only: leaving P12 Loop complete, and leaving P10 after the 2nd completed focus when the loop is not completed. Whether an ad actually shows (frequency caps, new-user grace) is decided by **AdMob server-side configuration**, not the app (sponsor, 2026-10-03).
- R6: There is no streak. A calendar day counts toward the weekly goal (default 4 of 7 days — sponsor, 2026-10-03) if at least one session, including a partial one, was recorded that day.
- R7: Time display is Disc or Numbers per the saved choice (R7 in J1 applies); switchable on the Focus screen and in Settings, applying to widgets and Live Activity.
- R8: "Start breaks automatically" is a P10 toggle; when on, the next focus auto-starts when the break ends with a notification.

**Variants / failure modes**

- Ad fails to load at a trigger: the next screen SHALL still appear; the failure SHALL be logged.
- Break skipped or extended (+5 min) SHALL be supported.

**Screens**: SCR-home, SCR-focus, SHT-later, SCR-closeout, SCR-break, SCR-loop-complete

---

## J3 — Stopping midway

**Value** — Pain: interrupted sessions feel like failure and get quit entirely. Gain: an honest partial record that still counts. North-star: session completion rate; retention via no-shame.

**Entry**

- Pause or "End early…" on P06/P07.

**Exit**

- Success: SHT-end-early -> Keep going (resume), End and save N min (partial logged -> P10), or Discard.
- Failure: none — the timer is paused while the sheet is open.

**Internal navigation**

```
P06/P07 Focus -> Pause -> P09 End-early sheet
   -> Keep going -> P06/P07
   -> End and save N min -> P10 Close-out (partial)
   -> Discard this session -> P04 Home
```

**Journey rules**

- R1: Ending early SHALL always require confirmation — there is no one-tap cancel.
- R2: A partial session SHALL be saved unless the user explicitly discards it, and SHALL count toward the weekly goal.
- R3: The sheet SHALL show minutes already focused ("End and save N min").

**Screens**: SCR-focus, SHT-end-early, SCR-closeout

---

## J4 — Start from outside the app

**Value** — Pain: opening the app is friction when already distracted. Gain: session start without touching Home. North-star: session start rate; target ≥ 10% of sessions widget-initiated (J-Map).

**Entry**

- Home-screen widget (P24 small "Focus 25"; medium "Next up"), lock-screen widget and Live Activity (P23).

**Exit**

- Success: app opens directly to P06/P07 running.
- Failure: widget unsupported/unconfigured -> falls back to P04 Home.

**Internal navigation**

```
P24 Widget "Focus 25" -> P06/P07 Focus (skip Home)
   -> P23 Live Activity (Android parity: foreground-service notification) + "Break time" notification -> P11 Break
```

**Journey rules**

- R1: The widget SHALL start a session with the last-used duration (default 25 min) without showing Home first.
- R2: The widget SHALL show week progress (days focused vs goal); the medium widget SHALL show the next parked thought with a Start action.
- R3: Live Activity SHALL follow the display choice (disc + "about X min", or numbers + "Break at HH:MM") and SHALL expose a Pause action.
- R4: Lock-screen widgets SHALL show the circular disc gauge and "N of G days".

**Screens**: P24 Widgets, SCR-focus, P23 Live Activity, SCR-break

---

## J5 — Scheduled focus reminders

**Value** — Pain: user forgets a planned focus block. Gain: timely nudge back to the app. North-star: active days per month.

**Entry**

- Local notification at a scheduled time.

**Exit**

- Success: tap -> P06/P07 with default duration.
- Alternate: dismiss.
- Failure: permission denied — reminders silently unavailable.

**Internal navigation**

```
P20 Settings -> P22 Reminders -> P23 local notification -> P06/P07 Focus
```

**Journey rules**

- R1: Reminders SHALL be recurring weekly schedules (time + weekday chips, per-reminder toggle); purely local, no server.
- R2: An optional gentle evening note on goal days SHALL exist and SHALL default to off.
- R3: Notification permission SHALL be requested only after the first completed focus (J1-R2).

**Screens**: SCR-settings, SCR-reminders, SCR-focus

---

## J6 — View progress and share it

**Value** — Pain: without feedback, motivation fades. Gain: visible week progress and a shareable card that feeds organic growth. North-star: D30 retention; share card usage.

**Entry**

- Home header "Your week" / Stats tab; "Share my week" on P12 Loop complete.

**Exit**

- Success: user views week/history or shares a card via the system share sheet.
- Failure: share cancelled — nothing recorded.

**Internal navigation**

```
P04 Home -> P17 Week -> P18 History / P19 Share preview -> system share sheet
```

**Journey rules**

- R1: The Week screen SHALL show days focused vs the weekly goal ("N of G", "Goal met" at N ≥ G), minutes per day, total minutes and outcomes; it SHALL NOT show streaks.
- R2: A day counts if at least one session (including partial) was recorded; missing a day SHALL NOT reset anything.
- R3: Free users SHALL see the last 7 days of history; older history is Plus.
- R4: Stats SHALL be computed locally from the session log; no backend.
- R5: The share card SHALL offer styles Ink / Paper / Ember, SHALL always carry the app name, and "Show what I worked on" SHALL default to off (privacy).
- R6: The review prompt SHALL use the store review API after the 3rd completed loop containing at least one "Finished" outcome.

**Screens**: SCR-week, SCR-history, SCR-share, SCR-loop-complete

---

## J7 — Upgrade to Plus

**Value** — Pain: free users hit limits (7-day history, locked themes, ads). Gain: revenue without ads for subscribers. North-star: net contribution alongside ad ARPU.

**Entry**

- First time leaving P12 Loop complete (paywall MAY be shown instead of an interstitial); Settings Plus card; locked item on P15.

**Exit**

- Success: purchase -> P16 Welcome to Plus.
- Alternate: close (×) — always visible top right.
- Failure: store error/cancel -> stay on P14; Restore purchases available.

**Internal navigation**

```
P12 Loop complete (first time) / P20 Settings / P15 locked item
   -> P14 Paywall -> StoreKit / Play Billing -> P16 PlusWelcome
```

**Journey rules**

- R1: The paywall SHALL never appear before the user's first session.
- R2: Plans: **Yearly $19.99 with a 7-day free trial, Lifetime $49.99** (sponsor, 2026-10-03). Prices SHALL come from the store, never hard-coded.
- R3: Plus SHALL remove all ads (banner, interstitial), unlock all themes/sounds permanently, and unlock full history.
- R4: Restore purchases SHALL be available on P14 and in Settings.
- R5: Entitlement SHALL be stored locally and be restorable via the store receipt; no account.

**Screens**: SCR-paywall, SCR-plus-welcome, SCR-settings

---

## J8 — Try a theme via rewarded ad

**Value** — Pain: free users want personalisation without paying. Gain: rewarded revenue and a Plus upsell path. North-star: ad ARPU and retention.

**Entry**

- P15 Themes & sounds: tapping a locked item opens its trial card.

**Exit**

- Success: rewarded video completes -> item unlocked for 24 hours.
- Alternate: user dismisses the card.
- Failure: ad fails to load -> toast "Couldn't load the video. Try again"; retry allowed.

**Journey rules**

- R1: The rewarded video SHALL play only after an explicit tap on the trial card.
- R2: A rewarded unlock SHALL grant a **24-hour trial** of that one item, persisted locally; permanent unlock is via Plus only (sponsor, 2026-10-03).
- R3: The item SHALL be usable immediately after the ad completes.
- R4: Plus-only items SHALL be labelled "Plus" and SHALL NOT offer a rewarded trial.

**Screens**: SCR-themes-sounds, SCR-settings

---

## J9 — App killed by the OS

**Value** — Pain: OS kills the timer mid-session and the user loses the run. Gain: seamless recovery with no blame. North-star: session completion rate.

**Entry**

- Cold start while a session was in progress.

**Exit**

- Success: session resumed in P06/P07 if time remains, or confirmed-saved via P13 Welcome back -> P10 or P11.
- Failure: none user-visible; elapsed-time recovery is the failure path.

**Internal navigation**

```
OS kill -> relaunch -> P01 Splash
   -> within original duration -> P06/P07 (resume)
   -> expired -> P13 Welcome back -> P10 "How did it go?" or "Skip to break" -> P11
```

**Journey rules**

- R1: The countdown SHALL continue in the background (foreground service / local notification) so recovery knows real elapsed time.
- R2: P13 SHALL confirm the session was saved with no blame copy.
- R3: A recovered-then-ended session counts like any other partial/full session.

**Screens**: SCR-splash, SCR-focus, SCR-welcome-back, SCR-closeout, SCR-break

---

## J10 — Customise the experience

**Value** — Pain: a rigid timer does not fit personal preference. Gain: the user's own rhythm, look and data control. North-star: session completion rate.

**Entry**

- P20 Settings from Home header or tabs.

**Exit**

- Success: preferences saved immediately; rhythm/display/theme/reminders changed.

**Journey rules**

- R1: Rhythm SHALL offer presets Classic 25/5×4, Gentle start 15/5, Deep work 50/10×3, and Custom (steppers for focus, break, long break, rounds); the loop strip and "One loop = …" SHALL update live.
- R2: Settings SHALL cover: display (Disc/Numbers), appearance (Light/Dark/System), Show seconds (default **on** — sponsor, 2026-10-03; affects Numbers only), vibrate at end, weekly goal, auto-start breaks, themes & sounds, reminders, app-blocking (Android, opt-in with explanation), Plus card + Restore, data export (CSV) and delete-all (confirmed), About (Privacy, Terms, Ad choices, licenses, contact), app version.
- R3: Changes SHALL save immediately; there is no Save button.
- R4: "Delete all data…" SHALL ask for confirmation.

**Screens**: SCR-settings, SCR-rhythm, SCR-reminders, SCR-themes-sounds

---

# Part 2 — Screen specs

Design reference per screen is `design/png/<name>.png` rendered from `design/source/*.dc.html`; interaction rules live in `DESIGN.md` §4. Screen-level state and accessibility baseline is `DESIGN.md` §2/§6 — not repeated here.

## SCR-splash — P01

- **Intent**: brand mark while the app restores state.
- **Entry**: every cold start.
- **Data**: none.
- **Primary action**: none — auto-advance.
- **Rules**: R1 Mark + wordmark on `bg`, no spinner. R2 Route by state: fresh install -> P02; active session with time left -> P06/P07; session ended while closed -> P13; else -> P04/P05.
- **Metric**: cold-start latency. **Design**: `P01-Splash`.

## SCR-first-launch — P02

- **Intent**: pick Disc or Numbers once, start instantly.
- **Entry**: P01 on first launch only.
- **Data**: two full-width cards ("See it" / "Read it").
- **Primary action**: tap a card — saves choice and starts the first 25-min focus.
- **Rules**: R1 No account, no other onboarding, no permission prompts here.
- **Metric**: first-session start rate. **Design**: `P02-FirstLaunch`.

## SCR-notification-ask — P03

- **Intent**: honest pre-prompt before the OS dialog.
- **Entry**: after the first completed focus (J1-R2).
- **Data**: the three notification types the app sends.
- **Primary action**: enable notifications (then OS dialog).
- **Rules**: R1 "Not now" SHALL NOT re-ask within 7 days.
- **Metric**: notification opt-in rate. **Design**: `P03-NotifAsk`.

## SCR-home — P04 / P05

- **Intent**: one-tap start plus today/loop/week context.
- **Entry**: tabs/back nav, post-J9 recovery (none active).
- **Data**: date, "Focus N of M", loop strip with "Loop ends HH:MM", optional intention field, latest parked thought ("use this"), today and week summary, primary Start with duration; P05 = new-week empty state ("A new week."), never zeros-as-failure.
- **Primary action**: Start focus -> P06/P07.
- **Rules**: R1 Banner ad 320×50 only at the very bottom, free tier only. R2 Home SHALL load < 1.5 s on a mid-range device.
- **Metric**: session start rate; banner impressions. **Design**: `P04-Home`, `P05-HomeFresh`, tablet `T01`.

## SCR-focus — P06 / P07

- **Intent**: keep the user in the session; two display modes.
- **Entry**: Home, P02, widget, reminder, recovery.
- **Data**: "FOCUS N OF M" header + display toggle; disc (280px + "about X min left") or numbers (200px + seconds 56px `faint`, "minutes left · ends HH:MM" — seconds per Settings, default on); optional serif intention; loop strip + "Next: 5 min break"; controls Pause/Resume, "Later, not now…", "End early…".
- **Primary action**: none forced — completing the session.
- **Rules**: R1 No ads, banners or upsells. R2 Countdown continues when backgrounded (J9). R3 Keep screen awake. R4 Display toggle switchable here. R5 Android app-blocking active only if enabled in Settings.
- **Metric**: session completion rate; active minutes. **Design**: `P06-Focus`, `P07-FocusNumbers`, tablet `T02`/`T06`.

## SHT-later — P08 (sheet)

- **Intent**: park a thought without leaving focus.
- **Entry**: "Later, not now…" on P06/P07.
- **Data**: one text field + list of parked thoughts.
- **Primary action**: Park it (or Cancel).
- **Rules**: R1 Timer keeps running. R2 Parked thoughts appear on Home, the Next-up widget and the next session.
- **Design**: `P08-Later`.

## SHT-end-early — P09 (sheet)

- **Intent**: confirm ending early, honestly record partials.
- **Entry**: "End early…" on P06/P07.
- **Data**: minutes focused.
- **Primary action**: Keep going; then End and save N min -> P10; text action Discard.
- **Rules**: R1 Timer pauses while open. R2 Partial sessions count toward the week.
- **Design**: `P09-EndEarly`.

## SCR-closeout — P10

- **Intent**: mark how the focus went; honest data.
- **Entry**: focus ends (naturally, end-early, or via J9/P13).
- **Data**: "FOCUS N DONE · 25 MIN" header + intention; single-choice Finished / Moved forward / Got stuck ("still counts"); "Start breaks automatically" toggle.
- **Primary action**: Start break -> P11; text action "Keep going, 10 more minutes".
- **Rules**: R1 Session log written before display. R2 No ad on this screen; the 2nd-focus trigger point is on **leaving** it when the loop is not completed (J2-R5).
- **Metric**: outcome capture rate. **Design**: `P10-Closeout`.

## SCR-break — P11 (short and long)

- **Intent**: real rest, inside the same loop.
- **Entry**: P10, P12 (long break), "Break time" notification.
- **Data**: break countdown in the user's display mode; three off-screen suggestions; "+5 min"; "Focus N now".
- **Primary action**: start next focus (or return).
- **Rules**: R1 No ads. R2 Break skippable; auto-start of next focus is the P10 setting. R3 Long break variant follows P12 with its own duration.
- **Metric**: next-session start rate. **Design**: `P11-Break`, tablet `T03`.

## SCR-loop-complete — P12

- **Intent**: celebrate the loop and open monetisation/share.
- **Entry**: last focus of the loop completes.
- **Data**: total focus minutes, full loop strip, one row per focus (intention, outcome), week-goal line.
- **Primary action**: Long break -> P11; secondary "Share my week" -> P19.
- **Rules**: R1 First time leaving this screen the paywall MAY be shown instead of an interstitial (J7). R2 Otherwise interstitial trigger on leaving (J2-R5).
- **Metric**: share rate; paywall impressions. **Design**: `P12-LoopDone`.

## SCR-welcome-back — P13

- **Intent**: recover a killed session without blame.
- **Entry**: P01 when the session expired while closed.
- **Data**: saved-session confirmation.
- **Primary action**: "How did it go?" -> P10; secondary "Skip to break" -> P11.
- **Design**: `P13-WelcomeBack`.

## SCR-paywall — P14

- **Intent**: convert earned goodwill into Plus.
- **Entry**: J7 entry points only.
- **Data**: five benefits, plan picker (Yearly 7-day trial / Lifetime), prices from store, Restore / Terms / Privacy.
- **Primary action**: "Start free trial".
- **Rules**: R1 Close (×) always visible. R2 Never before the first session.
- **Metric**: trial start rate; conversion. **Design**: `P14-Paywall`.

## SCR-themes-sounds — P15

- **Intent**: personalise within the design system.
- **Entry**: Settings.
- **Data**: disc-colour radio swatches (locked = lock badge + "try with an ad" name), focus sounds (Plus-only labelled "Plus"), trial card "Try X for 24 hours" with Watch video / Get Plus.
- **Primary action**: select item or start rewarded video.
- **Rules**: R1 Rewarded only on explicit tap; 24h local trial (J8-R2). R2 Load failure -> toast, retry allowed.
- **Metric**: rewarded completion rate. **Design**: `P15-Themes`.

## SCR-plus-welcome — P16

- **Intent**: confirm Plus and route back.
- **Entry**: successful purchase/restore.
- **Data**: ads-gone confirmation + links to the three most valuable unlocks.
- **Primary action**: "Back to my loop".
- **Design**: `P16-PlusWelcome`.

## SCR-week — P17

- **Intent**: weekly progress without streak shame.
- **Entry**: Stats tab / Home "Your week".
- **Data**: "N of G days", "Goal met" when N ≥ G, per-day bars, minutes/finished/moved-forward counts, one plain-language insight.
- **Primary action**: none (read-only); segmented Week | History.
- **Rules**: R1 No streak counts anywhere. R2 Local computation only.
- **Metric**: D30 retention. **Design**: `P17-Week`, tablet `T04`.

## SCR-history — P18

- **Intent**: honest log by day.
- **Entry**: Week | History segment.
- **Data**: sessions grouped by day — time · intention (or "No note") · outcome; "Ended early" marked.
- **Rules**: R1 Free tier last 7 days; footer "See all with Plus".
- **Design**: `P18-History`, tablet `T04`.

## SCR-share — P19

- **Intent**: organic growth via a 9:16 weekly card.
- **Entry**: P12 "Share my week" / History.
- **Data**: card preview, styles Ink/Paper/Ember, "Show what I worked on" toggle (default off).
- **Primary action**: "Share image" -> system share sheet.
- **Rules**: R1 Card always carries the app name.
- **Metric**: share-card usage; attributed installs. **Design**: `P19-Share`.

## SCR-settings — P20

- **Intent**: single place for every preference and legal/data control.
- **Entry**: Home settings icon / tabs.
- **Data**: per J10-R2 order (Show time as · Appearance · Rhythm · Weekly goal · auto-breaks · Show seconds · Vibrate · Themes & sounds · Reminders · Plus card + Restore · Your data · About · version).
- **Primary action**: back to Home.
- **Rules**: R1 Saves immediately. R2 App-blocking toggle explains before the system permission ask. R3 "Delete all data…" confirms.
- **Design**: `P20-Settings`, tablet `T05` master–detail.

## SCR-rhythm — P21

- **Intent**: tune the loop itself.
- **Entry**: Settings -> Rhythm.
- **Data**: presets Classic 25/5×4, Gentle start 15/5, Deep work 50/10×3, Custom; steppers for focus/break/long-break/rounds; live loop strip + "One loop = …".
- **Primary action**: apply (immediate save).
- **Design**: `P21-Rhythm`.

## SCR-reminders — P22

- **Intent**: recurring local reminders.
- **Entry**: Settings -> Reminders.
- **Data**: times with weekday chips + per-reminder toggle; "Add a reminder"; optional evening goal-day note (off by default).
- **Design**: `P22-Reminders`.

## P23 — Live Activity & notifications (surface)

- **Intent**: keep the loop visible outside the app.
- **Data**: follows display choice — disc + intention + "about X min", or numbers + "Break at HH:MM"; Pause action; notifications "Break time", "Back to it", "Time to focus" — no marketing notifications.
- **Rules**: R1 iOS Live Activity for the running focus/break. R2 Android parity via the foreground-service notification.
- **Design**: `P23-LockScreen` (board).

## P24 — Widgets (surface)

- **Intent**: one-tap focus from the OS surfaces.
- **Data**: small idle = full disc + "N/G days" + Focus 25; small running = "Focus N of M" + minutes left + break time; medium "Next up" = most recent parked thought + Start; lock screen = circular disc gauge + inline "N of G days" (ships with P23, per J4 Entry).
- **Rules**: R1 Actions per J4-R1/R2.
- **Metric**: widget-initiated session share (target ≥ 10%). **Design**: `P24-Widgets` (board).

## Tablet (T01–T06)

- Rules per `DESIGN.md` §4 Tablet: 48 padding; Home and Week/History two-column; Settings master–detail; Focus landscape split (540px disc left / controls right), portrait Numbers 380px; banner 320×50 right column, free tier only. Every phone screen spec above applies; tablet is a layout of the same screens, not new journeys.

---

# Part 3 — Constraints, dependencies, risks

## Non-functional requirements (derived from the north-star metrics)

| NFR           | Rule                                                                  | Derived from                      |
| ------------- | --------------------------------------------------------------------- | --------------------------------- |
| Performance   | Cold start to interactive home <= 1.5 s; first session <= 2 taps      | Session start rate, one-tap focus |
| Reliability   | Timer accuracy within 1 second over a full focus, incl. backgrounded  | Session completion rate           |
| Offline       | All core features work without network (ads degrade, never block)     | No-account, no-backend wedge      |
| Privacy       | No account, analytics pseudonymised, no PII on servers                | No backend in MVP                 |
| Accessibility | >= 44x44 dp targets, Dynamic Type (timer capped 1.3x), Reduced Motion | ADHD / accessibility persona      |

Deferred (open questions, not invented): Wear OS / Apple Watch. iOS Live Activity is designed (P23); Android equivalent is the persistent foreground notification.

## Journey dependencies

```
J1 -> J2 (loop needs the timer)
J2 -> J4 (widget starts the same loop)
J2 -> J5 (reminders re-enter the loop)
J2 -> J6 (week/history need the session log)
J2 -> J7/J8 (monetisation only after value)
J10 -> J2 (rhythm defines the loop)
J3, J9 are variants of J2
```

J1+J2 are the minimum the rest builds on; monetisation and stats ride on them.

## Risks and mitigations

| Risk                                          | Impact | Mitigation                                                                                            |
| --------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| App store rejection for "minimal utility"     | High   | Loop, widget, Live Activity, weekly goal, stats, share card, themes — not just a timer with a banner. |
| Android AccessibilityService policy rejection | High   | App-blocking optional; UI minimal; permission use explained.                                          |
| iOS ATT opt-in crushes eCPM                   | High   | Contextual pre-screen; frequency controlled in AdMob console; monitor ARPU as kill criterion.         |
| IAP added to an ad-funded app confuses tiers  | Medium | Paywall only after value; rewarded trial is Plus preview; Plus removes every ad.                      |
| Organic ASO too slow                          | Medium | Long-tail keywords first; shareable cards; widget word-of-mouth.                                      |
| Timer killed by OS                            | Medium | Foreground service / persistent notification on Android; background timer + local notif on iOS.       |

## Open questions

1. ~~Default session duration / presets~~ — resolved by design: Rhythm presets 25/5×4, 15/5, 50/10×3, Custom.
2. White noise source: bundled asset or streaming? Working default: bundled 30-second loop.
3. ATT prompt timing? Working default: at first ad load, with pre-screen.
4. Ad mediation now or later? Working default: AdMob only for Pilot; evaluate mediation in MVP.
5. ~~Show seconds default~~ — resolved (sponsor, 2026-10-03): default on, Numbers only.
6. ~~Weekly goal value~~ — resolved (sponsor, 2026-10-03): 4 of 7 days; streak removed.
7. ~~Plus pricing~~ — resolved (sponsor, 2026-10-03): Yearly $19.99 7-day trial, Lifetime $49.99.
8. Ad frequency values (caps, grace period) — configured server-side in AdMob; revisit after 4 weeks of data (growth-owned, OP-07).

## Review & signoff

- Product/scope: draft, pending Gate 1 review on this re-shape.
- Design: v2.1 hi-fi, canvas `1791071241-7cd3`; approved when design-sync PR #2 merges. Open points in `DESIGN_REVIEW.md`.
