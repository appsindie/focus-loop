# Focus Loop v1 — End-to-End Test Report

## One-sentence summary

Ran the core focus journey on the Expo web preview (`http://localhost:8081`) and confirmed `npm run verify` passes; the timer auto-completes to Summary, stats/history update, and cancel does not record, but mouse interactions and keyboard resume are unreliable in the web build.

## What was tested and what happened

- **`npm run verify`** (repo root) — passed: `tsc --noEmit`, `eslint --max-warnings 0`, `jest --ci --coverage=false` (3 suites, 17 tests), and `prettier --check .` all green.
- **Home default state** — loaded with the `25 min` preset selected, `0 today`, `0 day streak`.
- **Settings → 1-minute session** — changed default duration to `1`, turned off sound/vibration toggles, saved, and returned Home.
- **Start/pause/resume/complete** — timer launched at `01:00`, paused correctly (timer stopped), resumed from the paused value, then counted down to `00:00` and auto-navigated to **Summary** showing `01:00` focused.
- **Stats update** — returning Home showed `1 today` / `1 day streak`; History listed one `01:00` session from today.
- **Cancel regression** — starting and immediately canceling returned Home and did **not** add a second session.

### Findings / blockers

1. **Secondary `Pressable` buttons do not respond to mouse clicks in the web preview.**
   - Start Focus (large primary button) worked with the mouse.
   - Settings, Pause, Resume, Cancel, Back, View history, and Start another did **not** respond to mouse clicks, even when zoomed in. We had to use keyboard `Tab + Enter` or `browser_console` `.click()` to drive them.
2. **Keyboard resume after pause repeatedly triggered Cancel.**
   - After pausing with `Tab + Space/Enter`, pressing `Tab + Space/Enter` again returned Home instead of resuming (same result in two attempts). `button.click()` in the console resumed correctly, so the timer logic itself is fine; the focus/keyboard routing in the web bundle is broken.
3. **Home gives no visual indication of a non-preset default duration.**
   - When the default was set to `1` minute, none of the `15/25/45` preset buttons were selected. The correct duration was still used (`01:00` timer), but there was no active-state cue on Home.
4. **Notification / vibration settings cannot be physically verified in the browser.**
   - The toggles are persisted and passed into `useTimer`, and the code routes them to `Vibration.vibrate()` and `scheduleNotificationAsync({ sound })`. In the browser, `expo-notifications` only logs a warning that push-token listening is not supported; no console errors appeared.

## `npm run verify` output

```
> focus-loop@1.0.0 verify
> cd apps/mobile && npm run verify

> mobile@1.0.0 verify
> npm run verify:types && npm run verify:lint && npm run verify:test && npm run verify:format

> mobile@1.0.0 verify:types
> tsc --noEmit

> mobile@1.0.0 verify:lint
> eslint . --max-warnings 0

> mobile@1.0.0 verify:test
> jest --ci --coverage=false

PASS src/features/timer/useTimer.test.tsx
PASS src/features/timer/SessionStore.test.ts
PASS src/features/settings/SettingsStore.test.ts

Test Suites: 3 passed, 3 total
Tests:       17 passed, 17 total
Snapshots:   0 total
Time:        0.449 s, estimated 1 s
Ran all test suites.

> mobile@1.0.0 verify:format
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

## Evidence

### Home default state (25 min selected, 0/0)

![Home default](https://app.devin.ai/attachments/12e7c2af-a81e-4b14-9bb1-74bcb64a41bb/ss_4ebcf1fb.png)

### Settings screen before changing duration

![Settings default](https://app.devin.ai/attachments/b652934b-ebff-46f9-b677-a2e5f9cd24fd/ss_df6370e2.png)

### Timer launched at 01:00

![Timer focusing](https://app.devin.ai/attachments/2e285215-0e3f-468d-ad0d-cce43310f59b/ss_899ebbc4.png)

### Timer paused at 00:31

![Timer paused 00:31](https://app.devin.ai/attachments/3e5ef3ac-7bab-4500-84ce-40094c1e5131/ss_33a8ccbb.png)

### Timer paused at 00:52 (console-driven pause)

![Timer paused 00:52](https://app.devin.ai/attachments/4b5a23cb-c91f-4d52-b097-77dd19e43377/ss_67685140.png)

### Timer resumed at 00:50

![Timer resumed](https://app.devin.ai/attachments/9d7fb444-3b90-4b6e-b34d-206a44eacf71/ss_1476d47c.png)

### Summary screen after natural completion

![Summary](https://app.devin.ai/attachments/ef6b9a8c-6b32-4aa7-80e6-2dc1d8569592/ss_8614c096.png)

### Home after completion (1 today / 1 day streak)

![Home after completion](https://app.devin.ai/attachments/e8cd3241-08c3-419d-ae7f-0f57497faa7f/ss_2530f7f3.png)

### History with one completed session

![History one session](https://app.devin.ai/attachments/2d48dd48-1e75-464e-923f-e18fad73d030/ss_d00221c0.png)

### Home after cancel regression (still 1/1)

![Home after cancel](https://app.devin.ai/attachments/599f41ee-0623-4332-bfa2-c004b4f5f38d/ss_b7428148.png)

### History after cancel regression (still one session)

![History after cancel](https://app.devin.ai/attachments/5b8b9ba7-035b-4ff7-8a66-d49de7f7ef99/ss_95b46ca0.png)

## Recording

- `/home/ubuntu/screencasts/focus-loop-e2e/focus-loop-e2e-edited.mp4`

## Suggested PR comment for the lead to post

```
E2E run completed against `release/v1` on the Expo web preview.

PASS:
- `npm run verify` is green (types + lint + 17 Jest tests + prettier).
- Home loads with 25 min default and 0/0 stats.
- Settings can change default duration; timer starts with the chosen duration.
- Timer pause/resume logic works when driven programmatically.
- Timer reaches 0 and auto-navigates to Summary.
- Sessions today and streak update on Home; History shows the completed session.
- Cancel returns Home without recording a session.

BLOCKERS / UX REGRESSIONS:
- Secondary Pressable buttons (Settings, Pause/Resume, Cancel, Back, View history, Start another) do not respond to mouse clicks in the web build.
- Keyboard `Tab + Enter/Space` to resume after a pause repeatedly triggers Cancel instead of Resume.
- When the default duration is a non-preset (e.g. 1 min), Home shows no selected preset.

Proof: ![Summary](https://app.devin.ai/attachments/ef6b9a8c-6b32-4aa7-80e6-2dc1d8569592/ss_8614c096.png)
![Home after completion](https://app.devin.ai/attachments/e8cd3241-08c3-419d-ae7f-0f57497faa7f/ss_2530f7f3.png)
Full report: /home/ubuntu/repos/focus-loop/test-report.md
Recording: /home/ubuntu/screencasts/focus-loop-e2e/focus-loop-e2e-edited.mp4
```

## SKILL.md suggestion

- `/home/ubuntu/repos/focus-loop/.agents/skills/testing-focus-loop-web/SKILL.md` — notes on running the Expo web preview, handling the notification permission prompt, and the current mouse/keyboard interaction limitations in `react-native-web`.

## Suggested blueprint updates

- The repo has no `environment.yaml`. Seed one with `maintenance: npm install` and commands for `npm run verify` and `npx expo start --web` to make future E2E setups reproducible.

## Anything still needed from the user / lead

- Decision on whether the web-Preview mouse/keyboard interaction regressions are release-blocking or can be deferred to a native-device QA pass.
