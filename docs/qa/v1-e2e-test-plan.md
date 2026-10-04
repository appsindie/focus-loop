# Focus Loop v1 — Core Focus Journey E2E Test Plan

## Preconditions

- Repo `/home/ubuntu/repos/focus-loop` is on branch `release/v1`.
- Dependencies installed (`npm install` at root, `postinstall` installs `apps/mobile`).
- `npm run verify` passes.
- Expo web dev server running at `http://localhost:8081`.
- Chrome opened with a fresh profile so `AsyncStorage`/`localStorage` is empty.

## Test 1: Settings-driven 1-minute focus session (happy path)

| Step | Action                                                                         | Expected result                                                                                                                                                                                                                                                        | Source evidence                                                  |
| ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1.1  | Load `http://localhost:8081` in Chrome.                                        | Home screen renders: title **"Focus Loop"**, subtitle **"Choose a session length"**, three preset buttons **15 min**, **25 min** (selected/green), **45 min**, a primary **"Start Focus"** button, stats **"0 today"** and **"0 day streak"**, and **"View history"**. | `HomeScreen.tsx` L4, L44-64, L77-94                              |
| 1.2  | Tap **"Settings"** (top right).                                                | Settings screen renders with **"Default focus length (minutes)" = 25**, **"Sound on completion" ON**, **"Vibration on completion" ON**, and an enabled **"Save"** button.                                                                                              | `SettingsScreen.tsx` L20-92, `SettingsStore.ts` L11              |
| 1.3  | Change default focus length to **1**, turn **OFF** both toggles, tap **Save**. | App returns to Home.                                                                                                                                                                                                                                                   | `SettingsScreen.tsx` L44-88, `App.tsx` L100-104                  |
| 1.4  | Tap **"Start Focus"**.                                                         | Timer screen appears with title **"Focusing"** and countdown **"01:00"**.                                                                                                                                                                                              | `TimerScreen.tsx` L21-31, `App.tsx` L119-128                     |
| 1.5  | Wait ~2 seconds.                                                               | Countdown shows **"00:58"** or **"00:59"** and title stays **"Focusing"**.                                                                                                                                                                                             | `useTimer.ts` L75-84                                             |
| 1.6  | Tap **"Pause"**.                                                               | Title changes to **"Paused"**, control button changes to **"Resume"**, and countdown stops.                                                                                                                                                                            | `TimerScreen.tsx` L35-63, `useTimer.ts` L106-115                 |
| 1.7  | Wait ~3 seconds.                                                               | Displayed time does **not** decrease from the paused value.                                                                                                                                                                                                            | `useTimer.ts` L106-115 (pausedMsRef)                             |
| 1.8  | Tap **"Resume"**.                                                              | Title returns to **"Focusing"** and countdown resumes.                                                                                                                                                                                                                 | `useTimer.ts` L117-133                                           |
| 1.9  | Allow the 1-minute timer to reach **00:00**.                                   | Timer screen title changes to **"Completed"** and shows **"Focus session complete"**.                                                                                                                                                                                  | `TimerScreen.tsx` L22-37, `useTimer.ts` L51-64, L75-84           |
| 1.10 | Wait for auto-transition.                                                      | **SummaryScreen** renders with **"Session complete"**, focused pill **"01:00"**, and **"Start another"**.                                                                                                                                                              | `App.tsx` L61-72 (onComplete effect), `SummaryScreen.tsx` L10-36 |
| 1.11 | Tap **"Start another"**.                                                       | Home shows **"1 today"** and **"1 day streak"**.                                                                                                                                                                                                                       | `App.tsx` L44-48, `SessionStore.ts` L91-119                      |
| 1.12 | Tap **"View history"**.                                                        | History screen lists exactly **one** completed session with duration **"01:00"** and today's date.                                                                                                                                                                     | `HistoryScreen.tsx` L16-61                                       |

## Test 2: Cancel regression

| Step | Action                                                                     | Expected result                                                                             | Source evidence                          |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 2.1  | On Home (after Test 1), tap **"Start Focus"** (default is still 1 minute). | Timer screen appears with **"01:00"** and title **"Focusing"**.                             | `App.tsx` L74-77                         |
| 2.2  | Tap **"Cancel"**.                                                          | App returns to Home immediately.                                                            | `App.tsx` L79-82, `useTimer.ts` L135-146 |
| 2.3  | Check stats and history.                                                   | Stats remain **"1 today"** and **"1 day streak"**; history still shows exactly one session. | `SessionStore.ts` L62-76                 |

## Non-UI verification

- Run `npm run verify` at repo root. Pass criteria: `tsc --noEmit` exits 0, `eslint` exits 0, `jest --ci --coverage=false` reports all suites passed, `prettier --check .` reports no formatting issues.

## Native-device SIT additions (J4/J6 surfaces — reviewers CR-15..24)

These cases cannot run in jest or the web preview; they ride on the RR-01 native SIT build before Gate 3.

| Step | Action | Expected result | Source |
| --- | --- | --- | --- |
| N1 | Start a focus, background the app, let the step end. Check iOS home widget + Live Activity and the Android widgets + ongoing notification. | Widgets show "Done"/idle once endsAt passes (iOS post-endsAt timeline entry; Android "until HH:MM" stays truthful); Live Activity and the ongoing notification are gone — teardown is unconditional, not flag-gated (CR-15/17/19/21). | `FocusLoopWidgets.swift`, `Module.swift`, `androidOngoingNotification.ts`, `FocusStartWidget.tsx` |
| N2 | Same but force-kill the app mid-focus, reopen, dismiss welcome-back. | No orphaned Live Activity / sticky notification (CR-17). | `useLoopController.ts` boot teardown |
| N3 | Widget end-race: end a focus then immediately start another from the widget. | The new Live Activity survives; the old one ends (CR-18 outgoing-set capture). | `Module.swift` |
| N4 | P19 share: flip "Show what I worked on" ON, confirm the preview updates to the exact card, tap Share image on BOTH an Android and an iOS device. | Preview == shared PNG; no blank/cropped output from the off-screen capture (CR-23/24). | `ShareScreen.tsx` |
| N5 | Complete 3 loops with a "Finished" outcome on a device where the store sheet is unavailable, then a 4th where it is. | Sheet requested on the 4th, not spent early (CR-22). | `reviewPrompt.ts` |
| N6 | Play a focus sound (P15), lock the screen, let a 5+ min step run. | iOS: sound keeps looping through silent switch + lock screen (CR-34 — `setAudioModeAsync` background flags; `UIBackgroundModes audio` ships via the expo-audio plugin). Android: OS stops sustained background audio at ~3 min unless lock-screen controls are active — accepted OS limitation for v1, verify sound resumes on next app open/step. | `focusSounds.ts` |
| N7 | On a phone (iOS + Android), rotate to landscape in every screen. | Everything stays portrait — iOS via `UISupportedInterfaceOrientations` (portrait-only on iPhone), Android via the runtime lock (one manifest cannot split device classes) (S10-04). | `app.json`, `App.tsx` |
| N8 | On a tablet, rotate and relaunch. | All four orientations work; layout re-flows (S10-04). | `app.json`, `App.tsx` |
| N9 | Edit a reminder's time on device and let both the old and new times pass. | Only the new time fires — the edited identifier carries hour+minute so the stale schedule is cancelled (S9-01). | `reminderScheduler.ts` |
| N10 | Delete all data with reminders + evening note enabled, then foreground the app. | No notification fires after the wipe; settings show reminders OFF — the in-memory reset precedes the schedule clear (S9-02). | `deleteAllData.ts`, `App.tsx` |
